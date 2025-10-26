"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CaseLower as CashRegister, BarChart3, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<"cashier" | "owner" | null>(null)

  const handleRoleSelection = (role: "cashier" | "owner") => {
    if (role === "cashier") {
      router.push("/cashier")
    } else {
      router.push("/owner/login")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-sm md:max-w-md space-y-6 md:space-y-8">
        <div className="text-center space-y-3 md:space-y-4">
          <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-2xl mx-auto">
            <CashRegister className="w-7 h-7 md:w-8 md:h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-balance">POS System</h1>
            <p className="text-sm md:text-base text-muted-foreground text-pretty px-2">
              Sistem Point of Sale untuk Kasir dan Pemilik Toko
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:gap-4">
          <Card
            className="cursor-pointer hover:bg-accent/50 transition-colors touch-target"
            onClick={() => handleRoleSelection("cashier")}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl shrink-0">
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-base">Kasir</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Kelola transaksi dan penjualan</p>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">
                  Cashier
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-accent/50 transition-colors touch-target"
            onClick={() => handleRoleSelection("owner")}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl shrink-0">
                  <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-base">Pemilik</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Lihat laporan dan analisis bisnis</p>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">
                  Owner
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">Pilih peran Anda untuk melanjutkan</p>
        </div>
      </div>
    </div>
  )
}
