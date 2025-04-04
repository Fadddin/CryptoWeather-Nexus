"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Droplets, Wind } from "lucide-react"
import type { RootState } from "@/lib/redux/store"
import WeatherChart from "@/components/weather/weather-chart"
import WeatherTable from "@/components/weather/weather-table"

export default function WeatherDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { cities } = useSelector((state: RootState) => state.weather)
  const [city, setCity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"chart" | "table">("chart")

  useEffect(() => {
    if (cities.length > 0) {
      const foundCity = cities.find((c) => c.id === id)
      if (foundCity) {
        setCity(foundCity)
        setTimeout(() => {
          setLoading(false)
        }, 500)
      } else {
        router.push("/")
      }
    }
  }, [cities, id, router])

  if (!city || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-2xl font-bold ml-2">Loading...</h1>
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
      </div>
    )
  }

  const historicalData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return {
      date: date.toISOString().split("T")[0],
      temperature: Math.round(city.temperature - 2 + Math.random() * 4),
      humidity: Math.round(city.humidity - 5 + Math.random() * 10),
    }
  }).reverse()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-2xl font-bold ml-2 text-gray-900 dark:text-white">
          {city.name} Weather
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Temperature
          </h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {city.temperature}°C
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{city.condition}</p>
        </div>

        <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Humidity</h3>
          <div className="flex items-center">
            <Droplets className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {city.humidity}%
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Wind Speed
          </h3>
          <div className="flex items-center">
            <Wind className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {city.windSpeed} km/h
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-white dark:bg-gray-900">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Historical Data
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Weather data for the past 7 days (dummy)
          </p>
        </div>

        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setTab("chart")}
            className={`px-4 py-1 text-sm rounded ${
              tab === "chart"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Chart
          </button>
          <button
            onClick={() => setTab("table")}
            className={`px-4 py-1 text-sm rounded ${
              tab === "table"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Table
          </button>
        </div>

        <div>
          {tab === "chart" ? (
            <WeatherChart data={historicalData} />
          ) : (
            <WeatherTable data={historicalData} />
          )}
        </div>
      </div>
    </div>
  )
}
