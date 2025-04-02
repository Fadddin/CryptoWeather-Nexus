import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

const API_KEY = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY
const BASE_URL = "https://newsdata.io/api/1/news"

export const fetchNews = createAsyncThunk("news/fetchCryptoNews", async () => {
  const response = await axios.get(BASE_URL, {
    params: {
      apikey: API_KEY,
      category: "business",
      q: "crypto OR cryptocurrency OR bitcoin OR ethereum",
      language: "en",
    },
  })

  // Adapt the format to what your UI expects
  return response.data.results.map((article: any, index: number) => ({
    id: article.link || `news-${index}`,
    title: article.title,
    url: article.link,
    publishedAt: article.pubDate,
  }))
})

interface NewsState {
  news: Array<{
    id: string
    title: string
    url: string
    publishedAt: string
  }>
  loading: boolean
  error: string | null
}

const initialState: NewsState = {
  news: [],
  loading: false,
  error: null,
}

const newsSlice = createSlice({
  name: "news",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.news = action.payload
        state.loading = false
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch news"
      })
  },
})

export default newsSlice.reducer
