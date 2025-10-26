"use client"
import MaterialsTable from "@/components/owner/materials-table"

export default function OwnerMaterialsPage() {
  return (
    <main className="container mx-auto max-w-5xl p-4 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-pretty">Bahan Baku</h1>
          <p className="text-muted-foreground">Kelola daftar bahan, satuan, stok, dan ambang minimal.</p>
        </div>
      </header>
      <MaterialsTable />
    </main>
  )
}
