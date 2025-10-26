"use client"
import useSWR from "swr"
import { useState, useMemo } from "react"
import {
  listRawMaterials,
  deleteRawMaterial,
  updateRawMaterial,
  createRawMaterial,
  getLowStockMaterials,
} from "@/lib/inventory"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import MaterialsForm from "./materials-form"
import { toast } from "@/hooks/use-toast"

const fetcher = (q?: string) => () => listRawMaterials(q)

export default function MaterialsTable() {
  const [query, setQuery] = useState("")
  const { data, mutate, isLoading } = useSWR(["raw-materials", query], fetcher(query))
  const [openForm, setOpenForm] = useState(false)
  const [editRow, setEditRow] = useState<any | null>(null)

  const lowStock = useSWR("low-stock", getLowStockMaterials)

  const rows = useMemo(() => data ?? [], [data])

  return (
    <div className="space-y-4">
      {lowStock.data && lowStock.data.length > 0 && (
        <Alert variant="destructive" role="alert" aria-live="assertive">
          <AlertTitle>Peringatan stok menipis</AlertTitle>
          <AlertDescription>
            {lowStock.data.map((m) => `${m.name} (${m.stock_quantity}/${m.min_stock} ${m.unit})`).join(", ")}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="Cari bahan baku..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
          aria-label="Cari bahan baku"
        />
        <Button
          onClick={() => {
            setEditRow(null)
            setOpenForm(true)
          }}
        >
          Tambah bahan
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Satuan</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead>Min Stok</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5}>Memuat...</TableCell>
              </TableRow>
            )}
            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>Belum ada data bahan baku</TableCell>
              </TableRow>
            )}
            {rows.map((m: any) => {
              const isLow = (m.min_stock ?? 0) > 0 && m.stock_quantity <= (m.min_stock ?? 0)
              return (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.unit}</TableCell>
                  <TableCell>
                    {m.stock_quantity}{" "}
                    {isLow && (
                      <Badge variant="destructive" className="ml-1">
                        Menipis
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{m.min_stock ?? 0}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditRow(m)
                        setOpenForm(true)
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        await deleteRawMaterial(m.id)
                        mutate()
                        lowStock.mutate()
                        toast({ description: `Bahan ${m.name} dihapus` })
                      }}
                    >
                      Hapus
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <MaterialsForm
        open={openForm}
        onOpenChange={(v) => setOpenForm(v)}
        initial={editRow ?? undefined}
        onSubmit={async (payload) => {
          if (editRow?.id) {
            await updateRawMaterial(editRow.id, payload as any)
            toast({ description: "Data bahan diperbarui" })
          } else {
            await createRawMaterial(payload as any)
            toast({ description: "Bahan baru ditambahkan" })
          }
          setEditRow(null)
          await mutate()
          lowStock.mutate()
        }}
      />
    </div>
  )
}
