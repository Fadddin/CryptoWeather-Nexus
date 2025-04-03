"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import {
  toggleFavoriteCrypto,
  setSelectedCryptos,
  fetchCryptos,
  updateCryptoPrice,
  setFavoriteCryptoIds,
} from "@/lib/redux/slices/cryptoSlice"
import { connectCryptoWebSocket } from "@/lib/websocket"

import CryptoCombobox from "@/components/combobox/CryptoCombobox"
import { Star, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CryptoSection() {
  const dispatch = useAppDispatch()
  const {
    cryptos,
    loading,
    error,
    selectedCryptoIds,
    favoriteCryptoIds,
  } = useAppSelector((state) => state.crypto)

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("selectedCryptoIds")
    if (saved) dispatch(setSelectedCryptos(JSON.parse(saved)))

    const savedFav = localStorage.getItem("favoriteCryptoIds")
    if (savedFav) dispatch(setFavoriteCryptoIds(JSON.parse(savedFav)))
  }, [dispatch])

  // Save favorites
  useEffect(() => {
    localStorage.setItem("favoriteCryptoIds", JSON.stringify(favoriteCryptoIds))
  }, [favoriteCryptoIds])

  // Fetch data for selected + favorite cryptos
  useEffect(() => {
    const merged = Array.from(new Set([...selectedCryptoIds, ...favoriteCryptoIds]))
    if (merged.length > 0) {
      localStorage.setItem("selectedCryptoIds", JSON.stringify(selectedCryptoIds))
      dispatch(fetchCryptos(merged))
    }
  }, [dispatch, selectedCryptoIds, favoriteCryptoIds])

  // WebSocket
  useEffect(() => {
    const merged = Array.from(new Set([...selectedCryptoIds, ...favoriteCryptoIds]))
    if (merged.length === 0) return

    const { disconnect } = connectCryptoWebSocket(merged, (id, price) => {
      dispatch(updateCryptoPrice({ id, price }))
    })

    return () => {
      disconnect()
    }
  }, [dispatch, selectedCryptoIds, favoriteCryptoIds])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cryptocurrency Tracker</CardTitle>
        <CardDescription>
          Select and monitor your favorite coins in real time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* ComboBox */}
          <CryptoCombobox
            onSelect={(id) => {
              if (!selectedCryptoIds.includes(id)) {
                dispatch(setSelectedCryptos([...selectedCryptoIds, id]))
              }
            }}
          />

          {/* Selected Tags */}
          <div className="flex flex-wrap gap-2">
            {selectedCryptoIds.map((id) => {
              const name = id.charAt(0).toUpperCase() + id.slice(1)
              return (
                <div
                  key={id}
                  className="flex items-center gap-2 border px-3 py-1 rounded-md bg-muted"
                >
                  <span>{name}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      dispatch(setSelectedCryptos(selectedCryptoIds.filter((c) => c !== id)))
                    }
                  >
                    ×
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Toggle */}
          <div className="flex justify-end">
            <Button
              variant={showFavoritesOnly ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              {showFavoritesOnly ? "Show All" : "Show Favorites Only"}
            </Button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
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
        )}

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 p-4 rounded-md">
            <p className="text-destructive">
              Failed to load cryptocurrency data. Please try again later.
            </p>
          </div>
        )}

        {/* Crypto List */}
        {/* Crypto List */}
{!loading && !error && (
  <div className="space-y-4">
    {cryptos
      .filter((c) => (showFavoritesOnly ? c.isFavorite : true))
      .map((crypto) => (
        <div
          key={crypto.id}
          className="flex items-center space-x-4 rounded-md border p-4"
        >
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium leading-none">{crypto.name}</p>
                <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(toggleFavoriteCrypto(crypto.id))}
                className={
                  crypto.isFavorite ? "text-yellow-500" : "text-muted-foreground"
                }
              >
                <Star className="h-4 w-4" />
                <span className="sr-only">Favorite</span>
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold">${crypto.price.toLocaleString()}</p>
              <div className="flex items-center space-x-1">
                {crypto.priceChange24h >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">
                      +{crypto.priceChange24h.toFixed(2)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-500">
                      {crypto.priceChange24h.toFixed(2)}%
                    </span>
                  </>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Market Cap: ${crypto.marketCap.toLocaleString()}
            </p>
          </div>
          <Link href={`/crypto/${crypto.id}`}>
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
  )
}
