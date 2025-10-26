"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer, Share, Check } from "lucide-react"
import { ReceiptPreviewModal } from "./receipt-preview-modal"

interface ReceiptItem {
  id: number
  name: string
  quantity: number
  price: number
  total: number
}

interface ReceiptProps {
  receiptNumber: string
  items: ReceiptItem[]
  totalAmount: number
  paymentMethod: "cash" | "cashless"
  cashReceived?: number
  changeAmount?: number
  cashierName: string
  timestamp: Date
  onPrint: () => void
  onNewTransaction: () => void
}

interface StoreData {
  storeName: string
  storeAddress: string
  storePhone: string
}

export function Receipt({
  receiptNumber,
  items,
  totalAmount,
  paymentMethod,
  cashReceived,
  changeAmount,
  cashierName,
  timestamp,
  onPrint,
  onNewTransaction,
}: ReceiptProps) {
  const [storeData, setStoreData] = useState<StoreData>({
    storeName: "TOKO SERBAGUNA",
    storeAddress: "Jl. Contoh No. 123, Jakarta",
    storePhone: "(021) 1234-5678",
  })
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const loadStoreData = () => {
      try {
        const saved = localStorage.getItem("storeData")
        if (saved) {
          setStoreData(JSON.parse(saved))
        }
      } catch (err) {
        console.error("[v0] Error loading store data:", err)
      }
    }

    loadStoreData()

    const handleStoreDataUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      setStoreData(customEvent.detail)
    }

    window.addEventListener("storeDataUpdated", handleStoreDataUpdate)
    return () => window.removeEventListener("storeDataUpdated", handleStoreDataUpdate)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Struk ${receiptNumber}`,
          text: `Transaksi berhasil - Total: ${formatPrice(totalAmount)}`,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    }
  }

  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)

  const handlePrintClick = () => {
    setShowPreview(true)
    onPrint()
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 print:hidden">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mx-auto">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-500">Pembayaran Berhasil!</h2>
            <p className="text-muted-foreground">Transaksi telah selesai diproses</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center print:block print:p-0 print:m-0">
        <div
          className="bg-white text-black p-4 font-mono text-xs"
          style={{ width: "80mm", maxWidth: "100%" }}
          id="receipt-content"
        >
          {/* Store Header */}
          <div className="text-center space-y-1 mb-3">
            <div className="text-lg font-bold">{storeData.storeName}</div>
            <div className="text-xs">{storeData.storeAddress}</div>
            <div className="text-xs">No. Telp {storeData.storePhone}</div>
          </div>

          {/* Receipt Number Box */}
          <div className="border-2 border-black text-center py-1 mb-3 font-bold">{receiptNumber}</div>

          {/* Dashed Separator */}
          <div className="text-center mb-3 tracking-widest">- - - - - - - - - - - - - - - - - - - - - - - - - -</div>

          {/* Transaction Info */}
          <div className="space-y-1 mb-3 text-xs">
            <div className="flex justify-between">
              <span>{formatDate(timestamp)}</span>
              <span>{cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>{formatTime(timestamp)}</span>
              <span></span>
            </div>
            <div className="text-center mt-2">No.{receiptNumber.split("-")[1]}</div>
          </div>

          {/* Dashed Separator */}
          <div className="text-center mb-3 tracking-widest">- - - - - - - - - - - - - - - - - - - - - - - - - -</div>

          {/* Items */}
          <div className="space-y-2 mb-3">
            {items.map((item, index) => (
              <div key={item.id} className="space-y-0.5">
                <div className="font-bold">
                  {index + 1}. {item.name}
                </div>
                <div className="flex justify-between text-xs">
                  <span>
                    {item.quantity} x {formatPrice(item.price)}
                  </span>
                  <span>{formatPrice(item.total)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Dashed Separator */}
          <div className="text-center mb-3 tracking-widest">- - - - - - - - - - - - - - - - - - - - - - - - - -</div>

          {/* Totals */}
          <div className="space-y-1 mb-3 text-xs">
            <div className="flex justify-between">
              <span>Total QTY : {totalQty}</span>
            </div>
            <div className="flex justify-between">
              <span>Sub Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm">
              <span>Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            {paymentMethod === "cash" && cashReceived && (
              <>
                <div className="flex justify-between">
                  <span>Bayar (Cash)</span>
                  <span>{formatPrice(cashReceived)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kembali</span>
                  <span>{formatPrice(changeAmount || 0)}</span>
                </div>
              </>
            )}
            {paymentMethod === "cashless" && (
              <div className="flex justify-between">
                <span>Bayar (Non-Tunai)</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            )}
          </div>

          {/* Dashed Separator */}
          <div className="text-center mb-3 tracking-widest">- - - - - - - - - - - - - - - - - - - - - - - - - -</div>

          {/* Footer Message */}
          <div className="text-center space-y-1 text-xs">
            <div>Terimakasih Telah Berbelanja</div>
            
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden">
        <Button onClick={() => setShowPreview(true)} variant="outline" className="touch-target bg-transparent">
          <Printer className="w-4 h-4 mr-2" />
          Cetak Struk
        </Button>

        <Button onClick={handleShare} variant="outline" className="touch-target bg-transparent">
          <Share className="w-4 h-4 mr-2" />
          Bagikan
        </Button>

        <Button onClick={onNewTransaction} className="touch-target">
          Transaksi Baru
        </Button>
      </div>

      <ReceiptPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        receiptNumber={receiptNumber}
        items={items}
        totalAmount={totalAmount}
        paymentMethod={paymentMethod}
        cashReceived={cashReceived}
        changeAmount={changeAmount}
        cashierName={cashierName}
        timestamp={timestamp}
        storeData={storeData}
      />

      {/* Print Styles */}
      <style>{`
        @page {
          size: 80mm auto;
          margin: 0;
          padding: 0;
        }
        
        @media print {
          * {
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          
          html, body {
            width: 80mm;
            height: auto;
            margin: 0;
            padding: 0;
            background: white;
          }
          
          #receipt-content {
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 4mm !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: avoid;
            display: block !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
