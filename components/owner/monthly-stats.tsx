"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Calendar, Target, Star, Clock } from "lucide-react"

interface MonthlyStatsProps {
  data: {
    monthlySales: number
    monthlyTransactions: number
    cashPayments: number
    cashlessPayments: number
    topProduct: {
      name: string
      quantity: number
      revenue: number
    }
    salesGrowth: number
    transactionGrowth: number
    dailyBreakdown: Array<{
      date: string
      sales: number
      transactions: number
    }>
    peakHours: Array<{
      hour: string
      transactions: number
      percentage: number
    }>
  }
}

export function MonthlyStats({ data }: MonthlyStatsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    })
  }

  const totalPayments = data.cashPayments + data.cashlessPayments
  const cashPercentage = totalPayments > 0 ? (data.cashPayments / totalPayments) * 100 : 0
  const cashlessPercentage = totalPayments > 0 ? (data.cashlessPayments / totalPayments) * 100 : 0

  const averageDailySales = data.monthlySales / data.dailyBreakdown.length
  const averageDailyTransactions = data.monthlyTransactions / data.dailyBreakdown.length

  const bestDay = data.dailyBreakdown.reduce((prev, current) => (prev.sales > current.sales ? prev : current))
  const worstDay = data.dailyBreakdown.reduce((prev, current) => (prev.sales < current.sales ? prev : current))

  return (
    <div className="space-y-6">
      {/* Main Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Penjualan Bulan Ini</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatPrice(data.monthlySales)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {data.salesGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={data.salesGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                {data.salesGrowth >= 0 ? "+" : ""}
                {data.salesGrowth.toFixed(1)}% dari bulan lalu
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.monthlyTransactions}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {data.transactionGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={data.transactionGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                {data.transactionGrowth >= 0 ? "+" : ""}
                {data.transactionGrowth.toFixed(1)}% dari bulan lalu
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Harian</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(averageDailySales)}</div>
            <div className="text-xs text-muted-foreground">{averageDailyTransactions.toFixed(0)} transaksi/hari</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produk Terlaris</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{data.topProduct.name}</div>
            <div className="text-xs text-muted-foreground">
              {data.topProduct.quantity} terjual • {formatPrice(data.topProduct.revenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Metode Pembayaran Bulanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Pembayaran Tunai</span>
                  <span className="text-sm text-muted-foreground">{cashPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={cashPercentage} className="h-3" />
                <div className="text-lg font-bold text-green-500 mt-2">{formatPrice(data.cashPayments)}</div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Pembayaran Non-Tunai</span>
                  <span className="text-sm text-muted-foreground">{cashlessPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={cashlessPercentage} className="h-3" />
                <div className="text-lg font-bold text-blue-500 mt-2">{formatPrice(data.cashlessPayments)}</div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Insight Pembayaran</h4>
                {cashPercentage > 70 ? (
                  <p className="text-sm text-muted-foreground">
                    Dominasi pembayaran tunai. Pertimbangkan promosi pembayaran digital untuk efisiensi yang lebih baik.
                  </p>
                ) : cashPercentage < 30 ? (
                  <p className="text-sm text-muted-foreground">
                    Adopsi pembayaran digital sangat baik! Pelanggan sudah terbiasa dengan teknologi pembayaran modern.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Distribusi pembayaran seimbang antara tunai dan digital. Pertahankan layanan kedua metode ini.
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Peak Hours Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Jam Sibuk Bulanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.peakHours.map((hour, index) => (
              <div key={hour.hour} className="flex items-center gap-4">
                <div className="w-16 text-sm font-medium">{hour.hour}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">{hour.transactions} transaksi</span>
                    <span className="text-xs text-muted-foreground">{hour.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={hour.percentage} className="h-2" />
                </div>
                {index === 0 && <Badge variant="default">Tersibuk</Badge>}
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="font-medium text-blue-500 mb-2">Rekomendasi Operasional</h4>
            <p className="text-sm text-muted-foreground">
              Pastikan staf dan stok mencukupi pada jam {data.peakHours[0].hour} karena ini adalah jam tersibuk dengan{" "}
              {data.peakHours[0].transactions} transaksi rata-rata.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Daily Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Performa Harian Terbaik & Terburuk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <h4 className="font-medium text-green-500">Hari Terbaik</h4>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{formatDate(bestDay.date)}</p>
                  <p className="text-xl font-bold">{formatPrice(bestDay.sales)}</p>
                  <p className="text-xs text-muted-foreground">{bestDay.transactions} transaksi</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <h4 className="font-medium text-red-500">Hari Terburuk</h4>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{formatDate(worstDay.date)}</p>
                  <p className="text-xl font-bold">{formatPrice(worstDay.sales)}</p>
                  <p className="text-xs text-muted-foreground">{worstDay.transactions} transaksi</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
