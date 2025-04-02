"use client"

import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { Bell } from "lucide-react"

import { fetchCryptos } from "@/lib/redux/slices/cryptoSlice"
import { fetchWeather } from "@/lib/redux/slices/weatherSlice"
import { fetchNews } from "@/lib/redux/slices/newsSlice"
import { useToast } from "@/hooks/use-toast"
import CryptoSection from "@/components/dashboard/crypto-section"
import WeatherSection from "@/components/dashboard/weather-section"
import NewsSection from "@/components/dashboard/news-section"
import { Button } from "@/components/ui/button"
import { connectWebSocket } from "@/lib/websocket"

export default function Dashboard() {
  const dispatch = useDispatch()
  const { toast } = useToast()

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchCryptos())
    dispatch(fetchWeather())
    dispatch(fetchNews())

    // Set up periodic refresh (every 60 seconds)
    const refreshInterval = setInterval(() => {
      dispatch(fetchCryptos())
      dispatch(fetchWeather())
      dispatch(fetchNews())
    }, 60000)

    // Set up WebSocket connection
    const { disconnect, socket } = connectWebSocket()

    if (socket) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)

        // Handle different types of notifications
        if (data.type === "price_alert") {
          toast({
            title: "Price Alert",
            description: `${data.crypto}: ${data.message}`,
            variant: "default",
          })
        } else if (data.type === "weather_alert") {
          toast({
            title: "Weather Alert",
            description: data.message,
            variant: "destructive",
          })
        }
      }
    }

    return () => {
      clearInterval(refreshInterval)
      disconnect()
    }
  }, [dispatch, toast])

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">CryptoWeather Nexus</h1>
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-muted-foreground">Your dashboard for crypto and weather updates</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid gap-6">
            <WeatherSection />
            <CryptoSection />
          </div>
        </div>
        <div>
          <NewsSection />
        </div>
      </div>
    </div>
  )
}

