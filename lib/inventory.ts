// Inventory/business logic for offline POS

import { getDB } from "./db"
import type { AvailabilityResult, ID, Product, RawMaterial, ProductMaterial } from "./types"
import { nanoid } from "nanoid"

function nowISO() {
  return new Date().toISOString()
}

// Helper time utilities
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
}
function withinRange(iso: string, from: Date, to: Date) {
  const t = new Date(iso).getTime()
  return t >= from.getTime() && t < to.getTime()
}

// Compute product availability based on raw materials
export async function checkProductAvailability(productId: ID): Promise<AvailabilityResult> {
  const db = getDB()
  const mappings = await db.product_materials.where("product_id").equals(productId).toArray()
  if (!mappings.length) return { ok: true } // product tidak membutuhkan bahan baku

  const materialIds = mappings.map((m) => m.material_id)
  const materials = await db.raw_materials.where("id").anyOf(materialIds).toArray()
  const map: Record<number, RawMaterial> = Object.fromEntries(materials.map((m) => [m.id!, m]))

  const missing: AvailabilityResult["missing"] = []
  for (const m of mappings) {
    const mat = map[m.material_id]
    const available = mat?.stock_quantity ?? 0
    const required = m.quantity_needed
    if (available < required) {
      missing?.push({
        material_id: m.material_id,
        name: mat?.name ?? "Unknown",
        required,
        available,
        unit: mat?.unit ?? "-",
      })
    }
  }

  return { ok: (missing?.length ?? 0) === 0, missing }
}

// Evaluate all products and toggle is_active automatically
export async function evaluateAllProductsAvailability(): Promise<{ changed: ID[] }> {
  const db = getDB()
  const products = await db.products.toArray()
  const changed: ID[] = []

  await db.transaction("rw", db.products, db.product_materials, db.raw_materials, async () => {
    for (const p of products) {
      const result = await checkProductAvailability(p.id!)
      const shouldActive = result.ok
      if (p.is_active !== shouldActive) {
        await db.products.update(p.id!, {
          is_active: shouldActive,
          updated_at: nowISO(),
        })
        changed.push(p.id!)
      }
    }
  })

  return { changed }
}

// Create pending transaction with snapshot prices
export async function createPendingTransaction(params: {
  items: Array<{ product_id: ID; quantity: number }>
  payment_method: string
  cashier_name: string
}) {
  const db = getDB()
  const receipt = nanoid(10)
  const { items, payment_method, cashier_name } = params

  const productIds = items.map((i) => i.product_id)
  const products = await db.products.where("id").anyOf(productIds).toArray()
  const productMap: Record<number, Product> = Object.fromEntries(products.map((p) => [p.id!, p]))

  // Snapshot items with current unit_price
  const txId = await db.transaction("rw", db.transactions, db.transaction_items, async () => {
    const txId = await db.transactions.add({
      cashier_name,
      payment_method,
      receipt_number: receipt,
      status: "pending",
      total_amount: 0,
      transaction_date: nowISO(),
    })

    let total = 0
    for (const i of items) {
      const p = productMap[i.product_id]
      if (!p) throw new Error("Produk tidak ditemukan")
      const unit_price = p.price
      const total_price = unit_price * i.quantity
      total += total_price
      await db.transaction_items.add({
        transaction_id: txId,
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price,
        total_price,
      })
    }
    await db.transactions.update(txId, { total_amount: total })
    return txId
  })

  return { transaction_id: txId, receipt_number: receipt }
}

// Mark transaction as paid: re-check stock and subtract atomically
export async function markTransactionPaid(transaction_id: ID) {
  const db = getDB()

  await db.transaction(
    "rw",
    db.transactions,
    db.transaction_items,
    db.product_materials,
    db.raw_materials,
    db.products,
    async () => {
      // Lock-like behavior: re-read items
      const items = await db.transaction_items.where("transaction_id").equals(transaction_id).toArray()
      if (!items.length) throw new Error("Item transaksi tidak ditemukan")

      // Aggregate required materials for all items
      // Map material_id -> required_total
      const requiredTotals = new Map<ID, number>()

      for (const item of items) {
        const maps = await db.product_materials.where("product_id").equals(item.product_id).toArray()
        for (const m of maps) {
          const add = m.quantity_needed * item.quantity
          requiredTotals.set(m.material_id, (requiredTotals.get(m.material_id) ?? 0) + add)
        }
      }

      // Fetch materials and validate availability
      const materialIds = Array.from(requiredTotals.keys())
      const mats = await db.raw_materials.where("id").anyOf(materialIds).toArray()
      const matMap = new Map<ID, RawMaterial>(mats.map((m) => [m.id!, m]))

      const insufficient: Array<{ material_id: ID; name: string; need: number; have: number }> = []
      for (const [mid, need] of requiredTotals.entries()) {
        const mat = matMap.get(mid)
        const have = mat?.stock_quantity ?? 0
        if (have < need) {
          insufficient.push({ material_id: mid, name: mat?.name ?? "Unknown", need, have })
        }
      }

      if (insufficient.length) {
        // Also ensure related products are disabled
        await evaluateAllProductsAvailability()
        const detail = insufficient.map((i) => `${i.name}: perlu ${i.need}, tersedia ${i.have}`).join(", ")
        throw new Error(`Stok bahan tidak cukup: ${detail}`)
      }

      // Subtract stocks
      for (const [mid, need] of requiredTotals.entries()) {
        const mat = matMap.get(mid)!
        await db.raw_materials.update(mid, {
          stock_quantity: mat.stock_quantity - need,
          updated_at: nowISO(),
        })
      }

      // Set transaction status to paid
      await db.transactions.update(transaction_id, { status: "paid" })

      // Re-evaluate product availability after stock change
      await evaluateAllProductsAvailability()
    },
  )

  return { ok: true }
}

// Cancel transaction: no stock changes
export async function cancelTransaction(transaction_id: ID) {
  const db = getDB()
  await db.transactions.update(transaction_id, { status: "canceled" })
  return { ok: true }
}

// Seed demo data when DB empty (runs once on first open)
export async function seedIfEmpty() {
  const db = getDB()
  const count = await db.products.count()
  if (count > 0) return

  await db.transaction("rw", db.products, db.raw_materials, db.product_materials, async () => {
    // Raw materials
    const rice = await db.raw_materials.add({
      name: "Beras",
      unit: "gram",
      stock_quantity: 5000,
      created_at: nowISO(),
      updated_at: nowISO(),
    })
    const chicken = await db.raw_materials.add({
      name: "Ayam",
      unit: "gram",
      stock_quantity: 3000,
      created_at: nowISO(),
      updated_at: nowISO(),
    })
    const spice = await db.raw_materials.add({
      name: "Bumbu",
      unit: "gram",
      stock_quantity: 1000,
      created_at: nowISO(),
      updated_at: nowISO(),
    })

    // Products
    const nasi_ayam = await db.products.add({
      name: "Nasi Ayam",
      price: 20000,
      is_active: true,
      image_url: "",
      category: "Makanan", //
      created_at: nowISO(),
      updated_at: nowISO(),
    })
    const ayam_goreng = await db.products.add({
      name: "Ayam Goreng",
      price: 15000,
      is_active: true,
      image_url: "",
      category: "Makanan", //
      created_at: nowISO(),
      updated_at: nowISO(),
    })

    // Mapping product -> materials per unit
    await db.product_materials.bulkAdd([
      { product_id: nasi_ayam, material_id: rice, quantity_needed: 150 },
      { product_id: nasi_ayam, material_id: chicken, quantity_needed: 100 },
      { product_id: nasi_ayam, material_id: spice, quantity_needed: 10 },
      { product_id: ayam_goreng, material_id: chicken, quantity_needed: 150 },
      { product_id: ayam_goreng, material_id: spice, quantity_needed: 8 },
    ])

    // Evaluate availability on initial load
    await evaluateAllProductsAvailability()
  })
}

// Owner Dashboard data type
type OwnerDashboardData = {
  daily: {
    todaySales: number
    todayTransactions: number
    cashPayments: number
    cashlessPayments: number
    topProduct: { name: string; quantity: number }
    recentTransactions: Array<{ id: string; time: string; amount: number; method: "cash" | "cashless" }>
  }
  payment: {
    cashAmount: number
    cashlessAmount: number
    totalAmount: number
    cashTransactions: number
    cashlessTransactions: number
    totalTransactions: number
  }
  monthly: {
    monthlySales: number
    monthlyTransactions: number
    cashPayments: number
    cashlessPayments: number
    topProduct: { name: string; quantity: number; revenue: number }
    salesGrowth: number
    transactionGrowth: number
    dailyBreakdown: Array<{ date: string; sales: number; transactions: number }>
    peakHours: Array<{ hour: string; transactions: number; percentage: number }>
  }
}

// Aggregate transactions from IndexedDB for Owner Dashboard
export async function getOwnerDashboardData(): Promise<OwnerDashboardData> {
  const db = getDB()
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  // Ambil semua transaksi 'paid'
  const allPaid = await db.transactions.where("status").equals("paid").toArray()

  // Pisahkan hari ini dan 30 hari terakhir
  const last30Start = new Date(now)
  last30Start.setDate(now.getDate() - 29)
  const prev30Start = new Date(now)
  prev30Start.setDate(now.getDate() - 59)
  const prev30End = new Date(now)
  prev30End.setDate(now.getDate() - 29)

  const todayPaid = allPaid.filter((t) => withinRange(t.transaction_date, todayStart, todayEnd))
  const last30Paid = allPaid.filter((t) => withinRange(t.transaction_date, startOfDay(last30Start), endOfDay(now)))
  const prev30Paid = allPaid.filter((t) =>
    withinRange(t.transaction_date, startOfDay(prev30Start), endOfDay(prev30End)),
  )

  // Helper: ambil semua item untuk kumpulan transaksi
  async function itemsFor(transactions: typeof allPaid) {
    const ids = transactions.map((t) => t.id!) as number[]
    if (!ids.length) return []
    return db.transaction_items.where("transaction_id").anyOf(ids).toArray()
  }

  const todayItems = await itemsFor(todayPaid)
  const last30Items = await itemsFor(last30Paid)

  // Peta produk untuk nama
  const productIds = Array.from(new Set(last30Items.map((i) => i.product_id)))
  const products = await db.products.where("id").anyOf(productIds).toArray()
  const productMap = new Map(products.map((p) => [p.id!, p]))

  // Harian
  const todaySales = todayPaid.reduce((s, t) => s + (t.total_amount || 0), 0)
  const todayTransactions = todayPaid.length
  const cashPayments = todayPaid.filter((t) => t.payment_method === "cash").reduce((s, t) => s + t.total_amount, 0)
  const cashlessPayments = todayPaid.filter((t) => t.payment_method !== "cash").reduce((s, t) => s + t.total_amount, 0)

  // Top product hari ini (berdasarkan quantity)
  const qtyByProductToday = new Map<number, number>()
  for (const it of todayItems) {
    qtyByProductToday.set(it.product_id, (qtyByProductToday.get(it.product_id) ?? 0) + it.quantity)
  }
  const topEntryToday = Array.from(qtyByProductToday.entries()).sort((a, b) => b[1] - a[1])[0]
  const topProductToday = topEntryToday
    ? {
        name: productMap.get(topEntryToday[0])?.name ?? "Produk",
        quantity: topEntryToday[1],
      }
    : { name: "—", quantity: 0 }

  // Transaksi terbaru (maks 5)
  const recentTransactions = todayPaid
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
    .slice(0, 5)
    .map((t) => ({
      id: t.receipt_number,
      time: t.transaction_date,
      amount: t.total_amount,
      method: (t.payment_method === "cash" ? "cash" : "cashless") as "cash" | "cashless",
    }))

  // Bulanan (30 hari)
  const monthlySales = last30Paid.reduce((s, t) => s + t.total_amount, 0)
  const monthlyTransactions = last30Paid.length
  const monthlyCash = last30Paid.filter((t) => t.payment_method === "cash").reduce((s, t) => s + t.total_amount, 0)
  const monthlyCashless = last30Paid.filter((t) => t.payment_method !== "cash").reduce((s, t) => s + t.total_amount, 0)

  // Top product 30 hari (berdasarkan revenue)
  const revenueByProduct = new Map<number, { qty: number; revenue: number }>()
  for (const it of last30Items) {
    const stat = revenueByProduct.get(it.product_id) ?? { qty: 0, revenue: 0 }
    stat.qty += it.quantity
    stat.revenue += it.total_price
    revenueByProduct.set(it.product_id, stat)
  }
  const topMonthly = Array.from(revenueByProduct.entries()).sort((a, b) => b[1].revenue - a[1].revenue)[0]
  const topProductMonthly = topMonthly
    ? {
        name: productMap.get(topMonthly[0])?.name ?? "Produk",
        quantity: topMonthly[1].qty,
        revenue: topMonthly[1].revenue,
      }
    : { name: "—", quantity: 0, revenue: 0 }

  // Pertumbuhan vs 30 hari sebelumnya
  const prev30Sales = prev30Paid.reduce((s, t) => s + t.total_amount, 0)
  const prev30Count = prev30Paid.length
  const salesGrowth = prev30Sales > 0 ? ((monthlySales - prev30Sales) / prev30Sales) * 100 : 0
  const transactionGrowth = prev30Count > 0 ? ((monthlyTransactions - prev30Count) / prev30Count) * 100 : 0

  // Breakdown harian (30 hari)
  const dailyMap = new Map<string, { sales: number; transactions: number }>()
  for (let i = 0; i < 30; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() - (29 - i))
    const key = d.toISOString().slice(0, 10)
    dailyMap.set(key, { sales: 0, transactions: 0 })
  }
  for (const t of last30Paid) {
    const key = t.transaction_date.slice(0, 10)
    const rec = dailyMap.get(key)
    if (rec) {
      rec.sales += t.total_amount
      rec.transactions += 1
    }
  }
  const dailyBreakdown = Array.from(dailyMap.entries()).map(([date, v]) => ({ date, ...v }))

  // Peak hours (top 5 jam teratas dalam 30 hari)
  const hours = Array.from({ length: 24 }, (_, h) => h)
  const hourCount = new Map<number, number>()
  for (const t of last30Paid) {
    const h = new Date(t.transaction_date).getHours()
    hourCount.set(h, (hourCount.get(h) ?? 0) + 1)
  }
  const sortedHours = hours
    .map((h) => [h, hourCount.get(h) ?? 0] as const)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const maxHourTx = sortedHours[0]?.[1] ?? 1
  const peakHours = sortedHours.map(([h, tx]) => ({
    hour: `${String(h).padStart(2, "0")}:00-${String((h + 1) % 24).padStart(2, "0")}:00`,
    transactions: tx,
    percentage: (tx / maxHourTx) * 100,
  }))

  return {
    daily: {
      todaySales,
      todayTransactions,
      cashPayments,
      cashlessPayments,
      topProduct: topProductToday,
      recentTransactions,
    },
    payment: {
      cashAmount: monthlyCash, // gunakan 30 hari agar grafik pembayaran punya data lebih banyak
      cashlessAmount: monthlyCashless,
      totalAmount: monthlyCash + monthlyCashless,
      cashTransactions: last30Paid.filter((t) => t.payment_method === "cash").length,
      cashlessTransactions: last30Paid.filter((t) => t.payment_method !== "cash").length,
      totalTransactions: monthlyTransactions,
    },
    monthly: {
      monthlySales,
      monthlyTransactions,
      cashPayments: monthlyCash,
      cashlessPayments: monthlyCashless,
      topProduct: topProductMonthly,
      salesGrowth,
      transactionGrowth,
      dailyBreakdown,
      peakHours,
    },
  }
}

// Get products from DB
export async function getProducts(): Promise<Product[]> {
  const db = getDB()
  return db.products.orderBy("name").toArray()
}

// Search raw materials by keyword
export async function searchMaterials(keyword: string) {
  const db = getDB()
  const q = keyword.trim().toLowerCase()
  if (!q) return db.raw_materials.orderBy("name").limit(20).toArray()
  const all = await db.raw_materials.toArray()
  return all.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 50)
}

// Get product -> materials mapping with material details
export async function getProductMaterials(
  product_id: ID,
): Promise<Array<{ material_id: ID; quantity_needed: number; name: string; unit: string }>> {
  const db = getDB()
  const maps = await db.product_materials.where("product_id").equals(product_id).toArray()
  if (!maps.length) return []
  const matIds = maps.map((m) => m.material_id)
  const mats = await db.raw_materials.where("id").anyOf(matIds).toArray()
  const mapById = new Map(mats.map((m) => [m.id!, m]))
  return maps.map((m) => {
    const mat = mapById.get(m.material_id)
    return {
      material_id: m.material_id,
      quantity_needed: m.quantity_needed,
      name: mat?.name ?? "Unknown",
      unit: mat?.unit ?? "-",
    }
  })
}

// Upsert a single product_material entry
export async function upsertProductMaterial(params: { product_id: ID; material_id: ID; quantity_needed: number }) {
  const db = getDB()
  const existing = await db.product_materials
    .where("[product_id+material_id]")
    .equals([params.product_id, params.material_id])
    .first()

  await db.transaction("rw", db.product_materials, async () => {
    if (existing?.id) {
      await db.product_materials.update(existing.id, { quantity_needed: params.quantity_needed })
    } else {
      await db.product_materials.add({
        product_id: params.product_id,
        material_id: params.material_id,
        quantity_needed: params.quantity_needed,
      })
    }
  })

  // re-evaluate availability after change
  await evaluateAllProductsAvailability()
}

// Remove a mapping
export async function removeProductMaterial(params: { product_id: ID; material_id: ID }) {
  const db = getDB()
  const existing = await db.product_materials
    .where("[product_id+material_id]")
    .equals([params.product_id, params.material_id])
    .first()
  if (existing?.id) {
    await db.product_materials.delete(existing.id)
    await evaluateAllProductsAvailability()
  }
}

// Create product with mappings (full replacement for mappings)
export async function createProductWithMaterials(params: {
  name: string
  price: number
  is_active?: boolean
  image_url?: string
  category?: string //
  materials?: Array<{ material_id: ID; quantity_needed: number }>
}) {
  const db = getDB()
  const now = new Date().toISOString()
  const id = await db.transaction("rw", db.products, db.product_materials, async () => {
    const productId = await db.products.add({
      name: params.name,
      price: params.price,
      is_active: params.is_active ?? true,
      image_url: params.image_url || "",
      category: params.category || "", //
      created_at: now,
      updated_at: now,
    })
    if (params.materials?.length) {
      await db.product_materials.bulkAdd(
        params.materials.map((m) => ({
          product_id: productId,
          material_id: m.material_id,
          quantity_needed: m.quantity_needed,
        })),
      )
    }
    return productId
  })

  await evaluateAllProductsAvailability()
  return id
}

// Update product and replace mappings
export async function updateProductWithMaterials(params: {
  id: ID
  name: string
  price: number
  is_active: boolean
  image_url?: string
  category?: string //
  materials: Array<{ material_id: ID; quantity_needed: number }>
}) {
  const db = getDB()
  const now = new Date().toISOString()
  await db.transaction("rw", db.products, db.product_materials, async () => {
    await db.products.update(params.id, {
      name: params.name,
      price: params.price,
      is_active: params.is_active,
      ...(typeof params.image_url === "string" ? { image_url: params.image_url } : {}),
      ...(typeof params.category === "string" ? { category: params.category } : {}), //
      updated_at: now,
    })
    // remove old mappings then re-add
    const olds = await db.product_materials.where("product_id").equals(params.id).toArray()
    if (olds.length) await db.product_materials.bulkDelete(olds.map((o) => o.id!))
    if (params.materials.length) {
      await db.product_materials.bulkAdd(
        params.materials.map((m) => ({
          product_id: params.id,
          material_id: m.material_id,
          quantity_needed: m.quantity_needed,
        })),
      )
    }
  })

  await evaluateAllProductsAvailability()
}

// Optional: add raw material quickly
export async function addRawMaterial(params: { name: string; unit: string; stock_quantity: number }) {
  const db = getDB()
  const now = new Date().toISOString()
  const exists = (await db.raw_materials.where("name").equalsIgnoreCase(params.name).first()) || null
  if (exists?.id) return exists.id
  const id = await db.raw_materials.add({
    name: params.name,
    unit: params.unit,
    stock_quantity: params.stock_quantity,
    created_at: now,
    updated_at: now,
  })
  await evaluateAllProductsAvailability()
  return id
}

// Demo seed: ensure Extrajoss, Susu SKM, and Jossu combo exist
export async function seedExamplesIfMissing() {
  const db = getDB()
  // Materials
  let skm = await db.raw_materials.where("name").equalsIgnoreCase("Susu SKM").first()
  let exj = await db.raw_materials.where("name").equalsIgnoreCase("Extrajoss").first()
  if (!skm) {
    await addRawMaterial({ name: "Susu SKM", unit: "sachet", stock_quantity: 100 })
    skm = await db.raw_materials.where("name").equalsIgnoreCase("Susu SKM").first()
  }
  if (!exj) {
    await addRawMaterial({ name: "Extrajoss", unit: "sachet", stock_quantity: 100 })
    exj = await db.raw_materials.where("name").equalsIgnoreCase("Extrajoss").first()
  }

  // Product: Jossu
  let jossu = await db.products.where("name").equalsIgnoreCase("Jossu").first()
  if (!jossu) {
    const id = await createProductWithMaterials({
      name: "Jossu",
      price: 8000,
      is_active: true,
      image_url: "",
      category: "Minuman", //
      materials: [
        { material_id: exj!.id!, quantity_needed: 1 },
        { material_id: skm!.id!, quantity_needed: 1 },
      ],
    })
    jossu = await db.products.get(id)
  } else {
    // ensure mappings exist
    const maps = await db.product_materials.where("product_id").equals(jossu.id!).toArray()
    const need: ProductMaterial[] = []
    if (!maps.find((m) => m.material_id === exj!.id))
      need.push({ product_id: jossu.id!, material_id: exj!.id!, quantity_needed: 1 })
    if (!maps.find((m) => m.material_id === skm!.id))
      need.push({ product_id: jossu.id!, material_id: skm!.id!, quantity_needed: 1 })
    if (need.length) await db.product_materials.bulkAdd(need)
  }

  await evaluateAllProductsAvailability()
}

// CRUD + queries for raw materials including low-stock detection

export async function listRawMaterials(keyword?: string) {
  const db = getDB()
  const all = await db.raw_materials.orderBy("name").toArray()
  const q = keyword?.trim().toLowerCase()
  if (!q) return all
  return all.filter((m) => m.name.toLowerCase().includes(q))
}

export async function createRawMaterial(payload: {
  name: string
  unit: string
  stock_quantity: number
  min_stock?: number
}) {
  const db = getDB()
  const now = nowISO()
  const id = await db.raw_materials.add({
    name: payload.name,
    unit: payload.unit,
    stock_quantity: Number(payload.stock_quantity) || 0,
    min_stock: Number(payload.min_stock ?? 0),
    created_at: now,
    updated_at: now,
  })
  await evaluateAllProductsAvailability()
  return id
}

export async function updateRawMaterial(
  id: ID,
  payload: Partial<{ name: string; unit: string; stock_quantity: number; min_stock: number }>,
) {
  const db = getDB()
  await db.raw_materials.update(id, {
    ...(payload.name !== undefined ? { name: payload.name } : {}),
    ...(payload.unit !== undefined ? { unit: payload.unit } : {}),
    ...(payload.stock_quantity !== undefined ? { stock_quantity: Number(payload.stock_quantity) } : {}),
    ...(payload.min_stock !== undefined ? { min_stock: Number(payload.min_stock) } : {}),
    updated_at: nowISO(),
  })
  await evaluateAllProductsAvailability()
}

export async function deleteRawMaterial(id: ID) {
  const db = getDB()
  await db.transaction("rw", db.product_materials, db.raw_materials, async () => {
    const maps = await db.product_materials.where("material_id").equals(id).toArray()
    if (maps.length) await db.product_materials.bulkDelete(maps.map((m) => m.id!))
    await db.raw_materials.delete(id)
  })
  await evaluateAllProductsAvailability()
}

export async function getLowStockMaterials() {
  const db = getDB()
  const all = await db.raw_materials.toArray()
  return all.filter((m) => (m.min_stock ?? 0) > 0 && m.stock_quantity <= (m.min_stock ?? 0))
}

// Optional alias for search usage
export async function searchRawMaterials(keyword: string) {
  return listRawMaterials(keyword)
}
