"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RootState } from "@/lib/redux/store"
import CryptoChart from "@/components/crypto/crypto-chart"
import CryptoMetrics from "@/components/crypto/crypto-metrics"

export default function CryptoDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { cryptos } = useSelector((state: RootState) => state.crypto)
  const [crypto, setCrypto] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (cryptos.length > 0) {
      const foundCrypto = cryptos.find((c) => c.id === id)
      if (foundCrypto) {
        setCrypto(foundCrypto)
        // Simulate fetching historical data
        setTimeout(() => {
          setLoading(false)
        }, 500)
      } else {
        router.push("/")
      }
    }
  }, [cryptos, id, router])

  if (!crypto || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Loading...</h1>
        </div>
        <div className="h-64 bg-muted rounded-md animate-pulse"></div>
      </div>
    )
  }

  // Mock historical price data
  const historicalPrices = [
    { date: "2023-04-01", price: crypto.price * 0.95 },
    { date: "2023-04-02", price: crypto.price * 0.97 },
    { date: "2023-04-03", price: crypto.price * 0.99 },
    { date: "2023-04-04", price: crypto.price * 0.98 },
    { date: "2023-04-05", price: crypto.price * 1.01 },
    { date: "2023-04-06", price: crypto.price * 1.03 },
    { date: "2023-04-07", price: crypto.price },
  ]

  // Mock extended metrics
  const extendedMetrics = {
    volume24h: crypto.price * 1000000 * (0.8 + Math.random() * 0.4),
    allTimeHigh: crypto.price * 1.5,
    allTimeHighDate: "2021-11-10",
    circulatingSupply: Math.round(crypto.marketCap / crypto.price),
    maxSupply: crypto.symbol === "BTC" ? 21000000 : null,
    rank: crypto.symbol === "BTC" ? 1 : crypto.symbol === "ETH" ? 2 : 3,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">
          {crypto.name} ({crypto.symbol})
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
              <div className="text-3xl font-bold">{crypto.price.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">24h Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {crypto.priceChange24h >= 0 ? (
                <>
                  <TrendingUp className="mr-2 h-4 w-4 text-green-500" />
                  <div className="text-3xl font-bold text-green-500">+{crypto.priceChange24h.toFixed(2)}%</div>
                </>
              ) : (
                <>
                  <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                  <div className="text-3xl font-bold text-red-500">{crypto.priceChange24h.toFixed(2)}%</div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-3xl font-bold">${(crypto.marketCap / 1000000000).toFixed(2)}B</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historical Data</CardTitle>
          <CardDescription>Price history and trading volume</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart">
            <TabsList className="mb-4">
              <TabsTrigger value="chart">Price Chart</TabsTrigger>
              <TabsTrigger value="metrics">Extended Metrics</TabsTrigger>
            </TabsList>
            <TabsContent value="chart">
              <CryptoChart data={historicalPrices} />
            </TabsContent>
            <TabsContent value="metrics">
              <CryptoMetrics metrics={extendedMetrics} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

