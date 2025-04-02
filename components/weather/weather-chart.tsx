"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface WeatherChartProps {
  data: Array<{
    date: string
    temperature: number
    humidity: number
  }>
}

export default function WeatherChart({ data }: WeatherChartProps) {
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
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#f97316" name="Temperature (°C)" />
          <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#0ea5e9" name="Humidity (%)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

