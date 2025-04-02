"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface CryptoChartProps {
  data: Array<{
    date: string
    price: number
  }>
}

export default function CryptoChart({ data }: CryptoChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]} />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#8884d8" name="Price (USD)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

