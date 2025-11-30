"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = "An interactive area chart"


const chartData = [
  // APRIL
  { date: "2024-04-01", HeartRate: 72, ActivityLevel: 55, StressLevel: 30 },
  { date: "2024-04-02", HeartRate: 85, ActivityLevel: 40, StressLevel: 60 },
  { date: "2024-04-03", HeartRate: 60, ActivityLevel: 70, StressLevel: 45 },
  { date: "2024-04-04", HeartRate: 90, ActivityLevel: 80, StressLevel: 70 },
  { date: "2024-04-05", HeartRate: 50, ActivityLevel: 35, StressLevel: 25 },
  { date: "2024-04-06", HeartRate: 65, ActivityLevel: 60, StressLevel: 50 },
  { date: "2024-04-07", HeartRate: 78, ActivityLevel: 45, StressLevel: 35 },
  { date: "2024-04-08", HeartRate: 95, ActivityLevel: 85, StressLevel: 75 },
  { date: "2024-04-09", HeartRate: 40, ActivityLevel: 25, StressLevel: 20 },
  { date: "2024-04-10", HeartRate: 88, ActivityLevel: 60, StressLevel: 55 },
  { date: "2024-04-11", HeartRate: 70, ActivityLevel: 50, StressLevel: 40 },
  { date: "2024-04-12", HeartRate: 55, ActivityLevel: 35, StressLevel: 30 },
  { date: "2024-04-13", HeartRate: 80, ActivityLevel: 75, StressLevel: 65 },
  { date: "2024-04-14", HeartRate: 45, ActivityLevel: 40, StressLevel: 20 },
  { date: "2024-04-15", HeartRate: 60, ActivityLevel: 50, StressLevel: 35 },
  { date: "2024-04-16", HeartRate: 85, ActivityLevel: 65, StressLevel: 55 },
  { date: "2024-04-17", HeartRate: 95, ActivityLevel: 90, StressLevel: 80 },
  { date: "2024-04-18", HeartRate: 75, ActivityLevel: 70, StressLevel: 60 },
  { date: "2024-04-19", HeartRate: 50, ActivityLevel: 30, StressLevel: 25 },
  { date: "2024-04-20", HeartRate: 65, ActivityLevel: 55, StressLevel: 45 },
  { date: "2024-04-21", HeartRate: 80, ActivityLevel: 60, StressLevel: 50 },
  { date: "2024-04-22", HeartRate: 55, ActivityLevel: 40, StressLevel: 30 },
  { date: "2024-04-23", HeartRate: 70, ActivityLevel: 75, StressLevel: 65 },
  { date: "2024-04-24", HeartRate: 90, ActivityLevel: 85, StressLevel: 75 },
  { date: "2024-04-25", HeartRate: 45, ActivityLevel: 35, StressLevel: 25 },
  { date: "2024-04-26", HeartRate: 60, ActivityLevel: 50, StressLevel: 40 },
  { date: "2024-04-27", HeartRate: 75, ActivityLevel: 65, StressLevel: 55 },
  { date: "2024-04-28", HeartRate: 85, ActivityLevel: 70, StressLevel: 60 },
  { date: "2024-04-29", HeartRate: 55, ActivityLevel: 45, StressLevel: 35 },
  { date: "2024-04-30", HeartRate: 95, ActivityLevel: 80, StressLevel: 75 },

  // MAY
  { date: "2024-05-01", HeartRate: 68, ActivityLevel: 50, StressLevel: 40 },
  { date: "2024-05-02", HeartRate: 82, ActivityLevel: 60, StressLevel: 55 },
  { date: "2024-05-03", HeartRate: 90, ActivityLevel: 75, StressLevel: 70 },
  { date: "2024-05-04", HeartRate: 55, ActivityLevel: 45, StressLevel: 35 },
  { date: "2024-05-05", HeartRate: 75, ActivityLevel: 65, StressLevel: 60 },
  { date: "2024-05-06", HeartRate: 100, ActivityLevel: 85, StressLevel: 80 },
  { date: "2024-05-07", HeartRate: 60, ActivityLevel: 40, StressLevel: 30 },
  { date: "2024-05-08", HeartRate: 85, ActivityLevel: 70, StressLevel: 65 },
  { date: "2024-05-09", HeartRate: 50, ActivityLevel: 35, StressLevel: 25 },
  { date: "2024-05-10", HeartRate: 95, ActivityLevel: 80, StressLevel: 75 },
  { date: "2024-05-11", HeartRate: 70, ActivityLevel: 55, StressLevel: 50 },
  { date: "2024-05-12", HeartRate: 60, ActivityLevel: 45, StressLevel: 40 },
  { date: "2024-05-13", HeartRate: 80, ActivityLevel: 70, StressLevel: 60 },
  { date: "2024-05-14", HeartRate: 55, ActivityLevel: 50, StressLevel: 35 },
  { date: "2024-05-15", HeartRate: 90, ActivityLevel: 85, StressLevel: 75 },
  { date: "2024-05-16", HeartRate: 65, ActivityLevel: 60, StressLevel: 50 },
  { date: "2024-05-17", HeartRate: 85, ActivityLevel: 70, StressLevel: 60 },
  { date: "2024-05-18", HeartRate: 95, ActivityLevel: 90, StressLevel: 80 },
  { date: "2024-05-19", HeartRate: 75, ActivityLevel: 60, StressLevel: 55 },
  { date: "2024-05-20", HeartRate: 50, ActivityLevel: 35, StressLevel: 25 },
  { date: "2024-05-21", HeartRate: 65, ActivityLevel: 50, StressLevel: 40 },
  { date: "2024-05-22", HeartRate: 85, ActivityLevel: 70, StressLevel: 60 },
  { date: "2024-05-23", HeartRate: 55, ActivityLevel: 40, StressLevel: 30 },
  { date: "2024-05-24", HeartRate: 70, ActivityLevel: 60, StressLevel: 50 },
  { date: "2024-05-25", HeartRate: 95, ActivityLevel: 85, StressLevel: 75 },
  { date: "2024-05-26", HeartRate: 60, ActivityLevel: 45, StressLevel: 35 },
  { date: "2024-05-27", HeartRate: 80, ActivityLevel: 65, StressLevel: 55 },
  { date: "2024-05-28", HeartRate: 90, ActivityLevel: 75, StressLevel: 70 },
  { date: "2024-05-29", HeartRate: 55, ActivityLevel: 35, StressLevel: 25 },
  { date: "2024-05-30", HeartRate: 100, ActivityLevel: 85, StressLevel: 80 },
  { date: "2024-05-31", HeartRate: 70, ActivityLevel: 50, StressLevel: 45 },

  // JUNE
  { date: "2024-06-01", HeartRate: 65, ActivityLevel: 55, StressLevel: 40 },
  { date: "2024-06-02", HeartRate: 80, ActivityLevel: 70, StressLevel: 60 },
  { date: "2024-06-03", HeartRate: 90, ActivityLevel: 85, StressLevel: 75 },
  { date: "2024-06-04", HeartRate: 50, ActivityLevel: 40, StressLevel: 30 },
  { date: "2024-06-05", HeartRate: 75, ActivityLevel: 65, StressLevel: 55 },
  { date: "2024-06-06", HeartRate: 95, ActivityLevel: 80, StressLevel: 70 },
  { date: "2024-06-07", HeartRate: 60, ActivityLevel: 45, StressLevel: 35 },
  { date: "2024-06-08", HeartRate: 85, ActivityLevel: 70, StressLevel: 60 },
  { date: "2024-06-09", HeartRate: 40, ActivityLevel: 30, StressLevel: 20 },
  { date: "2024-06-10", HeartRate: 100, ActivityLevel: 90, StressLevel: 80 },
  { date: "2024-06-11", HeartRate: 70, ActivityLevel: 50, StressLevel: 45 },
  { date: "2024-06-12", HeartRate: 55, ActivityLevel: 35, StressLevel: 30 },
  { date: "2024-06-13", HeartRate: 85, ActivityLevel: 70, StressLevel: 60 },
  { date: "2024-06-14", HeartRate: 60, ActivityLevel: 45, StressLevel: 35 },
  { date: "2024-06-15", HeartRate: 90, ActivityLevel: 80, StressLevel: 70 },
  { date: "2024-06-16", HeartRate: 65, ActivityLevel: 50, StressLevel: 40 },
  { date: "2024-06-17", HeartRate: 80, ActivityLevel: 65, StressLevel: 55 },
  { date: "2024-06-18", HeartRate: 95, ActivityLevel: 85, StressLevel: 75 },
  { date: "2024-06-19", HeartRate: 55, ActivityLevel: 35, StressLevel: 25 },
  { date: "2024-06-20", HeartRate: 100, ActivityLevel: 90, StressLevel: 80 },
  { date: "2024-06-21", HeartRate: 70, ActivityLevel: 55, StressLevel: 45 },
  { date: "2024-06-22", HeartRate: 85, ActivityLevel: 65, StressLevel: 55 },
  { date: "2024-06-23", HeartRate: 60, ActivityLevel: 45, StressLevel: 35 },
  { date: "2024-06-24", HeartRate: 90, ActivityLevel: 80, StressLevel: 70 },
  { date: "2024-06-25", HeartRate: 55, ActivityLevel: 35, StressLevel: 25 },
  { date: "2024-06-26", HeartRate: 95, ActivityLevel: 85, StressLevel: 75 },
  { date: "2024-06-27", HeartRate: 65, ActivityLevel: 50, StressLevel: 40 },
  { date: "2024-06-28", HeartRate: 80, ActivityLevel: 70, StressLevel: 60 },
  { date: "2024-06-29", HeartRate: 100, ActivityLevel: 90, StressLevel: 80 },
  { date: "2024-06-30", HeartRate: 75, ActivityLevel: 60, StressLevel: 50 },
];


const chartConfig = {
  HeartRate: {
    label: "HeartRate",
    color: "var(--chart-1)",
  },
  ActivityLevel: {
    label: "ActivityLevel",
    color: "var(--chart-2)",
  },
    StressLevel: {
    label: "StressLevel",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function AppAreaChart() {
  const [selectedMetric, setSelectedMetric] = React.useState<"All" | "HeartRate" | "ActivityLevel" | "StressLevel">("All")
  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date(
      Math.max(...chartData.map((d) => new Date(d.date).getTime()))
    )
    let daysToSubtract = 90
    if (timeRange === "30d") daysToSubtract = 30
    else if (timeRange === "7d") daysToSubtract = 7
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Wellness Trend Chart</CardTitle>
          <CardDescription>
            Live and historical data of user.
          </CardDescription>
        </div>
        <Select value={selectedMetric} onValueChange={(val) => setSelectedMetric(val as any)}>
          <SelectTrigger className="rounded-lg sm:ml-4">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="HeartRate">Heart Rate</SelectItem>
            <SelectItem value="ActivityLevel">Activity Level</SelectItem>
            <SelectItem value="StressLevel">Stress Level</SelectItem>
          </SelectContent>
        </Select>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex-1 px-2 pt-4 sm:px-6 sm:pt-6 min-h-0">
        <ChartContainer
          config={chartConfig}
          className="h-full w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
            <linearGradient id="fillHeartRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
            </linearGradient>

            <linearGradient id="fillActivityLevel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
            </linearGradient>

            <linearGradient id="fillStressLevel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.1} />
            </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            {(selectedMetric === "All" || selectedMetric === "HeartRate") && (
            <Area
                type="monotone"
                dataKey="HeartRate"
                stroke="var(--chart-1)"
                fill="url(#fillHeartRate)"
            />
            )}
            {(selectedMetric === "All" || selectedMetric === "ActivityLevel") && (
            <Area
                type="monotone"
                dataKey="ActivityLevel"
                stroke="var(--chart-2)"
                fill="url(#fillActivityLevel)"
            />
            )}
            {(selectedMetric === "All" || selectedMetric === "StressLevel") && (
            <Area
                type="monotone"
                dataKey="StressLevel"
                stroke="var(--chart-3)"
                fill="url(#fillStressLevel)"
            />
            )}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
