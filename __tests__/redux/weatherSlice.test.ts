// __tests__/redux/weatherSlice.test.ts
import type { Reducer } from "redux"
import { configureStore, ThunkDispatch } from "@reduxjs/toolkit"
import weatherReducer, {
  fetchWeather,
  toggleFavoriteCity,
  setSelectedCities,
  setFavoriteCityIds,
  WeatherState,
  CityWeather,
} from "@/lib/redux/slices/weatherSlice"
import axios from "axios"
import type { AnyAction } from "redux"

// Mock Axios
jest.mock("axios")
const mockedAxios = axios as jest.Mocked<typeof axios>

// Types for the test store
type RootState = { weather: WeatherState }
type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>

// Utility to create a test store
function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: { weather: weatherReducer },
    preloadedState,
  })
}

describe("weatherSlice", () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
    jest.clearAllMocks()
  })

  test("should return the initial state", () => {
    const state = store.getState().weather
    expect(state.cities).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.selectedCityIds).toEqual(["new-york", "san-francisco", "mumbai"])
    expect(state.favoriteCityIds).toEqual([])
  })

  test("should handle setSelectedCities", () => {
    store.dispatch(setSelectedCities(["tokyo", "paris"]))
    const state = store.getState().weather
    expect(state.selectedCityIds).toEqual(["tokyo", "paris"])
  })

  test("should handle setFavoriteCityIds", () => {
    store.dispatch(setFavoriteCityIds(["berlin"]))
    const state = store.getState().weather
    expect(state.favoriteCityIds).toContain("berlin")
  })

  test("should toggle favorite city correctly", () => {
    const initialCity: CityWeather = {
      id: "mumbai",
      name: "Mumbai",
      temperature: 30,
      humidity: 70,
      windSpeed: 15,
      condition: "clear",
      isFavorite: false,
    }

    // Create a store with a preloaded city
    const localStore = createTestStore({
      weather: {
        cities: [initialCity],
        loading: false,
        error: null,
        selectedCityIds: ["mumbai"],
        favoriteCityIds: [],
      },
    })

    // Toggle on
    localStore.dispatch(toggleFavoriteCity("mumbai"))
    let state = localStore.getState().weather
    expect(state.cities[0].isFavorite).toBe(true)
    expect(state.favoriteCityIds).toContain("mumbai")

    // Toggle off
    localStore.dispatch(toggleFavoriteCity("mumbai"))
    state = localStore.getState().weather
    expect(state.cities[0].isFavorite).toBe(false)
    expect(state.favoriteCityIds).not.toContain("mumbai")
  })

  test("should handle fetchWeather fulfilled", async () => {
    mockedAxios.get.mockImplementation((url, config?: { params?: any }) => {
      if (config?.params?.q && config.params.q.toLowerCase() === "new york".toLowerCase()) {
        return Promise.resolve({
          data: {
            name: "New York",
            main: { temp: 24, humidity: 60 },
            wind: { speed: 10 },
            weather: [{ description: "clear" }],
          },
        });
      }
      return Promise.reject(new Error("City not found"));
    });
    

    await (store.dispatch as AppDispatch)(fetchWeather(["new-york"]))
    const state = store.getState().weather
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.cities.length).toBe(1)
    expect(state.cities[0]).toMatchObject({
      id: "new-york",
      name: "New York",
      temperature: 24,
      humidity: 60,
      windSpeed: 10,
      condition: "clear",
      isFavorite: false,
    })
  })

  test("should handle fetchWeather rejected", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"))
    await (store.dispatch as AppDispatch)(fetchWeather(["unknown-city"]))
    const state = store.getState().weather
    expect(state.loading).toBe(false)
    expect(state.error).toBe("Failed to fetch weather data")
  })

  
})
