"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import {
  fetchWeather,
  toggleFavoriteCity,
  setSelectedCities,
  setFavoriteCityIds,
} from "@/lib/redux/slices/weatherSlice"
import type { RootState } from "@/lib/redux/store"
import {
  Star,
  MapPin,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  Cloud,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import Combobox from "@/components/combobox/CityCombobox"
import { Tooltip } from "react-tooltip"

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

export default function WeatherSection() {
  const dispatch = useAppDispatch()
  const { cities, loading, error, selectedCityIds, favoriteCityIds } = useAppSelector(
    (state: RootState) => state.weather
  )
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("selectedCityIds")
    if (saved) {
      dispatch(setSelectedCities(JSON.parse(saved)))
    } else {
      dispatch(setSelectedCities(["new-york", "san-francisco", "mumbai"]))
    }

    const savedFavorites = localStorage.getItem("favoriteCityIds")
    if (savedFavorites) {
      dispatch(setFavoriteCityIds(JSON.parse(savedFavorites)))
    }
  }, [dispatch])

  useEffect(() => {
    const combined = Array.from(new Set([...selectedCityIds, ...favoriteCityIds]))
    if (combined.length > 0) {
      localStorage.setItem("selectedCityIds", JSON.stringify(selectedCityIds))
      dispatch(fetchWeather(combined))
    }
  }, [selectedCityIds, favoriteCityIds, dispatch])

  useEffect(() => {
    localStorage.setItem("favoriteCityIds", JSON.stringify(favoriteCityIds))
  }, [favoriteCityIds])

  const getConditionIcon = (condition: string) => {
    const lc = condition.toLowerCase()
    if (lc.includes("rain")) return <CloudRain className="h-4 w-4 text-blue-400" />
    if (lc.includes("cloud")) return <Cloud className="h-4 w-4 text-gray-400" />
    if (lc.includes("sun") || lc.includes("clear")) return <Sun className="h-4 w-4 text-yellow-400" />
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weather Tracker</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Add cities and view current weather conditions
        </p>
      </div>

      {/* Combobox */}
      <div className="max-w-sm mb-4">
        <Combobox
          cities={allCities}
          onSelect={(cityId) => {
            if (!selectedCityIds.includes(cityId)) {
              dispatch(setSelectedCities([...selectedCityIds, cityId]))
            }
          }}
        />
      </div>

      {/* Selected Tags & Clear All */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {selectedCityIds.map((id) => {
          const city = allCities.find((c) => c.id === id)
          return (
            <div
              key={id}
              className="flex items-center gap-2 border px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800"
            >
              <span className="text-sm text-gray-800 dark:text-gray-200">{city?.name}</span>
              <button
                className="text-sm text-gray-500 hover:text-red-500"
                onClick={() =>
                  dispatch(setSelectedCities(selectedCityIds.filter((cid) => cid !== id)))
                }
              >
                ×
              </button>
            </div>
          )
        })}
        {selectedCityIds.length > 0 && (
          <button
            onClick={() => dispatch(setSelectedCities([]))}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-red-500 flex items-center"
            aria-label="Clear all"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      {/*  Toggle */}
      <div className="inline-flex border rounded-md overflow-hidden mb-4">
          <button
            className={`px-3 py-1 text-sm ${!showFavoritesOnly
                ? "bg-gray-800 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            onClick={() => setShowFavoritesOnly(false)}
          >
            Show All
          </button>
          <button
            className={`px-3 py-1 text-sm ${showFavoritesOnly
                ? "bg-gray-800 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            onClick={() => setShowFavoritesOnly(true)}
          >
            Favorites Only
          </button>
        </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse h-20 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-md mb-4">
          <p className="text-red-700 dark:text-red-200 text-sm">
            Failed to load weather data. Please try again later.
          </p>
        </div>
      )}

      {/* Data */}
      {!loading && !error && (
        <div className="space-y-4">
          {cities
            .filter((city) => (showFavoritesOnly ? city.isFavorite : true))
            .map((city) => (
              <div
                key={city.id}
                className="flex items-center space-x-4 rounded-md border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{city.name}</p>
                      {getConditionIcon(city.condition)}
                    </div>
                    <button
                      data-tooltip-id={`fav-${city.id}`}
                      onClick={() => dispatch(toggleFavoriteCity(city.id))}
                      className={`text-sm ${city.isFavorite ? "text-yellow-500" : "text-gray-400"
                        }`}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                    <Tooltip id={`fav-${city.id}`} content="Toggle Favorite" place="left" />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {city.temperature}°C
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Droplets className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {city.humidity}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Wind className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {city.windSpeed} km/h
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {city.condition}
                  </p>
                </div>
                <Link href={`/weather/${city.id}`}>
                  <button className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-700 focus:border-blue-600">
                    Details
                  </button>
                </Link>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
