"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface NonConformityChartProps {
  data: {
    type: string
    quantity: number
    percentage: number
  }[]
}

const COLORS = [
  "hsl(160, 60%, 45%)",
  "hsl(45, 70%, 55%)",
  "hsl(25, 80%, 45%)",
  "hsl(250, 40%, 50%)",
  "hsl(85, 50%, 55%)",
]

export function NonConformityChart({ data }: NonConformityChartProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">
          Não-Conformidades por Tipo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(250, 10%, 28%)"
              horizontal={true}
              vertical={false}
            />
            <XAxis type="number" stroke="hsl(0, 0%, 65%)" fontSize={12} />
            <YAxis
              type="category"
              dataKey="type"
              stroke="hsl(0, 0%, 65%)"
              fontSize={12}
              width={90}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(250, 10%, 17%)",
                border: "1px solid hsl(250, 10%, 28%)",
                borderRadius: "8px",
                color: "hsl(0, 0%, 95%)",
              }}
              formatter={(value: number, name: string) => [
                `${value} ocorrências`,
                "Quantidade",
              ]}
            />
            <Bar dataKey="quantity" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
