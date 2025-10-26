"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PaymentMethod } from "@/components/cashier/payment-method"
import { Receipt } from "@/components/cashier/receipt"
import { ArrowLeft } from "lucide-react"
import { createPendingTransaction, markTransactionPaid } from "@/lib/inventory"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  category: string
}

interface ReceiptItem {
  id: number
  name: string
  quantity: number
  price: number
  total: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [currentStep, setCurrentStep] = useState<"payment" | "receipt">("payment")
  const [receiptData, setReceiptData] = useState<{
    receiptNumber: string
    items: ReceiptItem[]
    totalAmount: number
    paymentMethod: "cash" | "cashless"
    cashReceived?: number
    changeAmount?: number
    timestamp: Date
  } | null>(null)
  const { toast } = useToast()

  // Load cart items from localStorage if present
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("checkoutItems") : null
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CartItem[]
        if (Array.isArray(parsed) && parsed.length) {
          setCartItems(parsed)
          return
        }
      } catch {}
    }
    // fallback to sample demo if nothing in storage
    const sampleItems: CartItem[] = [
      { id: 1, name: "Kopi Americano", price: 15000, quantity: 2, category: "Minuman" },
      { id: 6, name: "Nasi Goreng", price: 25000, quantity: 1, category: "Makanan" },
      { id: 11, name: "Keripik Singkong", price: 8000, quantity: 1, category: "Snack" },
    ]
    setCartItems(sampleItems)
  }, [])

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const generateReceiptNumber = () => {
    const now = new Date()
    const timestamp = now.getTime().toString().slice(-6)
    return `TXN-${timestamp}`
  }

  const handlePaymentConfirm = async (method: "cash" | "cashless", cashReceived?: number) => {
    const receiptNumber = generateReceiptNumber()
    const timestamp = new Date()

    try {
      const { transaction_id } = await createPendingTransaction({
        items: cartItems.map((c) => ({ product_id: c.id, quantity: c.quantity })),
        payment_method: method,
        cashier_name: "Kasir 1",
      })

      await markTransactionPaid(transaction_id)

      const receiptItems: ReceiptItem[] = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      }))

      const transactionData = {
        receiptNumber,
        items: receiptItems,
        totalAmount,
        paymentMethod: method,
        cashReceived,
        changeAmount: method === "cash" && cashReceived ? cashReceived - totalAmount : undefined,
        timestamp,
      }

      // clear cart from storage after success
      if (typeof window !== "undefined") localStorage.removeItem("checkoutItems")

      setReceiptData(transactionData)
      setCurrentStep("receipt")
    } catch (err: any) {
      toast({
        title: "Pembayaran gagal",
        description: err?.message || "Stok bahan tidak mencukupi untuk pesanan ini.",
        variant: "destructive",
      })
      setCurrentStep("payment")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleNewTransaction = () => {
    router.push("/cashier")
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Keranjang Kosong</h2>
          <p className="text-muted-foreground">Tidak ada item untuk checkout</p>
          <Button onClick={() => router.push("/cashier")}>Kembali ke Kasir</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (currentStep === "payment" ? router.push("/cashier") : setCurrentStep("payment"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="font-semibold">{currentStep === "payment" ? "Pembayaran" : "Struk Transaksi"}</h1>
            <p className="text-sm text-muted-foreground">
              {currentStep === "payment" ? "Pilih metode pembayaran" : "Transaksi berhasil"}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto">
        {currentStep === "payment" ? (
          <PaymentMethod totalAmount={totalAmount} onPaymentConfirm={handlePaymentConfirm} />
        ) : receiptData ? (
          <Receipt
            receiptNumber={receiptData.receiptNumber}
            items={receiptData.items}
            totalAmount={receiptData.totalAmount}
            paymentMethod={receiptData.paymentMethod}
            cashReceived={receiptData.cashReceived}
            changeAmount={receiptData.changeAmount}
            cashierName="Kasir 1"
            timestamp={receiptData.timestamp}
            onPrint={handlePrint}
            onNewTransaction={handleNewTransaction}
          />
        ) : null}
      </div>
    </div>
  )
}
