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
import { Star, TrendingUp, TrendingDown, Info, Trash2 } from "lucide-react"
import Link from "next/link"

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
  const [sortBy, setSortBy] = useState<"price" | "marketCap">("marketCap")

  useEffect(() => {
    const saved = localStorage.getItem("selectedCryptoIds")
    if (saved) dispatch(setSelectedCryptos(JSON.parse(saved)))

    const savedFav = localStorage.getItem("favoriteCryptoIds")
    if (savedFav) dispatch(setFavoriteCryptoIds(JSON.parse(savedFav)))
  }, [dispatch])

  useEffect(() => {
    localStorage.setItem("favoriteCryptoIds", JSON.stringify(favoriteCryptoIds))
  }, [favoriteCryptoIds])

  useEffect(() => {
    const merged = Array.from(new Set([...selectedCryptoIds, ...favoriteCryptoIds]))
    if (merged.length > 0) {
      localStorage.setItem("selectedCryptoIds", JSON.stringify(selectedCryptoIds))
      dispatch(fetchCryptos(merged))
    }
  }, [dispatch, selectedCryptoIds, favoriteCryptoIds])

  useEffect(() => {
    const merged = Array.from(new Set([...selectedCryptoIds, ...favoriteCryptoIds]))
    if (merged.length === 0) return

    const { disconnect } = connectCryptoWebSocket(merged, (id, price) => {
      dispatch(updateCryptoPrice({ id, price }))
    })

    return () => disconnect()
  }, [dispatch, selectedCryptoIds, favoriteCryptoIds])

  const sortedCryptos = [...cryptos]
    .filter((c) => (showFavoritesOnly ? c.isFavorite : true))
    .sort((a, b) =>
      sortBy === "price"
        ? b.price - a.price
        : b.marketCap - a.marketCap
    )

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Cryptocurrency Tracker
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select and monitor your favorite coins in real time
        </p>
      </div>

      {/* ComboBox */}
      <div className="max-w-sm mb-4">
        <CryptoCombobox
          onSelect={(id) => {
            if (!selectedCryptoIds.includes(id)) {
              dispatch(setSelectedCryptos([...selectedCryptoIds, id]))
            }
          }}
        />
      </div>

      {/* Selected Tags + Clear */}
      {selectedCryptoIds.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center mb-4">
          {selectedCryptoIds.map((id) => {
            const name = id.charAt(0).toUpperCase() + id.slice(1)
            return (
              <div
                key={id}
                className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-sm"
              >
                <span className="text-gray-800 dark:text-gray-200">{name}</span>
                <button
                  className="text-gray-400 hover:text-red-500"
                  onClick={() =>
                    dispatch(setSelectedCryptos(selectedCryptoIds.filter((c) => c !== id)))
                  }
                  aria-label={`Remove ${name}`}
                >
                  ×
                </button>
              </div>
            )
          })}
          <button
            onClick={() => dispatch(setSelectedCryptos([]))}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-red-500 flex items-center"
            aria-label="Clear all"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </button>
        </div>
      )}

      {/* Toggle & Sort Controls */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="inline-flex border rounded-md overflow-hidden">
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

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "price" | "marketCap")}
          className="border text-sm rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
        >
          <option value="marketCap">Sort by Market Cap</option>
          <option value="price">Sort by Price</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-md mt-4">
          <p className="text-red-700 dark:text-red-200 text-sm">
            Failed to load cryptocurrency data. Please try again later.
          </p>
        </div>
      )}

      {/* Crypto Cards */}
      {!loading && !error && (
        <div className="space-y-4 mt-4">
          {sortedCryptos.map((crypto) => (
            <div
              key={crypto.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-200 dark:border-gray-700 p-4 rounded-md"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {crypto.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {crypto.symbol}
                    </p>
                    <div title="Live price data">
                      <Info className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <button
                    className={`text-sm ${crypto.isFavorite ? "text-yellow-500" : "text-gray-400"
                      }`}
                    onClick={() => dispatch(toggleFavoriteCrypto(crypto.id))}
                    aria-label={`Toggle favorite for ${crypto.name}`}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ${crypto.price.toLocaleString()}
                  </p>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Market Cap: ${crypto.marketCap.toLocaleString()}
                </p>
              </div>
              <Link href={`/crypto/${crypto.id}`}>
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
