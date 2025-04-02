"use client"

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { useEffect } from "react"
import { Star, MapPin, Droplets, Wind } from "lucide-react"
import Link from "next/link"
import Combobox from "@/components/combobox/CityCombobox"


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import {
  fetchWeather,
  toggleFavoriteCity,
  setSelectedCities,
} from "@/lib/redux/slices/weatherSlice"
import type { RootState } from "@/lib/redux/store"

export default function WeatherSection() {
  const dispatch = useAppDispatch()
  const { cities, loading, error, selectedCityIds } = useAppSelector((state: RootState) => state.weather)

  const allCities = [
    { id: "new-york", name: "New York" },
    { id: "san-francisco", name: "San Francisco" },
    { id: "mumbai", name: "Mumbai" },
    { id: "london", name: "London" },
    { id: "tokyo", name: "Tokyo" },
    { id: "paris", name: "Paris" },
    { id: "sydney", name: "Sydney" },
    { id: "berlin", name: "Berlin" },
    { id: "dubai", name: "Dubai" },
    { id: "moscow", name: "Moscow" },
    { id: "shanghai", name: "Shanghai" },
    { id: "singapore", name: "Singapore" },
  ]
  

  useEffect(() => {
    if (selectedCityIds.length === 0) {
      dispatch(setSelectedCities(["new-york", "san-francisco", "mumbai"]))
    } else {
      dispatch(fetchWeather(selectedCityIds))
    }
  }, [dispatch, selectedCityIds])

  // On first load, read from localStorage
useEffect(() => {
  const saved = localStorage.getItem("selectedCityIds")
  if (saved) {
    dispatch(setSelectedCities(JSON.parse(saved)))
  } else {
    dispatch(setSelectedCities(["new-york", "san-francisco", "mumbai"]))
  }
}, [dispatch])

// When city list changes, save to localStorage
useEffect(() => {
  if (selectedCityIds.length > 0) {
    localStorage.setItem("selectedCityIds", JSON.stringify(selectedCityIds))
  }
}, [selectedCityIds])


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather</CardTitle>
          <CardDescription>Current conditions in selected cities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 rounded-md border p-4">
                <div className="space-y-2 w-full">
                  <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weather</CardTitle>
          <CardDescription>Current conditions in selected cities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 p-4 rounded-md">
            <p className="text-destructive">Failed to load weather data. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
  {/* City Selection Card */}
  <Card className="mb-4">
  <CardHeader>
    <CardTitle>Track Cities</CardTitle>
    <CardDescription>Add or remove cities to monitor weather</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex flex-col gap-4">
      {/* Combobox for adding a new city */}
      <div className="max-w-sm">
        <Combobox
          cities={allCities}
          onSelect={(cityId) => {
            if (!selectedCityIds.includes(cityId)) {
              dispatch(setSelectedCities([...selectedCityIds, cityId]))
            }
          }}
        />
      </div>

      {/* List of selected cities with remove buttons */}
      <div className="flex flex-wrap gap-2">
        {selectedCityIds.map((id) => {
          const city = allCities.find((c) => c.id === id)
          if (!city) return null
          return (
            <div key={id} className="flex items-center gap-2 border px-3 py-1 rounded-md bg-muted">
              <span>{city.name}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  dispatch(setSelectedCities(selectedCityIds.filter((cid) => cid !== id)))
                }}
              >
                ×
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  </CardContent>
</Card>


  {/* Weather Data Card */}
  <Card>
    <CardHeader>
      <CardTitle>Weather</CardTitle>
      <CardDescription>Current conditions in selected cities</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {cities.map((city) => (
          <div key={city.id} className="flex items-center space-x-4 rounded-md border p-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium leading-none">{city.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dispatch(toggleFavoriteCity(city.id))}
                  className={city.isFavorite ? "text-yellow-500" : "text-muted-foreground"}
                >
                  <Star className="h-4 w-4" />
                  <span className="sr-only">Favorite</span>
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{city.temperature}°C</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{city.humidity}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Wind className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{city.windSpeed} km/h</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground capitalize">{city.condition}</p>
            </div>
            <Link href={`/weather/${city.id}`}>
              <Button variant="outline" size="sm">
                Details
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
</>

  )
}
