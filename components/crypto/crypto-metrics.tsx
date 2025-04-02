interface CryptoMetricsProps {
  metrics: {
    volume24h: number
    allTimeHigh: number
    allTimeHighDate: string
    circulatingSupply: number
    maxSupply: number | null
    rank: number
  }
}

export default function CryptoMetrics({ metrics }: CryptoMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">24h Volume:</span>
          <span className="font-medium">${metrics.volume24h.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">All Time High:</span>
          <span className="font-medium">${metrics.allTimeHigh.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">ATH Date:</span>
          <span className="font-medium">{metrics.allTimeHighDate}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Circulating Supply:</span>
          <span className="font-medium">{metrics.circulatingSupply.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Max Supply:</span>
          <span className="font-medium">{metrics.maxSupply ? metrics.maxSupply.toLocaleString() : "Unlimited"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Market Cap Rank:</span>
          <span className="font-medium">#{metrics.rank}</span>
        </div>
      </div>
    </div>
  )
}

