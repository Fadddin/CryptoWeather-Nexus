import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface WeatherTableProps {
  data: Array<{
    date: string
    temperature: number
    humidity: number
  }>
}

export default function WeatherTable({ data }: WeatherTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Temperature (°C)</TableHead>
            <TableHead>Humidity (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.date}>
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.temperature}</TableCell>
              <TableCell>{item.humidity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

