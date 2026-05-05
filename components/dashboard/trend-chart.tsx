"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface TrendChartProps {
  data: {
    month: string
    total: number
    resolved: number
    pending: number
  }[]
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">
          Evolução Mensal de OPs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(250, 10%, 28%)"
            />
            <XAxis
              dataKey="month"
              stroke="hsl(0, 0%, 65%)"
              fontSize={12}
            />
            <YAxis stroke="hsl(0, 0%, 65%)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(250, 10%, 17%)",
                border: "1px solid hsl(250, 10%, 28%)",
                borderRadius: "8px",
                color: "hsl(0, 0%, 95%)",
              }}
            />
            <Legend
              wrapperStyle={{ color: "hsl(0, 0%, 95%)" }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total"
              stroke="hsl(160, 60%, 45%)"
              strokeWidth={2}
              dot={{ fill: "hsl(160, 60%, 45%)", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="resolved"
              name="Resolvidas"
              stroke="hsl(250, 40%, 50%)"
              strokeWidth={2}
              dot={{ fill: "hsl(250, 40%, 50%)", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="pending"
              name="Pendentes"
              stroke="hsl(45, 70%, 55%)"
              strokeWidth={2}
              dot={{ fill: "hsl(45, 70%, 55%)", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
