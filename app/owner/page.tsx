"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DailyStats } from "@/components/owner/daily-stats"
import { PaymentAnalysis } from "@/components/owner/payment-analysis"
import { MonthlyStats } from "@/components/owner/monthly-stats"
import { SalesChart } from "@/components/owner/sales-chart"
import { BusinessInsights } from "@/components/owner/business-insights"
import { ExportReports } from "@/components/owner/export-reports"
import { MenuManagement } from "@/components/owner/menu-management"
import MaterialsTable from "@/components/owner/materials-table"
import { PasswordSettings } from "@/components/owner/password-settings"
import { ArrowLeft, BarChart3, Calendar, TrendingUp, BarChart, LineChart } from "lucide-react"
import { useRouter } from "next/navigation"
import { getOwnerDashboardData, seedIfEmpty, seedExamplesIfMissing, getLowStockMaterials } from "@/lib/inventory"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function OwnerPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [chartType, setChartType] = useState<"bar" | "line">("bar")
  const [loading, setLoading] = useState(true)
  const [DATA, setDATA] = useState({
    daily: {
      todaySales: 0,
      todayTransactions: 0,
      cashPayments: 0,
      cashlessPayments: 0,
      topProduct: { name: "—", quantity: 0 },
      recentTransactions: [] as Array<{ id: string; time: string; amount: number; method: "cash" | "cashless" }>,
    },
    payment: {
      cashAmount: 0,
      cashlessAmount: 0,
      totalAmount: 0,
      cashTransactions: 0,
      cashlessTransactions: 0,
      totalTransactions: 0,
    },
    monthly: {
      monthlySales: 0,
      monthlyTransactions: 0,
      cashPayments: 0,
      cashlessPayments: 0,
      topProduct: { name: "—", quantity: 0, revenue: 0 },
      salesGrowth: 0,
      transactionGrowth: 0,
      dailyBreakdown: [] as Array<{ date: string; sales: number; transactions: number }>,
      peakHours: [] as Array<{ hour: string; transactions: number; percentage: number }>,
    },
  })
  const [lowStock, setLowStock] = useState<
    Array<{ name: string; stock_quantity: number; unit: string; min_stock?: number }>
  >([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      await seedIfEmpty()
      await seedExamplesIfMissing()
      const [result, low] = await Promise.all([getOwnerDashboardData(), getLowStockMaterials()])
      if (mounted) {
        setDATA(result)
        setLowStock(low)
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const insightsData = {
    dailySales: DATA.daily.todaySales,
    yesterdaySales: 0, // unknown offline; bisa ditingkatkan kemudian
    cashPercentage: DATA.payment.totalAmount > 0 ? (DATA.payment.cashAmount / DATA.payment.totalAmount) * 100 : 0,
    peakHour: DATA.monthly.peakHours[0]?.hour ?? "—",
    peakTransactions: DATA.monthly.peakHours[0]?.transactions ?? 0,
    topProduct: DATA.daily.topProduct.name,
    salesTrend: DATA.monthly.salesGrowth,
    averageTransaction: DATA.daily.todayTransactions ? DATA.daily.todaySales / DATA.daily.todayTransactions : 0,
  }

  const exportData = {
    dailySales: DATA.daily.todaySales,
    monthlySales: DATA.monthly.monthlySales,
    totalTransactions: DATA.daily.todayTransactions,
    lastExportDate: new Date().toISOString(),
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between p-3 md:p-4">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="touch-target shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-sm md:text-base truncate">Dashboard Pemilik</h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">{currentDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0"></div>
        </div>
      </div>

      <div className="p-3 md:p-4 space-y-4 md:space-y-6">
        {lowStock.length > 0 && (
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <AlertTitle>Peringatan stok menipis</AlertTitle>
            <AlertDescription>
              {lowStock.map((m) => `${m.name} (${m.stock_quantity}/${m.min_stock ?? 0} ${m.unit})`).join(", ")}.{" "}
              <Link href="/owner/materials" className="underline">
                Kelola bahan baku
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg shrink-0">
                  <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Penjualan Hari Ini</p>
                  <p className="text-lg md:text-2xl font-bold text-primary break-words">
                    {formatPrice(DATA.daily.todaySales)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-success/10 rounded-lg shrink-0">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-success" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Total Transaksi</p>
                  <p className="text-lg md:text-2xl font-bold">{DATA.daily.todayTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-info/10 rounded-lg shrink-0">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-info" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Rata-rata per Transaksi</p>
                  <p className="text-lg md:text-2xl font-bold break-words">
                    {formatPrice(DATA.daily.todaySales / DATA.daily.todayTransactions)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <div className="relative">
            {/* Mobile: Scrollable tabs with fade indicators */}
            <div className="lg:hidden">
              <div className="relative overflow-hidden">
                {/* Left fade indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                {/* Right fade indicator */}
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

                <div className="overflow-x-auto mobile-scroll pb-2">
                  <TabsList className="flex w-max gap-1 p-1 bg-muted rounded-lg">
                    <TabsTrigger value="overview" className="text-xs whitespace-nowrap px-3 py-2">
                      📊 Harian
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="text-xs whitespace-nowrap px-3 py-2">
                      💳 Pembayaran
                    </TabsTrigger>
                    <TabsTrigger value="monthly" className="text-xs whitespace-nowrap px-3 py-2">
                      📅 Bulanan
                    </TabsTrigger>
                    <TabsTrigger value="charts" className="text-xs whitespace-nowrap px-3 py-2">
                      📈 Grafik
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="text-xs whitespace-nowrap px-3 py-2">
                      💡 Wawasan
                    </TabsTrigger>
                    <TabsTrigger value="materials" className="text-xs whitespace-nowrap px-3 py-2">
                      🧪 Bahan
                    </TabsTrigger>
                    <TabsTrigger value="menu" className="text-xs whitespace-nowrap px-3 py-2">
                      🍽️ Menu
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="text-xs whitespace-nowrap px-3 py-2">
                      ⚙️ Pengaturan
                    </TabsTrigger>
                    <TabsTrigger value="export" className="text-xs whitespace-nowrap px-3 py-2">
                      📤 Ekspor
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              {/* Mobile: Current tab indicator */}
              <div className="mt-2 text-center">
                <span className="text-xs text-muted-foreground">
                  {activeTab === "overview" && "📊 Laporan Harian"}
                  {activeTab === "payments" && "💳 Analisis Pembayaran"}
                  {activeTab === "monthly" && "📅 Statistik Bulanan"}
                  {activeTab === "charts" && "📈 Grafik Penjualan"}
                  {activeTab === "insights" && "💡 Wawasan Bisnis"}
                  {activeTab === "materials" && "🧪 Bahan Baku"}
                  {activeTab === "menu" && "🍽️ Manajemen Menu"}
                  {activeTab === "settings" && "⚙️ Pengaturan Keamanan"}
                  {activeTab === "export" && "📤 Ekspor Laporan"}
                </span>
              </div>
            </div>

            {/* Desktop: Grid layout */}
            <div className="hidden lg:block">
              <TabsList className="grid w-full grid-cols-9">
                <TabsTrigger value="overview" className="text-sm">
                  Harian
                </TabsTrigger>
                <TabsTrigger value="payments" className="text-sm">
                  Pembayaran
                </TabsTrigger>
                <TabsTrigger value="monthly" className="text-sm">
                  Bulanan
                </TabsTrigger>
                <TabsTrigger value="charts" className="text-sm">
                  Grafik
                </TabsTrigger>
                <TabsTrigger value="insights" className="text-sm">
                  Wawasan
                </TabsTrigger>
                <TabsTrigger value="materials" className="text-sm">
                  Bahan
                </TabsTrigger>
                <TabsTrigger value="menu" className="text-sm">
                  Menu
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-sm">
                  Pengaturan
                </TabsTrigger>
                <TabsTrigger value="export" className="text-sm">
                  Ekspor
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">Memuat data...</p>
            ) : (
              <DailyStats data={DATA.daily} />
            )}
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">Memuat data...</p>
            ) : (
              <PaymentAnalysis data={DATA.payment} />
            )}
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            {loading ? (
              <p className="text-sm text-muted-foreground">Memuat data...</p>
            ) : (
              <MonthlyStats data={DATA.monthly} />
            )}
          </TabsContent>

          <TabsContent value="charts" className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-2 mb-4 mobile-button-group">
              <Button
                variant={chartType === "bar" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("bar")}
                className="touch-target"
              >
                <BarChart className="w-4 h-4 mr-2" />
                <span className="text-xs md:text-sm">Bar Chart</span>
              </Button>
              <Button
                variant={chartType === "line" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("line")}
                className="touch-target"
              >
                <LineChart className="w-4 h-4 mr-2" />
                <span className="text-xs md:text-sm">Line Chart</span>
              </Button>
            </div>
            {!loading && <SalesChart data={DATA.monthly.dailyBreakdown} type={chartType} />}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {!loading && <BusinessInsights data={insightsData} />}
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <MaterialsTable />
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            <MenuManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <PasswordSettings />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <ExportReports data={exportData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
