"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Printer } from "lucide-react"

interface ReceiptItem {
  id: number
  name: string
  quantity: number
  price: number
  total: number
}

interface ReceiptPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  receiptNumber: string
  items: ReceiptItem[]
  totalAmount: number
  paymentMethod: "cash" | "cashless"
  cashReceived?: number
  changeAmount?: number
  cashierName: string
  timestamp: Date
  storeData: {
    storeName: string
    storeAddress: string
    storePhone: string
  }
}

export function ReceiptPreviewModal({
  isOpen,
  onClose,
  receiptNumber,
  items,
  totalAmount,
  paymentMethod,
  cashReceived,
  changeAmount,
  cashierName,
  timestamp,
  storeData,
}: ReceiptPreviewModalProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  if (!isOpen) return null

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

  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 100)
  }

  return (
    <>
      {/* Modal Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto w-full max-w-sm">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Preview Struk</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Receipt Preview - 80mm width */}
          <div className="p-4 flex justify-center bg-gray-50">
            <div
              className="bg-white text-black p-4 font-mono text-xs border border-gray-300 shadow-sm"
              style={{ width: "80mm" }}
              id="receipt-preview-content"
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
              <div className="text-center mb-3 tracking-widest">
                - - - - - - - - - - - - - - - - - - - - - - - - - -
              </div>

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
              <div className="text-center mb-3 tracking-widest">
                - - - - - - - - - - - - - - - - - - - - - - - - - -
              </div>

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
              <div className="text-center mb-3 tracking-widest">
                - - - - - - - - - - - - - - - - - - - - - - - - - -
              </div>

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
              <div className="text-center mb-3 tracking-widest">
                - - - - - - - - - - - - - - - - - - - - - - - - - -
              </div>

              {/* Footer Message */}
              <div className="text-center space-y-1 text-xs">
                <div>Terimakasih Telah Berbelanja</div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t p-4 flex gap-3 bg-gray-50">
            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
              Tutup
            </Button>
            <Button onClick={handlePrint} className="flex-1" disabled={isPrinting}>
              <Printer className="w-4 h-4 mr-2" />
              {isPrinting ? "Mempersiapkan..." : "Cetak Sekarang"}
            </Button>
          </div>

          {/* Print Styles */}
          <style>{`
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              
              * {
                margin: 0 !important;
                padding: 0 !important;
              }
              
              #receipt-preview-content {
                width: 80mm !important;
                max-width: 80mm !important;
                margin: 0 !important;
                padding: 4mm !important;
                box-shadow: none !important;
                border: none !important;
                page-break-after: avoid;
              }
              
              @page {
                size: 80mm auto;
                margin: 0;
                padding: 0;
              }
            }
          `}</style>
        </div>
      </div>
    </>
  )
}
