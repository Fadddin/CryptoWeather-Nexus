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
import CryptoChart from "@/components/crypto/crypto-chart"
import CryptoMetrics from "@/components/crypto/crypto-metrics"
import { connectCryptoWebSocket } from "@/lib/websocket"

export default function CryptoDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [crypto, setCrypto] = useState<any>(null)
  const [chartData, setChartData] = useState<{ date: string; price: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("7")
  const [tab, setTab] = useState("chart")

  useEffect(() => {
    async function fetchCryptoDetails() {
      try {
        setLoading(true)

        const res = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
          params: {
            vs_currency: "usd",
            ids: id,
          },
        })
        const data = res.data[0]

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
          <button onClick={() => router.back()} className="text-sm text-gray-600 hover:underline flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button onClick={() => router.back()} className="text-sm text-gray-600 hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold ml-4">
          {crypto.name} ({crypto.symbol})
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Price</p>
          <div className="flex items-center text-3xl font-bold">
            <DollarSign className="mr-1 h-5 w-5 text-gray-500" />
            ${crypto.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">24h Change</p>
          <div className="flex items-center text-3xl font-bold">
            {crypto.priceChange24h >= 0 ? (
              <>
                <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                <span className="text-green-500">
                  +{crypto.priceChange24h.toFixed(2)}%
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="mr-2 h-5 w-5 text-red-500" />
                <span className="text-red-500">
                  {crypto.priceChange24h.toFixed(2)}%
                </span>
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Market Cap</p>
          <div className="flex items-center text-3xl font-bold">
            <BarChart3 className="mr-2 h-5 w-5 text-gray-500" />
            ${(crypto.marketCap / 1e9).toFixed(2)}B
          </div>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Historical Data</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Price & metrics</p>
          </div>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <option value="1">Last 24 Hours</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setTab("chart")}
            className={`px-4 py-1 text-sm rounded ${
              tab === "chart"
                ? "bg-gray-900 text-white"
                : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Price Chart
          </button>
          <button
            onClick={() => setTab("metrics")}
            className={`px-4 py-1 text-sm rounded ${
              tab === "metrics"
                ? "bg-gray-900 text-white"
                : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Extended Metrics
          </button>
        </div>

        <div className="mt-4">
          {tab === "metrics" ? (
            <CryptoMetrics metrics={extendedMetrics} />
          ) : (
            <CryptoChart data={chartData} />
          )}
        </div>
      </div>
    </div>
  )
}
