import { configureStore } from "@reduxjs/toolkit"
import newsReducer, { fetchNews } from "@/lib/redux/slices/newsSlice"

describe("News Slice", () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        news: newsReducer,
      },
    })

    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  it("should handle initial state", () => {
    const state = store.getState().news
    expect(state.news).toEqual([])
    expect(state.loading).toBe(false)
    expect(state.error).toBe(null)
  })

  it("should handle fetchNews.pending action", () => {
    store.dispatch(fetchNews.pending("", undefined))
    const state = store.getState().news

    expect(state.loading).toBe(true)
    expect(state.error).toBe(null)
  })

  it("should handle fetchNews.fulfilled action", () => {
    const mockNews = [
      {
        id: "1",
        title: "Bitcoin Surges Past $65,000 as Institutional Adoption Grows",
        url: "https://example.com/news/1",
        publishedAt: "2023-04-07T10:30:00Z",
      },
    ]

    store.dispatch(fetchNews.fulfilled(mockNews, "", undefined))
    const state = store.getState().news

    expect(state.loading).toBe(false)
    expect(state.news).toEqual(mockNews)
    expect(state.error).toBe(null)
  })

  it("should handle fetchNews.rejected action", () => {
    const errorMessage = "Failed to fetch news data"
    store.dispatch(fetchNews.rejected(new Error(errorMessage), "", undefined))

    const state = store.getState().news

    expect(state.loading).toBe(false)
    expect(state.error).toBe(errorMessage)
  })
})

