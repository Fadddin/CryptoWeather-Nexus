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

export interface WeatherState {
  cities: CityWeather[]
  loading: boolean
  error: string | null
  selectedCityIds: string[]
  favoriteCityIds: string[]
}

const defaultCityIds = ["new-york", "san-francisco", "mumbai"]

const initialState: WeatherState = {
  cities: [],
  loading: false,
  error: null,
  selectedCityIds: defaultCityIds,
  favoriteCityIds: [],
}

export const fetchWeather = createAsyncThunk<CityWeather[], string[]>(
  "weather/fetchWeather",
  async (cityIds, thunkAPI) => {
    // Get favorite city IDs from the current state.
    const state = thunkAPI.getState() as { weather: WeatherState };
    const combinedCityIds = Array.from(new Set([
      ...cityIds,
      ...state.weather.favoriteCityIds,
    ]));

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
    };

    const results = await Promise.allSettled(
      combinedCityIds.map(async (id) => {
        const name = cityNameMap[id];
        if (!name) throw new Error(`Unknown city ID: ${id}`);

        const response = await axios.get(BASE_URL, {
          params: {
            q: name,
            appid: API_KEY,
            units: "metric",
          },
        });

        const data = response.data;

        return {
          id,
          name: data.name,
          // Use Math.floor here if Option A is chosen for temperature rounding
          temperature: Math.floor(data.main.temp),
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed),
          condition: data.weather[0]?.description || "Unknown",
          isFavorite: false,
        }
      })
    );

    const fulfilled = results.filter(
      (r): r is PromiseFulfilledResult<CityWeather> => r.status === "fulfilled"
    );

    if (fulfilled.length === 0) {
      return thunkAPI.rejectWithValue("Failed to fetch weather data");
    }

    return fulfilled.map((r) => r.value);
  }
);

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    toggleFavoriteCity: (state, action: PayloadAction<string>) => {
      const cityId = action.payload
      const city = state.cities.find((c) => c.id === cityId)
      if (city) city.isFavorite = !city.isFavorite

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
          isFavorite: state.favoriteCityIds.includes(city.id),
        }))
        state.loading = false
        state.error = null
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || "Failed to fetch weather data"
      })
  },
})

export const {
  toggleFavoriteCity,
  setSelectedCities,
  setFavoriteCityIds,
} = weatherSlice.actions

export default weatherSlice.reducer
