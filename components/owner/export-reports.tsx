"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText, FileSpreadsheet, Calendar, Clock, CheckCircle, Loader2 } from "lucide-react"
import { getOwnerDashboardData } from "@/lib/inventory"
import { getDB } from "@/lib/db"

interface ExportReportsProps {
  data: {
    dailySales: number
    monthlySales: number
    totalTransactions: number
    lastExportDate?: string
  }
}

interface ExportOption {
  id: string
  title: string
  description: string
  format: "pdf" | "excel" | "csv"
  icon: any
  size: string
  includes: string[]
}

export function ExportReports({ data }: ExportReportsProps) {
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState<string | null>(null)

  function downloadBlob(fileName: string, mime: string, blobOrString: Blob | string) {
    const blob = blobOrString instanceof Blob ? blobOrString : new Blob([blobOrString], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function csvEsc(val: any) {
    const s = String(val ?? "")
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  async function exportTransactionsCSV() {
    const db = getDB()
    const txs = await db.transactions.where("status").equals("paid").toArray()
    const ids = txs.map((t: any) => t.id)
    const items = ids.length
      ? await db.transaction_items
          .where("transaction_id")
          .anyOf(ids as number[])
          .toArray()
      : []
    const productIds = Array.from(new Set(items.map((i: any) => i.product_id)))
    const products = productIds.length
      ? await db.products
          .where("id")
          .anyOf(productIds as number[])
          .toArray()
      : []
    const productMap = new Map(products.map((p: any) => [p.id, p.name]))

    const header = [
      "receipt_number",
      "transaction_date",
      "payment_method",
      "tx_total",
      "item_product",
      "quantity",
      "unit_price",
      "total_price",
    ].join(",")

    const rows: string[] = [header]
    const txMap = new Map(txs.map((t: any) => [t.id, t]))
    for (const it of items) {
      const tx = txMap.get(it.transaction_id)
      rows.push(
        [
          csvEsc(tx?.receipt_number),
          csvEsc(tx?.transaction_date),
          csvEsc(tx?.payment_method),
          csvEsc(tx?.total_amount),
          csvEsc(productMap.get(it.product_id) ?? it.product_id),
          csvEsc(it.quantity),
          csvEsc(it.unit_price),
          csvEsc(it.total_price),
        ].join(","),
      )
    }
    downloadBlob(
      `transaction-data-${new Date().toISOString().slice(0, 10)}.csv`,
      "text/csv;charset=utf-8",
      rows.join("\n"),
    )
  }

  async function exportDailyPDF() {
    const { daily } = await getOwnerDashboardData()
    const jsPDF = (await import("jspdf")).default
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Laporan Harian", 14, 18)
    doc.setFontSize(11)
    const lines = [
      `Tanggal: ${new Date().toLocaleString("id-ID")}`,
      `Penjualan Hari Ini: ${formatPrice(daily.todaySales)}`,
      `Jumlah Transaksi: ${daily.todayTransactions}`,
      `Pembayaran Tunai: ${formatPrice(daily.cashPayments)}`,
      `Pembayaran Non-Tunai: ${formatPrice(daily.cashlessPayments)}`,
      `Produk Terlaris: ${daily.topProduct.name} (${daily.topProduct.quantity}x)`,
    ]
    let y = 28
    lines.forEach((l) => {
      doc.text(l, 14, y)
      y += 7
    })
    downloadBlob(`laporan-harian-${new Date().toISOString().slice(0, 10)}.pdf`, "application/pdf", doc.output("blob"))
  }

  async function exportMonthlyPDF() {
    const { monthly } = await getOwnerDashboardData()
    const jsPDF = (await import("jspdf")).default
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Laporan Bulanan (30 hari)", 14, 18)
    doc.setFontSize(11)
    const lines = [
      `Total Penjualan: ${formatPrice(monthly.monthlySales)}`,
      `Total Transaksi: ${monthly.monthlyTransactions}`,
      `Tunai: ${formatPrice(monthly.cashPayments)} • Non-Tunai: ${formatPrice(monthly.cashlessPayments)}`,
      `Produk Teratas: ${monthly.topProduct.name} (Rp${monthly.topProduct.revenue.toLocaleString("id-ID")})`,
      `Pertumbuhan Penjualan: ${monthly.salesGrowth.toFixed(1)}%`,
      `Pertumbuhan Transaksi: ${monthly.transactionGrowth.toFixed(1)}%`,
    ]
    let y = 28
    lines.forEach((l) => {
      doc.text(l, 14, y)
      y += 7
    })
    downloadBlob(`laporan-bulanan-${new Date().toISOString().slice(0, 10)}.pdf`, "application/pdf", doc.output("blob"))
  }

  async function exportPaymentPDF() {
    const { payment } = await getOwnerDashboardData()
    const jsPDF = (await import("jspdf")).default
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Analisis Pembayaran", 14, 18)
    doc.setFontSize(11)
    const lines = [
      `Total Pembayaran: ${formatPrice(payment.totalAmount)}`,
      `Tunai: ${formatPrice(payment.cashAmount)} (${payment.cashTransactions} transaksi)`,
      `Non-Tunai: ${formatPrice(payment.cashlessAmount)} (${payment.cashlessTransactions} transaksi)`,
      `Total Transaksi: ${payment.totalTransactions}`,
    ]
    let y = 28
    lines.forEach((l) => {
      doc.text(l, 14, y)
      y += 7
    })
    downloadBlob(
      `analisis-pembayaran-${new Date().toISOString().slice(0, 10)}.pdf`,
      "application/pdf",
      doc.output("blob"),
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const exportOptions: ExportOption[] = [
    {
      id: "daily-report",
      title: "Laporan Harian",
      description: "Ringkasan penjualan dan transaksi hari ini",
      format: "pdf",
      icon: FileText,
      size: "~2MB",
      includes: [
        "Total penjualan hari ini",
        "Jumlah transaksi",
        "Metode pembayaran",
        "Produk terlaris",
        "Transaksi terbaru",
      ],
    },
    {
      id: "monthly-report",
      title: "Laporan Bulanan",
      description: "Analisis komprehensif penjualan bulanan",
      format: "pdf",
      icon: FileText,
      size: "~5MB",
      includes: [
        "Grafik penjualan harian",
        "Tren pertumbuhan",
        "Analisis jam sibuk",
        "Performa produk",
        "Wawasan bisnis",
      ],
    },
    {
      id: "transaction-data",
      title: "Data Transaksi",
      description: "Data mentah semua transaksi untuk analisis lanjutan",
      format: "csv",
      icon: FileSpreadsheet,
      size: "~1MB",
      includes: ["Detail setiap transaksi", "Informasi produk", "Metode pembayaran", "Timestamp lengkap", "Data kasir"],
    },
    {
      id: "payment-analysis",
      title: "Analisis Pembayaran",
      description: "Laporan detail metode pembayaran dan tren",
      format: "pdf",
      icon: FileText,
      size: "~3MB",
      includes: [
        "Distribusi pembayaran",
        "Tren pembayaran digital",
        "Rekomendasi bisnis",
        "Perbandingan periode",
        "Grafik visualisasi",
      ],
    },
  ]

  const handleReportToggle = (reportId: string) => {
    setSelectedReports((prev) => (prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]))
  }

  const handleExport = async () => {
    if (selectedReports.length === 0 || isExporting) return
    setIsExporting(true)
    setExportSuccess(null)
    try {
      for (const id of selectedReports) {
        if (id === "daily-report") await exportDailyPDF()
        else if (id === "monthly-report") await exportMonthlyPDF()
        else if (id === "payment-analysis") await exportPaymentPDF()
        else if (id === "transaction-data") await exportTransactionsCSV()
      }
      const reportNames = selectedReports.map((id) => exportOptions.find((opt) => opt.id === id)?.title).join(", ")
      setExportSuccess(`Berhasil mengekspor: ${reportNames}`)
      setSelectedReports([])
    } catch (error) {
      console.error("[v0] Export failed:", (error as any)?.message)
    } finally {
      setIsExporting(false)
    }
  }

  const getFormatBadge = (format: string) => {
    switch (format) {
      case "pdf":
        return <Badge variant="destructive">PDF</Badge>
      case "excel":
        return <Badge variant="default">Excel</Badge>
      case "csv":
        return <Badge variant="secondary">CSV</Badge>
      default:
        return <Badge variant="outline">{format.toUpperCase()}</Badge>
    }
  }

  const totalSize = selectedReports.reduce((total, reportId) => {
    const report = exportOptions.find((opt) => opt.id === reportId)
    const sizeNum = Number.parseFloat(report?.size.replace(/[^\d.]/g, "") || "0")
    return total + sizeNum
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-6 w-6 text-primary" />
            Ekspor Laporan
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Unduh laporan bisnis dalam berbagai format untuk analisis lebih lanjut
          </p>
        </CardHeader>
      </Card>

      {/* Export Success Message */}
      {exportSuccess && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-green-500">Ekspor Berhasil!</p>
                <p className="text-sm text-muted-foreground">{exportSuccess}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Penjualan Hari Ini</p>
                <p className="font-bold">{formatPrice(data.dailySales)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Transaksi</p>
                <p className="font-bold">{data.totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Ekspor Terakhir</p>
                <p className="font-bold">
                  {data.lastExportDate ? new Date(data.lastExportDate).toLocaleDateString("id-ID") : "Belum pernah"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Laporan untuk Diekspor</CardTitle>
          <p className="text-sm text-muted-foreground">Centang laporan yang ingin Anda unduh</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedReports.includes(option.id)

              return (
                <div
                  key={option.id}
                  className={`border rounded-lg p-4 transition-colors h-full ${
                    isSelected ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={isSelected}
                      disabled={isExporting}
                      onCheckedChange={() => handleReportToggle(option.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-5 h-5 text-primary shrink-0" />
                        <h3 className="font-semibold truncate">{option.title}</h3>
                        {getFormatBadge(option.format)}
                        <Badge variant="outline" className="text-xs ml-auto">
                          {option.size}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium">Termasuk:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {option.includes.map((item, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                              <span className="truncate">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Export Summary & Action */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-semibold">Siap untuk Ekspor</h3>
              <p className="text-sm text-muted-foreground">
                {selectedReports.length} laporan dipilih • Estimasi ukuran: ~{totalSize.toFixed(1)}MB
              </p>
            </div>
            <Button
              onClick={handleExport}
              disabled={isExporting || selectedReports.length === 0}
              size="lg"
              className="min-w-[140px]"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mengekspor...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Ekspor Sekarang
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
