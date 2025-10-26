"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  category: string
}

interface ShoppingCartProps {
  items: CartItem[]
  onUpdateQuantity: (id: number, quantity: number) => void
  onRemoveItem: (id: number) => void
  onCheckout: () => void
}

export function ShoppingCartComponent({ items, onUpdateQuantity, onRemoveItem, onCheckout }: ShoppingCartProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (items.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
            Keranjang Belanja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 md:py-12">
            <ShoppingCart className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
            <p className="text-muted-foreground text-sm md:text-base">Keranjang masih kosong</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Tambahkan produk untuk memulai transaksi</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 md:pb-4">
        <CardTitle className="flex items-center justify-between text-base md:text-lg">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
            <span className="truncate">Keranjang Belanja</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-3 md:p-6">
        <div className="flex-1 space-y-2 md:space-y-3 max-h-80 md:max-h-96 overflow-y-auto mobile-scroll">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 border rounded-lg">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-xs md:text-sm truncate">{item.name}</h4>
                <p className="text-xs text-muted-foreground">{item.category}</p>
                <p className="text-xs md:text-sm font-semibold text-primary break-words">{formatPrice(item.price)}</p>
              </div>

              <div className="flex items-center gap-1 md:gap-2 shrink-0">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 md:h-8 md:w-8 p-0 touch-target"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="px-2 md:px-3 py-1 text-xs md:text-sm min-w-[32px] md:min-w-[40px] text-center">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 md:h-8 md:w-8 p-0 touch-target"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 md:h-8 md:w-8 p-0 text-destructive hover:text-destructive touch-target"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 md:space-y-4 pt-3 md:pt-4">
          <Separator />

          <div className="space-y-1 md:space-y-2">
            <div className="flex justify-between text-xs md:text-sm">
              <span>
                Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})
              </span>
              <span className="break-words">{formatPrice(totalAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-base md:text-lg">
              <span>Total</span>
              <span className="text-primary break-words">{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <Button onClick={onCheckout} className="w-full touch-target text-sm md:text-base" size="lg">
            Lanjut ke Pembayaran
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
