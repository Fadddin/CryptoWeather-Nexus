"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react"
import axios from "axios"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CryptoChart from "@/components/crypto/crypto-chart"
import CryptoMetrics from "@/components/crypto/crypto-metrics"
import { connectCryptoWebSocket } from "@/lib/websocket"

export default function CryptoDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [crypto, setCrypto] = useState<any>(null)
  const [chartData, setChartData] = useState<{ date: string; price: number }[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch real crypto data and history
  useEffect(() => {
    async function fetchCryptoDetails() {
      try {
        // 1. Current market data
        const res = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
          params: {
            vs_currency: "usd",
            ids: id,
          },
        })
        const data = res.data[0]

        // 2. Historical chart data (7 days)
        const historyRes = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
          {
            params: {
              vs_currency: "usd",
              days: 7,
            },
          }
        )

        const history = historyRes.data.prices.map(([timestamp, price]: [number, number]) => {
          const date = new Date(timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
          return { date, price }
        })

        setChartData(history)

        // 3. Set coin state
        setCrypto({
          id: data.id,
          name: data.name,
          symbol: data.symbol.toUpperCase(),
          price: data.current_price,
          initialPrice: data.current_price,
          priceChange24h: data.price_change_percentage_24h,
          marketCap: data.market_cap,
          circulatingSupply: data.circulating_supply,
          maxSupply: data.max_supply,
          ath: data.ath,
          athDate: data.ath_date,
          rank: data.market_cap_rank,
        })

        setLoading(false)
      } catch (error) {
        console.error("Failed to load crypto data:", error)
        router.push("/")
      }
    }

    if (id) {
      fetchCryptoDetails()
    }
  }, [id, router])

  // Real-time price updates
  useEffect(() => {
    if (!crypto?.id) return

    const { disconnect } = connectCryptoWebSocket([crypto.id], (coinId, price) => {
      setCrypto((prev: any) => {
        if (!prev || prev.id !== coinId) return prev

        const changePercent = ((price - prev.initialPrice) / prev.initialPrice) * 100

        return {
          ...prev,
          price: price,
          priceChange24h: changePercent,
        }
      })
    })

    return () => disconnect()
  }, [crypto?.id])

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

  const extendedMetrics = {
    volume24h: crypto.price * 1000000, // Simulated
    allTimeHigh: crypto.ath,
    allTimeHighDate: new Date(crypto.athDate).toLocaleDateString(),
    circulatingSupply: Math.round(crypto.circulatingSupply),
    maxSupply: crypto.maxSupply || "∞",
    rank: crypto.rank,
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
              <div className="text-3xl font-bold">
                ${crypto.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
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
                  <div className="text-3xl font-bold text-green-500">
                    +{crypto.priceChange24h.toFixed(2)}%
                  </div>
                </>
              ) : (
                <>
                  <TrendingDown className="mr-2 h-4 w-4 text-red-500" />
                  <div className="text-3xl font-bold text-red-500">
                    {crypto.priceChange24h.toFixed(2)}%
                  </div>
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
              <div className="text-3xl font-bold">
                ${(crypto.marketCap / 1e9).toFixed(2)}B
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historical Data</CardTitle>
          <CardDescription>Price history and trading volume (last 7 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart">
            <TabsList className="mb-4">
              <TabsTrigger value="chart">Price Chart</TabsTrigger>
              <TabsTrigger value="metrics">Extended Metrics</TabsTrigger>
            </TabsList>
            <TabsContent value="chart">
              <CryptoChart data={chartData} />
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
