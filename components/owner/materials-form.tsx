"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial?: {
    id?: number
    name?: string
    unit?: string
    stock_quantity?: number
    min_stock?: number
  }
  onSubmit: (data: { name: string; unit: string; stock_quantity: number; min_stock?: number }) => Promise<void> | void
}

export default function MaterialsForm({ open, onOpenChange, initial, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? "")
  const [unit, setUnit] = useState(initial?.unit ?? "")
  const [stock, setStock] = useState<number>(initial?.stock_quantity ?? 0)
  const [minStock, setMinStock] = useState<number>(initial?.min_stock ?? 0)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!name.trim() || !unit.trim()) return
    setLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        unit: unit.trim(),
        stock_quantity: Number(stock) || 0,
        min_stock: Number(minStock) || 0,
      })
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Bahan Baku" : "Tambah Bahan Baku"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <Field>
            <Label htmlFor="name">Nama bahan</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Susu SKM" />
          </Field>
          <Field>
            <Label htmlFor="unit">Satuan</Label>
            <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="pcs, gram, sachet" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <Label htmlFor="stock">Stok</Label>
              <Input id="stock" type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} />
            </Field>
            <Field>
              <Label htmlFor="minStock">Batas minimal</Label>
              <Input
                id="minStock"
                type="number"
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
              />
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
