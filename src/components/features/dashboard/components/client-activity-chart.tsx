"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ActivityData {
  name: string
  value: number
}

interface ClientActivityChartProps {
  data: ActivityData[]
}

export function ClientActivityChart({ data }: ClientActivityChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Работа с клиентами</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {" "}
          {/* Increased height to accommodate labels */}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 60, // Increased bottom margin for rotated labels
              }}
            >
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                angle={-45} // Rotate labels
                textAnchor="end" // Align end of text with tick
                interval={0} // Show all labels
                height={60} // Increased height for rotated labels
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip />
              <Bar dataKey="value" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

