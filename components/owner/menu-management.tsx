"use client"
import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Search, Save, X, Trash2 } from "lucide-react"
import {
  getProducts,
  searchMaterials,
  getProductMaterials,
  createProductWithMaterials,
  updateProductWithMaterials,
  seedExamplesIfMissing,
} from "@/lib/inventory"
import type { ID } from "@/lib/types"

type DBProduct = {
  id: ID
  name: string
  price: number
  is_active: boolean
  image_url?: string
  category?: string
}

type SelectedMat = { material_id: ID; name: string; unit: string; quantity_needed: number }

export function MenuManagement() {
  const [products, setProducts] = useState<DBProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<DBProduct[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showInactive, setShowInactive] = useState(false)
  const [editingId, setEditingId] = useState<ID | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState<{
    name: string
    price: number
    is_active: boolean
    image_url?: string
    category?: string
  }>({
    name: "",
    price: 0,
    is_active: true,
    image_url: "",
    category: "",
  })
  const existingCategories = useMemo(
    () => Array.from(new Set(products.map((p) => (p as any).category).filter(Boolean))) as string[],
    [products],
  )
  const [useNewCategory, setUseNewCategory] = useState(false)

  async function load() {
    await seedExamplesIfMissing()
    const list = await getProducts()
    setProducts(
      list.map((p) => ({
        id: p.id!,
        name: p.name,
        price: p.price,
        is_active: p.is_active,
        image_url: p.image_url,
        category: (p as any).category,
      })),
    )
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    let filtered = products
    if (searchQuery) filtered = filtered.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    if (!showInactive) filtered = filtered.filter((p) => p.is_active)
    setFilteredProducts(filtered)
  }, [products, searchQuery, showInactive])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price)

  const [selectedMats, setSelectedMats] = useState<SelectedMat[]>([])

  async function openAdd() {
    setEditingId(null)
    setForm({ name: "", price: 0, is_active: true, image_url: "", category: "" })
    setUseNewCategory(false)
    setSelectedMats([])
    setIsDialogOpen(true)
  }

  async function openEdit(product: DBProduct) {
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: product.price,
      is_active: product.is_active,
      image_url: product.image_url || "",
      category: (product as any).category || "",
    })
    const mats = await getProductMaterials(product.id)
    setSelectedMats(mats.map((m) => ({ ...m })))
    setIsDialogOpen(true)
  }

  async function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleSave() {
    if (!form.name.trim()) return
    const category = (form.category || "").trim()
    if (editingId) {
      await updateProductWithMaterials({
        id: editingId,
        name: form.name.trim(),
        price: Number(form.price) || 0,
        is_active: form.is_active,
        image_url: form.image_url || "",
        category,
        materials: selectedMats.map((m) => ({
          material_id: m.material_id,
          quantity_needed: Number(m.quantity_needed) || 0,
        })),
      })
    } else {
      await createProductWithMaterials({
        name: form.name.trim(),
        price: Number(form.price) || 0,
        is_active: form.is_active,
        image_url: form.image_url || "",
        category,
        materials: selectedMats.map((m) => ({
          material_id: m.material_id,
          quantity_needed: Number(m.quantity_needed) || 0,
        })),
      })
    }
    setIsDialogOpen(false)
    await load()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kelola Menu</h2>
          <p className="text-muted-foreground">
            {""}   
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Menu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Menu" : "Tambah Menu Baru"}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form menu */}
              <div className="space-y-4">
                {/* Kategori picker for cashier filtering */}
                <div className="space-y-2">
                  <Label>Pilih Kategori</Label>
                  <div className="flex flex-col gap-2">
                    {!useNewCategory ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={form.category || ""}
                          onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                        >
                          <option value="">{existingCategories.length ? "— Pilih —" : "— Tidak ada —"}</option>
                          {existingCategories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <Button type="button" variant="outline" onClick={() => setUseNewCategory(true)}>
                          + Baru
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Kategori baru (misal: Minuman, Makanan)"
                          value={form.category || ""}
                          onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                        />
                        <Button type="button" variant="outline" onClick={() => setUseNewCategory(false)}>
                          Pilih yang ada
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                {/* </CHANGE> */}
                <div className="space-y-2">
                  <Label>Nama Menu</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="cth: Jossu"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Harga</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                    placeholder="8000"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))}
                    id="active"
                  />
                  <Label htmlFor="active">Aktif</Label>
                </div>
                <div className="space-y-2">
                  <Label>Foto Menu</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Tempel URL gambar (opsional)"
                      value={form.image_url || ""}
                      onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const dataUrl = await readFileAsDataUrl(file)
                          setForm((p) => ({ ...p, image_url: dataUrl }))
                        }
                      }}
                    />
                  </div>
                  <div className="rounded-md overflow-hidden border">
                    <img
                      src={form.image_url || "/placeholder.svg?height=320&width=480&query=foto%20menu"}
                      alt="Preview foto menu"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    Batal
                  </Button>
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Simpan
                  </Button>
                </div>
              </div>

              {/* Material selector */}
              <MaterialSelector selected={selectedMats} onChange={setSelectedMats} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
              <Label htmlFor="show-inactive">Tampilkan menu nonaktif</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => (
          <Card key={p.id} className={`overflow-hidden ${!p.is_active ? "opacity-60" : ""}`}>
            <div className="aspect-video w-full overflow-hidden bg-muted">
              <img
                src={p.image_url || "/placeholder.svg?height=300&width=600&query=foto%20menu"}
                alt={p.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.name}</h3>
                <Badge variant={p.is_active ? "secondary" : "destructive"}>{p.is_active ? "Aktif" : "Nonaktif"}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary">{formatPrice(p.price)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(p)} className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Tidak ada menu yang ditemukan</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function MaterialSelector({
  selected,
  onChange,
}: {
  selected: SelectedMat[]
  onChange: (s: SelectedMat[]) => void
}) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SelectedMat[]>([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const rows = await searchMaterials(query)
      if (!alive) return
      setResults(
        rows.map((m) => ({
          material_id: m.id!,
          name: m.name,
          unit: m.unit,
          quantity_needed: 1,
        })),
      )
    })()
    return () => {
      alive = false
    }
  }, [query])

  const selectedIds = useMemo(() => new Set(selected.map((s) => s.material_id)), [selected])

  function addOrUpdate(mat: SelectedMat) {
    const exists = selected.find((s) => s.material_id === mat.material_id)
    if (exists) {
      onChange(selected.map((s) => (s.material_id === mat.material_id ? mat : s)))
    } else {
      onChange([...selected, mat])
    }
  }

  function remove(id: ID) {
    onChange(selected.filter((s) => s.material_id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Bahan Baku</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari bahan (misal: Susu SKM, Extrajoss)"
            className="pl-10"
          />
        </div>
      </div>

      <div className="max-h-48 overflow-auto border rounded-md">
        {results.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">Tidak ada hasil</p>
        ) : (
          <div className="divide-y">
            {results.map((r) => (
              <div key={r.material_id} className="flex items-center justify-between p-2 gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground">Satuan: {r.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    value={selected.find((s) => s.material_id === r.material_id)?.quantity_needed ?? r.quantity_needed}
                    onChange={(e) => addOrUpdate({ ...r, quantity_needed: Math.max(0, Number(e.target.value) || 0) })}
                    className="w-20 h-8"
                  />
                  <Button
                    variant={selectedIds.has(r.material_id) ? "secondary" : "outline"}
                    size="sm"
                    onClick={() =>
                      addOrUpdate({
                        ...r,
                        quantity_needed:
                          selected.find((s) => s.material_id === r.material_id)?.quantity_needed ?? r.quantity_needed,
                      })
                    }
                  >
                    {selectedIds.has(r.material_id) ? "Update" : "Tambah"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected list */}
      <div className="space-y-2">
        <Label>Dipakai per 1 porsi</Label>
        <div className="border rounded-md divide-y">
          {selected.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">Belum ada bahan dipilih.</p>
          ) : (
            selected.map((s) => (
              <div key={s.material_id} className="flex items-center justify-between p-2 gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.quantity_needed} {s.unit}
                  </p>
                </div>
                <Button variant="destructive" size="icon" onClick={() => remove(s.material_id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
