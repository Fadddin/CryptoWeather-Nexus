"use client"

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
console.log(API_KEY)
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

export interface CityWeather {
  id: string
  name: string
  temperature: number
  humidity: number
  windSpeed: number
  condition: string
  isFavorite: boolean
}

const allCityData: Record<string, { name: string }> = {
  "new-york": { name: "New York" },
  "san-francisco": { name: "San Francisco" },
  "mumbai": { name: "Mumbai" },
  "london": { name: "London" },
  "tokyo": { name: "Tokyo" },
}

interface WeatherState {
  cities: CityWeather[]
  loading: boolean
  error: string | null
  selectedCityIds: string[]
}

const defaultCityIds = ["new-york", "san-francisco", "mumbai"]

const initialState: WeatherState = {
  cities: [],
  loading: false,
  error: null,
  selectedCityIds: defaultCityIds,
}

export const fetchWeather = createAsyncThunk(
  "weather/fetchWeather",
  async (cityIds: string[] = [], thunkAPI) => {
    if (!Array.isArray(cityIds) || cityIds.length === 0) {
      throw new Error("No valid city IDs provided")
    }

    const cityNameMap: Record<string, string> = {
      "new-york": "New York",
      "san-francisco": "San Francisco",
      "mumbai": "Mumbai",
      "london": "London",
      "tokyo": "Tokyo",
      "paris": "Paris",
      "sydney": "Sydney",
      "berlin": "Berlin",
      "dubai": "Dubai",
      "moscow": "Moscow",
      "shanghai": "Shanghai",
      "singapore": "Singapore",
    }

    const results = await Promise.allSettled(
      cityIds.map(async (id) => {
        const name = cityNameMap[id]
        if (!name) throw new Error(`Unknown city ID: ${id}`)

        const response = await axios.get(BASE_URL, {
          params: {
            q: name,
            appid: API_KEY,
            units: "metric",
          },
        })

        const data = response.data

        return {
          id,
          name: data.name,
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed),
          condition: data.weather[0]?.description || "Unknown",
          isFavorite: false,
        }
      })
    )

    const successful = results.filter(
      (r): r is PromiseFulfilledResult<CityWeather> => r.status === "fulfilled"
    )

    return successful.map((r) => r.value)
  }
)


const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    toggleFavoriteCity: (state, action: PayloadAction<string>) => {
      const city = state.cities.find((c) => c.id === action.payload)
      if (city) {
        city.isFavorite = !city.isFavorite
      }
    },
    setSelectedCities: (state, action: PayloadAction<string[]>) => {
      state.selectedCityIds = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        const updatedCities = action.payload.map((newCity) => {
          const existingCity = state.cities.find((c) => c.id === newCity.id)
          return {
            ...newCity,
            isFavorite: existingCity ? existingCity.isFavorite : newCity.isFavorite,
          }
        })
        state.cities = updatedCities
        state.loading = false
        state.error = null // ✅ clear error here
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch weather data"
      })
  },
})

export const { toggleFavoriteCity, setSelectedCities } = weatherSlice.actions
export default weatherSlice.reducer
