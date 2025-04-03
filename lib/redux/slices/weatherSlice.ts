"use client"

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY
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

interface WeatherState {
  cities: CityWeather[]
  loading: boolean
  error: string | null
  selectedCityIds: string[]
  favoriteCityIds: string[] // ✅ NEW
}

const defaultCityIds = ["new-york", "san-francisco", "mumbai"]

const initialState: WeatherState = {
  cities: [],
  loading: false,
  error: null,
  selectedCityIds: defaultCityIds,
  favoriteCityIds: [], // ✅ INIT
}

export const fetchWeather = createAsyncThunk(
  "weather/fetchWeather",
  async (cityIds: string[] = [], thunkAPI) => {
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
      const cityId = action.payload
      const city = state.cities.find((c) => c.id === cityId)
      if (city) {
        city.isFavorite = !city.isFavorite
      }

      if (state.favoriteCityIds.includes(cityId)) {
        state.favoriteCityIds = state.favoriteCityIds.filter((id) => id !== cityId)
      } else {
        state.favoriteCityIds.push(cityId)
      }
    },
    setSelectedCities: (state, action: PayloadAction<string[]>) => {
      state.selectedCityIds = action.payload
    },
    setFavoriteCityIds: (state, action: PayloadAction<string[]>) => {
      state.favoriteCityIds = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.cities = action.payload.map((city) => ({
          ...city,
          isFavorite: state.favoriteCityIds.includes(city.id), // ✅ Mark favorites
        }))
        state.loading = false
        state.error = null
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch weather data"
      })
  },
})

export const {
  toggleFavoriteCity,
  setSelectedCities,
  setFavoriteCityIds, // ✅ Export new action
} = weatherSlice.actions

export default weatherSlice.reducer
