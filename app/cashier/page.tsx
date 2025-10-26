"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ProductCatalog } from "@/components/cashier/product-catalog"
import { ShoppingCartComponent } from "@/components/cashier/shopping-cart"
import { ArrowLeft, ShoppingCart, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface Product {
  id: number
  name: string
  price: number
  category: string
  stock: number
  image_url: string
  is_active: boolean
}

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  category: string
}

export default function CashierPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)

  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id)

      if (existingItem) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item))
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          category: product.category,
        },
      ]
    })
  }

  const handleUpdateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id)
      return
    }

    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const handleRemoveItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleCheckout = () => {
    localStorage.setItem("checkoutItems", JSON.stringify(cartItems))
    router.push("/cashier/checkout")
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="touch-target shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-sm md:text-base truncate">Mode Kasir</h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">Kelola transaksi penjualan</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCart(!showCart)}
              className="relative touch-target"
            >
              <ShoppingCart className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Keranjang</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 md:gap-6 p-3 md:p-4">
        {/* Product Catalog */}
        <div className={`flex-1 ${showCart ? "lg:w-2/3" : "w-full"}`}>
          <ProductCatalog onAddToCart={handleAddToCart} />
        </div>

        {showCart && (
          <div className="fixed inset-0 z-30 lg:hidden bg-background/80 backdrop-blur-sm">
            <div className="absolute inset-x-0 bottom-0 top-16 bg-background border-t border-border rounded-t-xl">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-semibold">Keranjang Belanja</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowCart(false)} className="touch-target">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <ShoppingCartComponent
                  items={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onCheckout={handleCheckout}
                />
              </div>
            </div>
          </div>
        )}

        {/* Desktop Cart */}
        <div className={`hidden lg:block lg:w-1/3`}>
          <div className="sticky top-24">
            <ShoppingCartComponent
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>

      {!showCart && totalItems > 0 && (
        <div className="fixed bottom-4 right-4 lg:hidden z-20">
          <Button onClick={() => setShowCart(true)} className="rounded-full w-14 h-14 shadow-lg touch-target" size="lg">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          </Button>
        </div>
      )}
    </div>
  )
}
