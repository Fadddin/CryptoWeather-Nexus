"use client"

import { useSelector } from "react-redux"
import { ExternalLink, Clock } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { RootState } from "@/lib/redux/store"

import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { fetchNews } from "@/lib/redux/slices/newsSlice"



export default function NewsSection() {
  // const { news, loading, error } = useSelector((state: RootState) => state.news)
  const dispatch = useAppDispatch()
const { news, loading, error } = useAppSelector((state: RootState) => state.news)

useEffect(() => {
  dispatch(fetchNews())

}, [dispatch])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crypto News</CardTitle>
          <CardDescription>Latest headlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crypto News</CardTitle>
          <CardDescription>Latest headlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 p-4 rounded-md">
            <p className="text-destructive">Failed to load news data. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crypto News</CardTitle>
        <CardDescription>Latest headlines</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news
          .slice(0, 5)
          .map((item) => (
            <div key={item.id} className="space-y-2">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline flex items-start"
              >
                {item.title}
                <ExternalLink className="h-3 w-3 ml-1 inline flex-shrink-0" />
              </a>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

