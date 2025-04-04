"use client"

import { useEffect } from "react"
import { useAppDispatch } from "@/lib/redux/hooks"
import { useSelector } from "react-redux"
import { Bell } from "lucide-react"

import { fetchCryptos } from "@/lib/redux/slices/cryptoSlice"
import { fetchWeather } from "@/lib/redux/slices/weatherSlice"
import { fetchNews } from "@/lib/redux/slices/newsSlice"
import { RootState } from "@/lib/redux/store"
import { useToast } from "@/hooks/use-toast"
import { connectWebSocket } from "@/lib/websocket"

import CryptoSection from "@/components/dashboard/crypto-section"
import WeatherSection from "@/components/dashboard/weather-section"
import NewsSection from "@/components/dashboard/news-section"

export default function Dashboard() {
  const dispatch = useAppDispatch()
  const { toast } = useToast()

  const selectedCryptoIds = useSelector(
    (state: RootState) => state.crypto.selectedCryptoIds
  )
  const selectedCityIds = useSelector(
    (state: RootState) => state.weather.selectedCityIds
  )

  useEffect(() => {
    // Initial data fetch
    if (selectedCryptoIds.length > 0) {
      dispatch(fetchCryptos(selectedCryptoIds))
    }

    if (selectedCityIds.length > 0) {
      dispatch(fetchWeather(selectedCityIds))
    }

    dispatch(fetchNews())

    // Data auto-refresh
    const refreshInterval = setInterval(() => {
      console.log("🔁 Refreshing data...")
      if (selectedCityIds.length > 0) {
        dispatch(fetchWeather(selectedCityIds))
      }
      dispatch(fetchNews())
    }, 60000)

    // WebSocket for price and weather alerts
    const { socket, disconnect } = connectWebSocket()
    let lastPrices: Record<string, number> = {}

    if (socket) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.type === "price_alert") {
          const { crypto, message } = data
          const currentPrice = parseFloat(message.split("$")[1])
          const lastPrice = lastPrices[crypto] || currentPrice
          const change = ((currentPrice - lastPrice) / lastPrice) * 100

          if (Math.abs(change) >= 0.01) {
            toast({
              title: "📈 Price Alert",
              description: `${crypto}: ${message}`,
            })
            lastPrices[crypto] = currentPrice
          }
        }

        if (data.type === "weather_alert") {
          toast({
            title: `🌦️ Weather Alert - ${data.city}`,
            description: `${data.message} (mock alert)`,
          })
        }
      }
    }

    return () => {
      clearInterval(refreshInterval)
      disconnect()
    }
  }, [dispatch, toast, selectedCryptoIds, selectedCityIds])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">CryptoWeather Nexus</h1>
          <button className="border rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
            <Bell className="h-4 w-4" />
          </button>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Your dashboard for real-time cryptocurrency and weather updates.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <WeatherSection />
          <CryptoSection />
        </div>
        <div>
          <NewsSection />
        </div>
      </div>
    </div>
  )
}
