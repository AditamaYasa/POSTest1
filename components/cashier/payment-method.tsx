"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Banknote, Smartphone, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaymentMethodProps {
  totalAmount: number
  onPaymentConfirm: (method: "cash" | "cashless", cashReceived?: number) => void
}

export function PaymentMethod({ totalAmount, onPaymentConfirm }: PaymentMethodProps) {
  const [selectedMethod, setSelectedMethod] = useState<"cash" | "cashless" | null>(null)
  const [cashReceived, setCashReceived] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const cashReceivedAmount = Number.parseFloat(cashReceived) || 0
  const changeAmount = cashReceivedAmount - totalAmount

  const handlePayment = async () => {
    if (!selectedMethod) return

    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (selectedMethod === "cash") {
      onPaymentConfirm("cash", cashReceivedAmount)
    } else {
      onPaymentConfirm("cashless")
    }

    setIsProcessing(false)
  }

  const isValidCashPayment = selectedMethod === "cash" && cashReceivedAmount >= totalAmount
  const isValidCashlessPayment = selectedMethod === "cashless"
  const canProceed = isValidCashPayment || isValidCashlessPayment

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{formatPrice(totalAmount)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pilih Metode Pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cash Payment */}
          <div
            className={cn(
              "border rounded-lg p-4 cursor-pointer transition-colors",
              selectedMethod === "cash" ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50",
            )}
            onClick={() => setSelectedMethod("cash")}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-500/10 rounded-lg">
                <Banknote className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Tunai</h3>
                <p className="text-sm text-muted-foreground">Pembayaran dengan uang tunai</p>
              </div>
              {selectedMethod === "cash" && <Check className="w-5 h-5 text-primary" />}
            </div>
          </div>

          {/* Cashless Payment */}
          <div
            className={cn(
              "border rounded-lg p-4 cursor-pointer transition-colors",
              selectedMethod === "cashless" ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50",
            )}
            onClick={() => setSelectedMethod("cashless")}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-500/10 rounded-lg">
                <CreditCard className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Non-Tunai</h3>
                <p className="text-sm text-muted-foreground">Kartu, e-wallet, atau transfer</p>
              </div>
              {selectedMethod === "cashless" && <Check className="w-5 h-5 text-primary" />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash Input */}
      {selectedMethod === "cash" && (
        <Card>
          <CardHeader>
            <CardTitle>Uang Diterima</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cash-received">Jumlah uang yang diterima</Label>
              <Input
                id="cash-received"
                type="number"
                placeholder="0"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                className="text-lg"
              />
            </div>

            {cashReceivedAmount > 0 && (
              <div className="space-y-2">
                <Separator />
                <div className="flex justify-between">
                  <span>Total Belanja:</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uang Diterima:</span>
                  <span>{formatPrice(cashReceivedAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Kembalian:</span>
                  <span className={changeAmount >= 0 ? "text-green-500" : "text-red-500"}>
                    {formatPrice(Math.max(0, changeAmount))}
                  </span>
                </div>

                {changeAmount < 0 && (
                  <div className="text-sm text-red-500 mt-2">
                    Uang yang diterima kurang {formatPrice(Math.abs(changeAmount))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[50000, 100000, 200000].map((amount) => (
                <Button key={amount} variant="outline" size="sm" onClick={() => setCashReceived(amount.toString())}>
                  {formatPrice(amount)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cashless Confirmation */}
      {selectedMethod === "cashless" && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-full mx-auto">
                <Smartphone className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold">Pembayaran Non-Tunai</h3>
                <p className="text-sm text-muted-foreground">Pastikan pembayaran telah berhasil sebelum melanjutkan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirm Payment Button */}
      <Button onClick={handlePayment} disabled={!canProceed || isProcessing} className="w-full touch-target" size="lg">
        {isProcessing ? "Memproses Pembayaran..." : `Konfirmasi Pembayaran ${formatPrice(totalAmount)}`}
      </Button>
    </div>
  )
}
