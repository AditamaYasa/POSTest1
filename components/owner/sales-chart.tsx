"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SalesChartProps {
  data: Array<{
    date: string
    sales: number
    transactions: number
  }>
  type: "bar" | "line"
}

export function SalesChart({ data, type }: SalesChartProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    })
  }

  const maxSales = Math.max(...data.map((item) => item.sales))
  const minSales = Math.min(...data.map((item) => item.sales))

  const totalSales = data.reduce((sum, item) => sum + item.sales, 0)
  const totalTransactions = data.reduce((sum, item) => sum + item.transactions, 0)
  const averageSales = totalSales / data.length
  const averageTransactions = totalTransactions / data.length

  const highestSalesDay = data.reduce((prev, current) => (prev.sales > current.sales ? prev : current))
  const lowestSalesDay = data.reduce((prev, current) => (prev.sales < current.sales ? prev : current))

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-lg md:text-xl">Grafik Penjualan Bulanan</span>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {data.length} hari
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {type === "bar" ? "Bar Chart" : "Line Chart"}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="h-64 md:h-80 w-full overflow-x-auto mobile-scroll">
            <div className="min-w-full h-full relative bg-muted/20 rounded-lg p-4">
              <div
                className="flex items-end justify-between h-full gap-1 md:gap-2"
                style={{ minWidth: `${data.length * 40}px` }}
              >
                {data.map((item, index) => {
                  const height = ((item.sales - minSales) / (maxSales - minSales)) * 100
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 min-w-0">
                      <div className="flex-1 flex items-end w-full">
                        {type === "bar" ? (
                          <div
                            className="w-full bg-primary rounded-t-sm transition-all duration-300 hover:bg-primary/80 cursor-pointer group relative"
                            style={{ height: `${Math.max(height, 5)}%` }}
                            title={`${formatDate(item.date)}: ${formatPrice(item.sales)}`}
                          >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background border border-border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {formatPrice(item.sales)}
                            </div>
                          </div>
                        ) : (
                          <div className="w-full relative flex items-end">
                            <div
                              className="w-2 h-2 bg-primary rounded-full mx-auto cursor-pointer group relative"
                              style={{ marginBottom: `${Math.max(height, 5)}%` }}
                              title={`${formatDate(item.date)}: ${formatPrice(item.sales)}`}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-background border border-border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {formatPrice(item.sales)}
                              </div>
                            </div>
                            {index < data.length - 1 && (
                              <div
                                className="absolute w-full h-0.5 bg-primary/60"
                                style={{
                                  bottom: `${Math.max(height, 5)}%`,
                                  right: "-50%",
                                  transformOrigin: "left center",
                                  transform: `rotate(${Math.atan2(
                                    ((data[index + 1].sales - minSales) / (maxSales - minSales)) * 100 - height,
                                    100,
                                  )}rad)`,
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 transform -rotate-45 origin-center whitespace-nowrap">
                        {formatDate(item.date)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Total Penjualan</p>
              <p className="text-lg md:text-xl font-bold text-primary break-words">{formatPrice(totalSales)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Rata-rata Harian</p>
              <p className="text-lg md:text-xl font-bold break-words">{formatPrice(averageSales)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Penjualan Tertinggi</p>
              <p className="text-base md:text-lg font-bold text-success break-words">
                {formatPrice(highestSalesDay.sales)}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(highestSalesDay.date)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-xs md:text-sm text-muted-foreground">Penjualan Terendah</p>
              <p className="text-base md:text-lg font-bold text-destructive break-words">
                {formatPrice(lowestSalesDay.sales)}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(lowestSalesDay.date)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
