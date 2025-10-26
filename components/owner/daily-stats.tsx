"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, ShoppingBag, CreditCard, Banknote, Clock, Star } from "lucide-react"

interface DailyStatsProps {
  data: {
    todaySales: number
    todayTransactions: number
    cashPayments: number
    cashlessPayments: number
    topProduct: {
      name: string
      quantity: number
    }
    recentTransactions: Array<{
      id: string
      time: string
      amount: number
      method: "cash" | "cashless"
    }>
  }
}

export function DailyStats({ data }: DailyStatsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const totalPayments = data.cashPayments + data.cashlessPayments
  const cashPercentage = totalPayments > 0 ? (data.cashPayments / totalPayments) * 100 : 0
  const cashlessPercentage = totalPayments > 0 ? (data.cashlessPayments / totalPayments) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Penjualan Hari Ini</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatPrice(data.todaySales)}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>+12% dari kemarin</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Transaksi</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.todayTransactions}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>+8% dari kemarin</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pembayaran Tunai</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(data.cashPayments)}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {cashPercentage.toFixed(0)}%
              </Badge>
              <span>dari total</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pembayaran Non-Tunai</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(data.cashlessPayments)}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {cashlessPercentage.toFixed(0)}%
              </Badge>
              <span>dari total</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Product & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Product */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Produk Terlaris Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div>
                  <h3 className="font-semibold">{data.topProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">Produk terlaris</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{data.topProduct.quantity}</div>
                  <p className="text-xs text-muted-foreground">terjual</p>
                </div>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <p>Pastikan stok produk ini selalu tersedia!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Transaksi Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                      {transaction.method === "cash" ? (
                        <Banknote className="w-4 h-4 text-green-500" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{formatPrice(transaction.amount)}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(transaction.time)}</p>
                    </div>
                  </div>
                  <Badge variant={transaction.method === "cash" ? "default" : "secondary"}>
                    {transaction.method === "cash" ? "Tunai" : "Non-Tunai"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
