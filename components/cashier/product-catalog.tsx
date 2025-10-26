"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, Filter } from "lucide-react"
import { seedIfEmpty, evaluateAllProductsAvailability, seedExamplesIfMissing } from "@/lib/inventory"
import { getDB } from "@/lib/db"

interface Product {
  id: number
  name: string
  price: number
  category: string
  stock: number
  image_url: string
  is_active: boolean
}

interface ProductCatalogProps {
  onAddToCart: (product: Product, quantity: number) => void
}

export function ProductCatalog({ onAddToCart }: ProductCatalogProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua")
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  useEffect(() => {
    async function load() {
      await seedIfEmpty()
      await seedExamplesIfMissing()
      await evaluateAllProductsAvailability()
      const db = getDB()
      const rows = await db.products.toArray()
      const mapped: Product[] = rows.map((p) => ({
        id: p.id!,
        name: p.name,
        price: p.price,
        category: (p as any).category || "Menu", // read category from DB
        stock: p.is_active ? 100 : 0,
        image_url: p.image_url || "/produk-pos.jpg",
        is_active: p.is_active,
      }))
      setProducts(mapped)
    }
    load()
  }, [])

  const categories = ["Semua", ...Array.from(new Set(products.map((p) => p.category || "Menu")))]

  useEffect(() => {
    let filtered = products.filter((product) => product.is_active)
    if (searchQuery) {
      filtered = filtered.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    if (selectedCategory !== "Semua") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }
    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory])

  const handleQuantityChange = (productId: number, quantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, quantity),
    }))
  }

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1
    onAddToCart(product, quantity)
    setQuantities((prev) => ({ ...prev, [product.id]: 0 }))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 md:h-10 text-base md:text-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mobile-scroll no-scrollbar -mx-1 px-1 snap-x snap-mandatory">
          {categories.map((category) => {
            const count =
              category === "Semua"
                ? products.filter((p) => p.is_active).length
                : products.filter((p) => p.is_active && (p.category || "Menu") === category).length
            const selected = selectedCategory === category

            return (
              <Button
                key={category}
                variant={selected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap touch-target text-xs md:text-sm snap-start"
                aria-pressed={selected}
                aria-label={`Kategori ${category} (${count})`}
              >
                <Filter className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span>{category}</span>
                <Badge variant={selected ? "secondary" : "outline"} className="ml-2 text-[10px] md:text-xs">
                  {count}
                </Badge>
              </Button>
            )
          })}
        </div>
        {/* </CHANGE> */}
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={product.image_url || "/placeholder.svg?height=400&width=400&query=produk%20POS"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.is_active ? (
                <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                  Tersedia
                </Badge>
              ) : (
                <Badge variant="destructive" className="absolute top-2 right-2 text-xs">
                  Bahan kurang
                </Badge>
              )}
            </div>
            <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3">
              <div>
                <h3 className="font-semibold text-sm md:text-base line-clamp-2">{product.name}</h3>
                <p className="text-xs text-muted-foreground">{product.category}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-primary text-sm md:text-base break-words">
                  {formatPrice(product.price)}
                </span>
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 touch-target"
                    onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) - 1)}
                  >
                    -
                  </Button>
                  <span className="px-2 md:px-3 py-1 text-sm min-w-[32px] md:min-w-[40px] text-center">
                    {quantities[product.id] || 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 touch-target"
                    onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) + 1)}
                  >
                    +
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.is_active}
                  className="flex-1 touch-target text-xs md:text-sm"
                >
                  <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                  <span className="hidden xs:inline">{product.is_active ? "Tambah" : "Tidak Tersedia"}</span>
                  <span className="xs:hidden">{product.is_active ? "+" : "x"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 md:py-12">
          <p className="text-muted-foreground text-sm md:text-base">Tidak ada produk yang ditemukan</p>
        </div>
      )}
    </div>
  )
}
