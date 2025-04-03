"use client"

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"

interface Crypto {
  id: string
  name: string
  symbol: string
  price: number
  priceChange24h: number
  marketCap: number
  isFavorite: boolean
}

interface CryptoState {
  cryptos: Crypto[]
  loading: boolean
  error: string | null
  selectedCryptoIds: string[]
}

const defaultIds = ["bitcoin", "ethereum", "solana"]

const initialState: CryptoState = {
  cryptos: [],
  loading: false,
  error: null,
  selectedCryptoIds: defaultIds,
}

export const fetchCryptos = createAsyncThunk(
  "crypto/fetchCryptos",
  async (ids: string[]) => {
    const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "usd",
        ids: ids.join(","),
      },
    })

    return response.data.map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price: coin.current_price,
      priceChange24h: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
      isFavorite: false,
    }))
  }
)

const cryptoSlice = createSlice({
  name: "crypto",
  initialState,
  reducers: {
    toggleFavoriteCrypto: (state, action: PayloadAction<string>) => {
      const crypto = state.cryptos.find((c) => c.id === action.payload)
      if (crypto) crypto.isFavorite = !crypto.isFavorite
    },
    setSelectedCryptos: (state, action: PayloadAction<string[]>) => {
      state.selectedCryptoIds = action.payload
    },
    updateCryptoPrice: (
      state,
      action: PayloadAction<{ id: string; price: number }>
    ) => {
      const crypto = state.cryptos.find((c) => c.id === action.payload.id)
      if (crypto) {
        crypto.price = action.payload.price
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCryptos.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCryptos.fulfilled, (state, action) => {
        state.cryptos = action.payload.map((newCrypto: Crypto) => {
          const existing = state.cryptos.find((c) => c.id === newCrypto.id)
          return {
            ...newCrypto,
            isFavorite: existing?.isFavorite ?? false,
          }
        })
        state.loading = false
        state.error = null
      })
      .addCase(fetchCryptos.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch cryptocurrency data"
        state.error = null
      })
  },
})

export const {
  toggleFavoriteCrypto,
  setSelectedCryptos,
  updateCryptoPrice, // ✅ exported
} = cryptoSlice.actions

export default cryptoSlice.reducer
