"use client"

import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { fetchNews } from "@/lib/redux/slices/newsSlice"
import { ExternalLink, Clock } from "lucide-react"
import type { RootState } from "@/lib/redux/store"

export default function NewsSection() {
  const dispatch = useAppDispatch()
  const { news, loading, error } = useAppSelector((state: RootState) => state.news)

  useEffect(() => {
    dispatch(fetchNews())
  }, [dispatch])

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Crypto News</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Latest headlines</p>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-md">
          <p className="text-red-700 dark:text-red-200 text-sm">
            Failed to load news data. Please try again later.
          </p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {news.slice(0, 5).map((item) => (
            <div key={item.id} className="space-y-1">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-start"
              >
                {item.title}
                <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
              </a>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3 mr-1" />
                <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
