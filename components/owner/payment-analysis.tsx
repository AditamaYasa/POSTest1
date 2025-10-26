"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Banknote, AlertTriangle, CheckCircle, Info } from "lucide-react"

interface PaymentAnalysisProps {
  data: {
    cashAmount: number
    cashlessAmount: number
    totalAmount: number
    cashTransactions: number
    cashlessTransactions: number
    totalTransactions: number
  }
}

export function PaymentAnalysis({ data }: PaymentAnalysisProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const cashPercentage = data.totalAmount > 0 ? (data.cashAmount / data.totalAmount) * 100 : 0
  const cashlessPercentage = data.totalAmount > 0 ? (data.cashlessAmount / data.totalAmount) * 100 : 0

  const cashTransactionPercentage =
    data.totalTransactions > 0 ? (data.cashTransactions / data.totalTransactions) * 100 : 0
  const cashlessTransactionPercentage =
    data.totalTransactions > 0 ? (data.cashlessTransactions / data.totalTransactions) * 100 : 0

  // Business insights based on payment patterns
  const getPaymentInsight = () => {
    if (cashPercentage > 70) {
      return {
        type: "warning" as const,
        icon: AlertTriangle,
        title: "Dominasi Pembayaran Tunai",
        message: "Pertimbangkan promosi pembayaran digital untuk meningkatkan efisiensi transaksi",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/20",
      }
    } else if (cashPercentage < 30) {
      return {
        type: "success" as const,
        icon: CheckCircle,
        title: "Adopsi Digital Tinggi",
        message: "Pelanggan Anda sudah terbiasa dengan pembayaran digital. Pertahankan layanan ini!",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500/20",
      }
    } else {
      return {
        type: "info" as const,
        icon: Info,
        title: "Keseimbangan Pembayaran",
        message: "Distribusi pembayaran tunai dan digital sudah seimbang",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
      }
    }
  }

  const insight = getPaymentInsight()
  const InsightIcon = insight.icon

  return (
    <div className="space-y-6">
      {/* Payment Method Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-green-500" />
              Pembayaran Tunai
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-2xl font-bold text-green-500">{formatPrice(data.cashAmount)}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{cashPercentage.toFixed(1)}%</Badge>
                <span>dari total penjualan</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Jumlah Transaksi</span>
                <span className="font-medium">{data.cashTransactions}</span>
              </div>
              <Progress value={cashTransactionPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {cashTransactionPercentage.toFixed(1)}% dari total transaksi
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-500" />
              Pembayaran Non-Tunai
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-2xl font-bold text-blue-500">{formatPrice(data.cashlessAmount)}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{cashlessPercentage.toFixed(1)}%</Badge>
                <span>dari total penjualan</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Jumlah Transaksi</span>
                <span className="font-medium">{data.cashlessTransactions}</span>
              </div>
              <Progress value={cashlessTransactionPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                {cashlessTransactionPercentage.toFixed(1)}% dari total transaksi
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Tunai
                </span>
                <span className="font-medium">{cashPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={cashPercentage} className="h-3" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Non-Tunai
                </span>
                <span className="font-medium">{cashlessPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={cashlessPercentage} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Insight */}
      <Card className={`${insight.borderColor} ${insight.bgColor}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex items-center justify-center w-12 h-12 ${insight.bgColor} rounded-lg`}>
              <InsightIcon className={`w-6 h-6 ${insight.color}`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${insight.color}`}>{insight.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{insight.message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
