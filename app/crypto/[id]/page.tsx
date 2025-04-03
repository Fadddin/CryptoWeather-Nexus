"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
} from "lucide-react"
import axios from "axios"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import CryptoChart from "@/components/crypto/crypto-chart"
import CryptoMetrics from "@/components/crypto/crypto-metrics"
import { connectCryptoWebSocket } from "@/lib/websocket"

export default function CryptoDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [crypto, setCrypto] = useState<any>(null)
  const [chartData, setChartData] = useState<{ date: string; price: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("7") // default is 7 days

  // Fetch crypto details + chart data
  useEffect(() => {
    async function fetchCryptoDetails() {
      try {
        setLoading(true)

        // Current price data
        const res = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
          params: {
            vs_currency: "usd",
            ids: id,
          },
        })
        const data = res.data[0]

        // Chart history
        const historyRes = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${id}/market_chart`,
          {
            params: {
              vs_currency: "usd",
              days: timeframe,
            },
          }
        )

        const history = historyRes.data.prices.map(
          ([timestamp, price]: [number, number]) => {
            const date = new Date(timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
            return { date, price }
          }
        )

        setChartData(history)

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
  }, [id, timeframe, router])

  // Live updates
  useEffect(() => {
    if (!crypto?.id) return

    const { disconnect } = connectCryptoWebSocket([crypto.id], (coinId, price) => {
      setCrypto((prev: any) => {
        if (!prev || prev.id !== coinId) return prev
        const changePercent = ((price - prev.initialPrice) / prev.initialPrice) * 100
        return {
          ...prev,
          price,
          priceChange24h: changePercent,
        }
      })
    })

    return () => disconnect()
  }, [crypto?.id])

  const extendedMetrics = {
    volume24h: crypto?.price * 1000000,
    allTimeHigh: crypto?.ath,
    allTimeHighDate: new Date(crypto?.athDate).toLocaleDateString(),
    circulatingSupply: Math.round(crypto?.circulatingSupply || 0),
    maxSupply: crypto?.maxSupply || "∞",
    rank: crypto?.rank,
  }

  if (!crypto || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Loading...</h1>
        </div>
        <div className="h-64 bg-muted rounded-md animate-pulse" />
      </div>
    )
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

      {/* Metrics Grid */}
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

      {/* Chart & Metrics Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Historical Data</CardTitle>
              <CardDescription>
                Price history and trading volume
              </CardDescription>
            </div>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 Hours</SelectItem>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
