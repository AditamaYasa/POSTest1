"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Clock,
  Users,
  DollarSign,
  Lightbulb,
  Zap,
  Star,
} from "lucide-react"

interface BusinessInsightsProps {
  data: {
    dailySales: number
    yesterdaySales: number
    cashPercentage: number
    peakHour: string
    peakTransactions: number
    topProduct: string
    salesTrend: number
    averageTransaction: number
  }
}

interface Insight {
  id: string
  type: "success" | "warning" | "info" | "danger"
  category: "sales" | "payment" | "operations" | "customer"
  title: string
  description: string
  recommendation: string
  impact: "high" | "medium" | "low"
  icon: any
}

export function BusinessInsights({ data }: BusinessInsightsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Generate AI-powered insights based on data
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = []

    // Sales trend analysis
    const salesChange = ((data.dailySales - data.yesterdaySales) / data.yesterdaySales) * 100
    if (salesChange > 10) {
      insights.push({
        id: "sales-growth",
        type: "success",
        category: "sales",
        title: "Pertumbuhan Penjualan Signifikan",
        description: `Penjualan hari ini naik ${salesChange.toFixed(1)}% dibanding kemarin (${formatPrice(data.dailySales - data.yesterdaySales)})`,
        recommendation:
          "Analisis faktor penyebab kenaikan ini dan replikasi strategi yang berhasil untuk hari-hari berikutnya.",
        impact: "high",
        icon: TrendingUp,
      })
    } else if (salesChange < -10) {
      insights.push({
        id: "sales-decline",
        type: "warning",
        category: "sales",
        title: "Penurunan Penjualan Perlu Perhatian",
        description: `Penjualan hari ini turun ${Math.abs(salesChange).toFixed(1)}% dibanding kemarin (${formatPrice(Math.abs(data.dailySales - data.yesterdaySales))})`,
        recommendation:
          "Evaluasi faktor penyebab penurunan seperti cuaca, kompetitor, atau kualitas layanan. Pertimbangkan promosi khusus.",
        impact: "high",
        icon: TrendingDown,
      })
    }

    // Payment method analysis
    if (data.cashPercentage > 70) {
      insights.push({
        id: "cash-dominance",
        type: "warning",
        category: "payment",
        title: "Dominasi Pembayaran Tunai",
        description: `${data.cashPercentage.toFixed(1)}% transaksi menggunakan pembayaran tunai`,
        recommendation:
          "Berikan insentif untuk pembayaran digital seperti diskon 2% atau poin reward untuk meningkatkan efisiensi transaksi.",
        impact: "medium",
        icon: AlertTriangle,
      })
    } else if (data.cashPercentage < 30) {
      insights.push({
        id: "digital-adoption",
        type: "success",
        category: "payment",
        title: "Adopsi Pembayaran Digital Tinggi",
        description: `Hanya ${data.cashPercentage.toFixed(1)}% transaksi menggunakan tunai`,
        recommendation:
          "Pertahankan layanan pembayaran digital yang baik dan pertimbangkan menambah metode pembayaran baru seperti QRIS atau e-wallet lainnya.",
        impact: "low",
        icon: CheckCircle,
      })
    }

    // Peak hour analysis
    insights.push({
      id: "peak-hour-optimization",
      type: "info",
      category: "operations",
      title: "Optimasi Jam Sibuk",
      description: `Jam tersibuk adalah ${data.peakHour} dengan ${data.peakTransactions} transaksi`,
      recommendation:
        "Pastikan staf dan stok mencukupi pada jam ini. Pertimbangkan menambah kasir atau menyiapkan paket combo untuk mempercepat layanan.",
      impact: "medium",
      icon: Clock,
    })

    // Average transaction analysis
    if (data.averageTransaction < 25000) {
      insights.push({
        id: "low-average-transaction",
        type: "warning",
        category: "sales",
        title: "Nilai Transaksi Rata-rata Rendah",
        description: `Rata-rata transaksi hanya ${formatPrice(data.averageTransaction)}`,
        recommendation:
          "Implementasikan strategi upselling dan cross-selling. Tawarkan paket combo atau produk pelengkap untuk meningkatkan nilai transaksi.",
        impact: "high",
        icon: Target,
      })
    } else if (data.averageTransaction > 50000) {
      insights.push({
        id: "high-average-transaction",
        type: "success",
        category: "customer",
        title: "Nilai Transaksi Tinggi",
        description: `Rata-rata transaksi mencapai ${formatPrice(data.averageTransaction)}`,
        recommendation:
          "Pelanggan menunjukkan daya beli yang baik. Pertimbangkan menambah produk premium atau layanan tambahan.",
        impact: "medium",
        icon: DollarSign,
      })
    }

    // Product performance
    insights.push({
      id: "top-product-focus",
      type: "info",
      category: "sales",
      title: "Fokus pada Produk Terlaris",
      description: `${data.topProduct} adalah produk terlaris hari ini`,
      recommendation:
        "Pastikan stok produk ini selalu tersedia dan pertimbangkan membuat variasi atau paket bundle dengan produk lain.",
      impact: "medium",
      icon: Star,
    })

    return insights
  }

  const insights = generateInsights()
  const categories = [
    { id: "all", label: "Semua", icon: Brain },
    { id: "sales", label: "Penjualan", icon: TrendingUp },
    { id: "payment", label: "Pembayaran", icon: DollarSign },
    { id: "operations", label: "Operasional", icon: Clock },
    { id: "customer", label: "Pelanggan", icon: Users },
  ]

  const filteredInsights =
    selectedCategory === "all" ? insights : insights.filter((insight) => insight.category === selectedCategory)

  const getInsightColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-500 bg-green-500/10 border-green-500/20"
      case "warning":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
      case "danger":
        return "text-red-500 bg-red-500/10 border-red-500/20"
      default:
        return "text-blue-500 bg-blue-500/10 border-blue-500/20"
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high":
        return <Badge variant="destructive">Prioritas Tinggi</Badge>
      case "medium":
        return <Badge variant="secondary">Prioritas Sedang</Badge>
      default:
        return <Badge variant="outline">Prioritas Rendah</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Wawasan Bisnis Cerdas
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Analisis otomatis berdasarkan data penjualan dan tren bisnis Anda
          </p>
        </CardHeader>
      </Card>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              <Icon className="w-4 h-4 mr-2" />
              {category.label}
            </Button>
          )
        })}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredInsights.map((insight) => {
          const Icon = insight.icon
          return (
            <Card key={insight.id} className={`border ${getInsightColor(insight.type)}`}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-lg ${getInsightColor(insight.type)}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{insight.title}</h3>
                        {getImpactBadge(insight.impact)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Analisis:</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        Rekomendasi:
                      </h4>
                      <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredInsights.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Tidak Ada Wawasan untuk Kategori Ini</h3>
            <p className="text-sm text-muted-foreground">
              Pilih kategori lain atau kembali ke "Semua" untuk melihat semua wawasan bisnis.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Wawasan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {insights.filter((i) => i.type === "success").length}
              </div>
              <p className="text-xs text-muted-foreground">Positif</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">
                {insights.filter((i) => i.type === "warning").length}
              </div>
              <p className="text-xs text-muted-foreground">Perhatian</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{insights.filter((i) => i.type === "info").length}</div>
              <p className="text-xs text-muted-foreground">Informasi</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {insights.filter((i) => i.impact === "high").length}
              </div>
              <p className="text-xs text-muted-foreground">Prioritas Tinggi</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
