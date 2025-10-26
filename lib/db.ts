// Dexie-based offline database (IndexedDB)

import Dexie, { type Table } from "dexie"
import type { Product, RawMaterial, ProductMaterial, Transaction, TransactionItem } from "./types"

class POSDB extends Dexie {
  products!: Table<Product, number>
  raw_materials!: Table<RawMaterial, number>
  product_materials!: Table<ProductMaterial, number>
  transactions!: Table<Transaction, number>
  transaction_items!: Table<TransactionItem, number>

  constructor() {
    super("pos_offline_db")
    // Versioned schema for evolution
    this.version(1).stores({
      products: "++id, name, price, is_active, updated_at",
      raw_materials: "++id, name, unit, stock_quantity, updated_at",
      product_materials: "++id, product_id, material_id, quantity_needed, [product_id+material_id]",
      transactions: "++id, status, transaction_date, receipt_number, cashier_name, total_amount",
      transaction_items: "++id, transaction_id, product_id, quantity, unit_price, total_price",
    })
    this.version(2)
      .stores({
        products: "++id, name, price, is_active, updated_at",
        raw_materials: "++id, name, unit, stock_quantity, min_stock, updated_at",
        product_materials: "++id, product_id, material_id, quantity_needed, [product_id+material_id]",
        transactions: "++id, status, transaction_date, receipt_number, cashier_name, total_amount",
        transaction_items: "++id, transaction_id, product_id, quantity, unit_price, total_price",
      })
      .upgrade(async (tx) => {
        await tx
          .table("raw_materials")
          .toCollection()
          .modify((m: any) => {
            if (typeof m.min_stock !== "number") m.min_stock = 0
          })
      })
    this.version(3)
      .stores({
        products: "++id, name, price, is_active, image_url, updated_at",
        raw_materials: "++id, name, unit, stock_quantity, min_stock, updated_at",
        product_materials: "++id, product_id, material_id, quantity_needed, [product_id+material_id]",
        transactions: "++id, status, transaction_date, receipt_number, cashier_name, total_amount",
        transaction_items: "++id, transaction_id, product_id, quantity, unit_price, total_price",
      })
      .upgrade(async (tx) => {
        await tx
          .table("products")
          .toCollection()
          .modify((p: any) => {
            if (!p.image_url) p.image_url = ""
          })
      })
    this.version(4)
      .stores({
        products: "++id, name, price, is_active, image_url, category, updated_at",
        raw_materials: "++id, name, unit, stock_quantity, min_stock, updated_at",
        product_materials: "++id, product_id, material_id, quantity_needed, [product_id+material_id]",
        transactions: "++id, status, transaction_date, receipt_number, cashier_name, total_amount",
        transaction_items: "++id, transaction_id, product_id, quantity, unit_price, total_price",
      })
      .upgrade(async (tx) => {
        await tx
          .table("products")
          .toCollection()
          .modify((p: any) => {
            if (typeof p.category !== "string") p.category = ""
          })
      })
  }
}

let _db: POSDB | null = null

export function getDB() {
  if (!_db) _db = new POSDB()
  return _db
}
