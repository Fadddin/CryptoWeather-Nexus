"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { Star, MapPin, Droplets, Wind } from "lucide-react";
import Link from "next/link";
import Combobox from "@/components/combobox/CityCombobox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  fetchWeather,
  toggleFavoriteCity,
  setSelectedCities,
  setFavoriteCityIds,
} from "@/lib/redux/slices/weatherSlice";
import type { RootState } from "@/lib/redux/store";

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
];

export default function WeatherSection() {
  const dispatch = useAppDispatch();
  const { cities, loading, error, selectedCityIds, favoriteCityIds } = useAppSelector(
    (state: RootState) => state.weather
  );

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Load selected and favorite cities from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("selectedCityIds");
    if (saved) {
      dispatch(setSelectedCities(JSON.parse(saved)));
    } else {
      dispatch(setSelectedCities(["new-york", "san-francisco", "mumbai"]));
    }

    const savedFavorites = localStorage.getItem("favoriteCityIds");
    if (savedFavorites) {
      dispatch(setFavoriteCityIds(JSON.parse(savedFavorites)));
    }
  }, [dispatch]);

  // Fetch weather whenever selectedCityIds change
  useEffect(() => {
    const combinedCityIds = Array.from(new Set([...selectedCityIds, ...favoriteCityIds]));
    if (combinedCityIds.length > 0) {
      localStorage.setItem("selectedCityIds", JSON.stringify(selectedCityIds));
      dispatch(fetchWeather(combinedCityIds));
    }
  }, [selectedCityIds, favoriteCityIds, dispatch]);
  

  // Persist favoriteCityIds to localStorage
  useEffect(() => {
    localStorage.setItem("favoriteCityIds", JSON.stringify(favoriteCityIds));
  }, [favoriteCityIds]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weather Tracker</CardTitle>
        <CardDescription>Add cities and view current weather conditions</CardDescription>
      </CardHeader>

      <CardContent>
        {/* City Selector */}
        <div className="max-w-sm mb-4">
          <Combobox
            cities={allCities}
            onSelect={(cityId) => {
              if (!selectedCityIds.includes(cityId)) {
                dispatch(setSelectedCities([...selectedCityIds, cityId]));
              }
            }}
          />
        </div>

        {/* Selected City Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCityIds.map((id) => {
            const city = allCities.find((c) => c.id === id);
            return (
              <div
                key={id}
                className="flex items-center gap-2 border px-3 py-1 rounded-md bg-muted"
              >
                <span>{city?.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    dispatch(setSelectedCities(selectedCityIds.filter((cid) => cid !== id)))
                  }
                >
                  ×
                </Button>
              </div>
            );
          })}
        </div>

        {/* Toggle Button */}
        <div className="flex justify-end mb-4">
          <Button
            variant={showFavoritesOnly ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            {showFavoritesOnly ? "Show All Cities" : "Show Favorites Only"}
          </Button>
        </div>

        {/* Loading & Error States */}
        {loading && <p className="text-muted-foreground">Loading weather data...</p>}
        {error && (
          <div className="bg-destructive/10 p-4 rounded-md mb-4">
            <p className="text-destructive">
              Failed to load weather data. Please try again later.
            </p>
          </div>
        )}

        {/* Weather Cards */}
        {!loading && !error && (
          <div className="space-y-4">
            {cities
              .filter((city) => (showFavoritesOnly ? city.isFavorite : true))
              .map((city) => (
                <div
                  key={city.id}
                  className="flex items-center space-x-4 rounded-md border p-4"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">{city.name}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={
                          city.isFavorite ? "text-yellow-500" : "text-muted-foreground"
                        }
                        onClick={() => dispatch(toggleFavoriteCity(city.id))}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold">{city.temperature}°C</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Droplets className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {city.humidity}%
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Wind className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {city.windSpeed} km/h
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">
                      {city.condition}
                    </p>
                  </div>
                  <Link href={`/weather/${city.id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
