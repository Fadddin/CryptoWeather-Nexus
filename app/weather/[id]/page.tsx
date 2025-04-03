"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Droplets, Wind } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RootState } from "@/lib/redux/store"
import WeatherChart from "@/components/weather/weather-chart"
import WeatherTable from "@/components/weather/weather-table"

export default function WeatherDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { cities } = useSelector((state: RootState) => state.weather)
  const [city, setCity] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (cities.length > 0) {
      const foundCity = cities.find((c) => c.id === id)
      if (foundCity) {
        setCity(foundCity)
        // Simulate fetching historical data
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
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Loading...</h1>
        </div>
        <div className="h-64 bg-muted rounded-md animate-pulse"></div>
      </div>
    )
  }

  // Mock historical data
  const historicalData = [
    {
      date: "2023-04-01",
      temperature: Math.round(city.temperature - 2 + Math.random() * 4),
      humidity: Math.round(city.humidity - 5 + Math.random() * 10),
    },
    {
      date: "2023-04-02",
      temperature: Math.round(city.temperature - 2 + Math.random() * 4),
      humidity: Math.round(city.humidity - 5 + Math.random() * 10),
    },
    {
      date: "2023-04-03",
      temperature: Math.round(city.temperature - 2 + Math.random() * 4),
      humidity: Math.round(city.humidity - 5 + Math.random() * 10),
    },
    {
      date: "2023-04-04",
      temperature: Math.round(city.temperature - 2 + Math.random() * 4),
      humidity: Math.round(city.humidity - 5 + Math.random() * 10),
    },
    {
      date: "2023-04-05",
      temperature: Math.round(city.temperature - 2 + Math.random() * 4),
      humidity: Math.round(city.humidity - 5 + Math.random() * 10),
    },
    {
      date: "2023-04-06",
      temperature: Math.round(city.temperature - 2 + Math.random() * 4),
      humidity: Math.round(city.humidity - 5 + Math.random() * 10),
    },
    {
      date: "2023-04-07",
      temperature: Math.round(city.temperature - 2 + Math.random() * 4),
      humidity: Math.round(city.humidity - 5 + Math.random() * 10),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">{city.name} Weather</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-3xl font-bold">{city.temperature}°C</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{city.condition}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Humidity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Droplets className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-3xl font-bold">{city.humidity}%</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Wind Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wind className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-3xl font-bold">{city.windSpeed} km/h</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historical Data</CardTitle>
          <CardDescription>Weather data for the past 7 days</CardDescription>
          <CardDescription>Dummy data, history not available in free tier</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart">
            <TabsList className="mb-4">
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
            <TabsContent value="chart">
              <WeatherChart data={historicalData} />
            </TabsContent>
            <TabsContent value="table">
              <WeatherTable data={historicalData} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

