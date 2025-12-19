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


// Generate comprehensive mock data for testing all time filters
const generateMockData = () => {
  const data: Array<{date: string, HeartRate: number, ActivityLevel: number, StressLevel: number}> = []
  const now = new Date()
  
  // Start from 12 months ago and work forward to avoid overlaps
  const startDate = new Date(now)
  startDate.setMonth(startDate.getMonth() - 12)
  
  // Generate data from oldest to newest to ensure proper chronological order
  const currentDate = new Date(startDate)
  
  // Phase 1: monthly data for months 12-2 (older historical data)
  while (currentDate < new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)) {
    data.push({
      date: new Date(currentDate).toISOString(),
      HeartRate: Math.floor(60 + Math.random() * 40),
      ActivityLevel: Math.floor(30 + Math.random() * 60),
      StressLevel: Math.floor(20 + Math.random() * 60),
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  // Phase 2: daily data for last 30 days
  currentDate.setTime(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  while (currentDate < new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
    data.push({
      date: new Date(currentDate).toISOString(),
      HeartRate: Math.floor(65 + Math.random() * 30 + Math.sin(currentDate.getTime() / 100000) * 10),
      ActivityLevel: Math.floor(40 + Math.random() * 50 + Math.cos(currentDate.getTime() / 80000) * 15),
      StressLevel: Math.floor(25 + Math.random() * 50 + Math.sin(currentDate.getTime() / 120000) * 10),
    })
    currentDate.setHours(currentDate.getHours() + 1)
  }
  
  // Phase 3: Per-hour data for last 24 hours
  currentDate.setTime(now.getTime() - 24 * 60 * 60 * 1000)
  // Round down to the start of the hour (XX:00:00)
  currentDate.setMinutes(0, 0, 0)
  while (currentDate < new Date(now.getTime() - 60 * 60 * 1000)) {
    data.push({
      date: new Date(currentDate).toISOString(),
      HeartRate: Math.floor(68 + Math.random() * 25 + Math.sin(currentDate.getTime() / 50000) * 8),
      ActivityLevel: Math.floor(45 + Math.random() * 40 + Math.cos(currentDate.getTime() / 40000) * 12),
      StressLevel: Math.floor(30 + Math.random() * 45 + Math.sin(currentDate.getTime() / 60000) * 8),
    })
    currentDate.setHours(currentDate.getHours() + 1)
  }
  
  // Phase 4: Per-minute data for last hour
  currentDate.setTime(now.getTime() - 60 * 60 * 1000)
  while (currentDate < new Date(now.getTime() - 60 * 1000)) {
    data.push({
      date: new Date(currentDate).toISOString(),
      HeartRate: Math.floor(70 + Math.random() * 20 + Math.sin(currentDate.getTime() / 30000) * 5),
      ActivityLevel: Math.floor(50 + Math.random() * 35 + Math.cos(currentDate.getTime() / 25000) * 10),
      StressLevel: Math.floor(35 + Math.random() * 40 + Math.sin(currentDate.getTime() / 35000) * 6),
    })
    currentDate.setSeconds(currentDate.getSeconds() + 1)
  }
  
  // Phase 5: Per-second data for last minute (live data)
  currentDate.setTime(now.getTime() - 60 * 1000)
  while (currentDate <= now) {
    data.push({
      date: new Date(currentDate).toISOString(),
      HeartRate: Math.floor(72 + Math.random() * 16 + Math.sin(currentDate.getTime() / 5000) * 4),
      ActivityLevel: Math.floor(55 + Math.random() * 25 + Math.cos(currentDate.getTime() / 4000) * 8),
      StressLevel: Math.floor(40 + Math.random() * 30 + Math.sin(currentDate.getTime() / 6000) * 5),
    })
    currentDate.setSeconds(currentDate.getSeconds() + 1)
  }
  
  return data
}

const chartData = generateMockData();


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

interface Student {
  id: string
  name: string
  schoolId: string
  avatar: string
}

interface AppAreaChartProps {
  selectedMetric?: "All" | "HeartRate" | "ActivityLevel" | "StressLevel"
  timeRange?: string
  student?: Student
}

export function AppAreaChart({ 
  selectedMetric = "All", 
  timeRange = "live",
  student
}: AppAreaChartProps = {}) {

  // Filter data based on time range
  // In production: Replace chartData with API call to fetch data from database
  // The database stores sensor data per second
  const filteredData = React.useMemo(() => {
    // For mock data, use the latest date in the dataset as reference
    const referenceDate = new Date(
      Math.max(...chartData.map((d) => new Date(d.date).getTime()))
    )
    const startDate = new Date(referenceDate)
    
    switch(timeRange) {
      case "live":
        // Last 60 seconds - fetch raw per-second data from DB
        startDate.setSeconds(startDate.getSeconds() - 60)
        break
      case "1h":
        // Last 1 hour - fetch per-second data, will be averaged per minute
        startDate.setHours(startDate.getHours() - 1)
        break
      case "24h":
        // Last 24 hours - fetch per-second data, will be averaged per hour
        startDate.setHours(startDate.getHours() - 24)
        break
      case "7d":
        // Last 7 days - fetch per-second data, will be averaged per day
        startDate.setDate(startDate.getDate() - 7)
        break
      case "30d":
        // Last 30 days - fetch per-second data, will be averaged per day
        startDate.setDate(startDate.getDate() - 30)
        break
      case "12mo":
        // Last 12 months - fetch per-second data, will be averaged per month
        startDate.setMonth(startDate.getMonth() - 12)
        break
      default:
        startDate.setDate(startDate.getDate() - 7)
    }
    
    // TODO: Replace with actual API call
    // Example: const data = await fetch(`/api/sensor-data?startDate=${startDate.toISOString()}&endDate=${referenceDate.toISOString()}`)
    return chartData.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate && date <= referenceDate
    })
  }, [timeRange])

  // Aggregate data based on time range
  // Process raw per-second data from database according to filter requirements
  const processedData = React.useMemo(() => {
    if (filteredData.length === 0) return []

    switch(timeRange) {
      case "live":
        // Display raw per-second values - no aggregation needed
        // Shows real-time data as it comes from sensors (stored per second in DB)
        return filteredData
      
      case "1h": {
        // Average per minute - group 60 per-second readings into 1-minute averages
        // Takes all per-second data from last hour and calculates average per minute
        const grouped = new Map<string, typeof chartData>()
        filteredData.forEach(item => {
          const date = new Date(item.date)
          // Group by minute (YYYY-MM-DD HH:mm)
          const minuteKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
          
          if (!grouped.has(minuteKey)) {
            grouped.set(minuteKey, [])
          }
          grouped.get(minuteKey)!.push(item)
        })
        
        // Calculate average for each minute
        return Array.from(grouped.entries()).map(([key, items]) => ({
          date: items[0].date,
          HeartRate: Math.round(items.reduce((sum, i) => sum + i.HeartRate, 0) / items.length),
          ActivityLevel: Math.round(items.reduce((sum, i) => sum + i.ActivityLevel, 0) / items.length),
          StressLevel: Math.round(items.reduce((sum, i) => sum + i.StressLevel, 0) / items.length),
        }))
      }
      
      case "24h": {
        // Average per hour - group 3600 per-second readings into 1-hour averages
        // Takes all per-second data from last 24 hours and calculates average per hour
        const grouped = new Map<string, typeof chartData>()
        filteredData.forEach(item => {
          const date = new Date(item.date)
          // Group by hour (YYYY-MM-DD HH)
          const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}`
          
          if (!grouped.has(hourKey)) {
            grouped.set(hourKey, [])
          }
          grouped.get(hourKey)!.push(item)
        })
        
        // Calculate average for each hour
        return Array.from(grouped.entries()).map(([key, items]) => ({
          date: items[0].date,
          HeartRate: Math.round(items.reduce((sum, i) => sum + i.HeartRate, 0) / items.length),
          ActivityLevel: Math.round(items.reduce((sum, i) => sum + i.ActivityLevel, 0) / items.length),
          StressLevel: Math.round(items.reduce((sum, i) => sum + i.StressLevel, 0) / items.length),
        }))
      }
      
      case "7d":
      case "30d": {
        // Average per day - group 86400 per-second readings into 1-day averages
        // Takes all per-second data from last 7/30 days and calculates average per day
        const grouped = new Map<string, typeof chartData>()
        filteredData.forEach(item => {
          const date = new Date(item.date)
          // Group by day (YYYY-MM-DD)
          const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          
          if (!grouped.has(dayKey)) {
            grouped.set(dayKey, [])
          }
          grouped.get(dayKey)!.push(item)
        })
        
        // Calculate average for each day
        return Array.from(grouped.entries()).map(([key, items]) => ({
          date: items[0].date,
          HeartRate: Math.round(items.reduce((sum, i) => sum + i.HeartRate, 0) / items.length),
          ActivityLevel: Math.round(items.reduce((sum, i) => sum + i.ActivityLevel, 0) / items.length),
          StressLevel: Math.round(items.reduce((sum, i) => sum + i.StressLevel, 0) / items.length),
        }))
      }
      
      case "12mo": {
        // Average per month - group all per-second readings into monthly averages
        // Takes all per-second data from last 12 months and calculates average per month
        const grouped = new Map<string, typeof chartData>()
        filteredData.forEach(item => {
          const date = new Date(item.date)
          // Group by month (YYYY-MM)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          
          if (!grouped.has(monthKey)) {
            grouped.set(monthKey, [])
          }
          grouped.get(monthKey)!.push(item)
        })
        
        // Calculate average for each month
        return Array.from(grouped.entries()).map(([key, items]) => ({
          date: items[0].date,
          HeartRate: Math.round(items.reduce((sum, i) => sum + i.HeartRate, 0) / items.length),
          ActivityLevel: Math.round(items.reduce((sum, i) => sum + i.ActivityLevel, 0) / items.length),
          StressLevel: Math.round(items.reduce((sum, i) => sum + i.StressLevel, 0) / items.length),
        }))
      }
      
      default:
        return filteredData
    }
  }, [filteredData, timeRange])

  // Calculate statistics (min, max, avg) based on the filtered time range
  // Min/Max are calculated from the processed (aggregated) data points
  // This gives min/max/avg that respect the current filter granularity
  const getStats = (metric: "HeartRate" | "ActivityLevel" | "StressLevel") => {
    const values = processedData.map(item => item[metric])
    if (values.length === 0) return { min: 0, max: 0, avg: 0 }
    
    // Min and Max are based on the aggregated data points for the selected time range
    const min = Math.min(...values)
    const max = Math.max(...values)
    // Avg is the average of the aggregated values
    const avg = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
    
    return { min, max, avg }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null

    // Calculate min/max from the raw filtered data for the specific time period of this data point
    const stats = React.useMemo(() => {
      if (timeRange === "live") return {} // No stats needed for live data
      
      const result: Record<string, { min: number; max: number }> = {}
      const date = new Date(label)
      
      payload.forEach((entry: any) => {
        let relevantData: typeof chartData = []
        
        switch(timeRange) {
          case "1h": {
            // Get all data points for this specific minute
            const minuteStart = new Date(date)
            const minuteEnd = new Date(date)
            minuteEnd.setMinutes(minuteEnd.getMinutes() + 1)
            relevantData = filteredData.filter(item => {
              const itemDate = new Date(item.date)
              return itemDate >= minuteStart && itemDate < minuteEnd
            })
            break
          }
          case "24h": {
            // Get all data points for this specific hour
            const hourStart = new Date(date)
            const hourEnd = new Date(date)
            hourEnd.setHours(hourEnd.getHours() + 1)
            relevantData = filteredData.filter(item => {
              const itemDate = new Date(item.date)
              return itemDate >= hourStart && itemDate < hourEnd
            })
            break
          }
          case "7d":
          case "30d": {
            // Get all data points for this specific day
            const dayStart = new Date(date)
            dayStart.setHours(0, 0, 0, 0)
            const dayEnd = new Date(dayStart)
            dayEnd.setDate(dayEnd.getDate() + 1)
            relevantData = filteredData.filter(item => {
              const itemDate = new Date(item.date)
              return itemDate >= dayStart && itemDate < dayEnd
            })
            break
          }
          case "12mo": {
            // Get all data points for this specific month
            const monthStart = new Date(date)
            monthStart.setDate(1)
            monthStart.setHours(0, 0, 0, 0)
            const monthEnd = new Date(monthStart)
            monthEnd.setMonth(monthEnd.getMonth() + 1)
            relevantData = filteredData.filter(item => {
              const itemDate = new Date(item.date)
              return itemDate >= monthStart && itemDate < monthEnd
            })
            break
          }
        }
        
        if (relevantData.length > 0) {
          const values = relevantData.map(item => item[entry.dataKey as keyof typeof item]) as number[]
          result[entry.dataKey] = {
            min: Math.min(...values),
            max: Math.max(...values)
          }
        }
      })
      return result
    }, [payload, label])

    // Format timestamp based on time range
    const formatTimestamp = () => {
      const date = new Date(label)
      
      switch(timeRange) {
        case "live":
          // Show full time with seconds for live data
          return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          })
        case "1h":
          // Show date and time with minutes for 1 hour range
          return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
        case "24h":
          // Show date and hour for 24 hour range
          return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
        case "7d":
        case "30d":
          // Show date only for daily aggregation
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          })
        case "12mo":
          // Show month and year for monthly aggregation
          return date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
          })
        default:
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          })
      }
    }

    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="mb-2 text-sm font-medium">
          {formatTimestamp()}
        </p>
        <div className="space-y-2">
          {payload.map((entry: any) => {
            const unit = entry.dataKey === "HeartRate" ? " BPM" : "%"
            const metricStats = stats[entry.dataKey]
            const currentValue = entry.value
            
            return (
              <div key={entry.dataKey} className="space-y-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="h-2 w-2 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-medium">{entry.name}</span>
                </div>
                <div className="ml-4 text-xs space-y-0.5">
                  {timeRange === "live" ? (
                    <p className="font-semibold">Value: {currentValue}{unit}</p>
                  ) : (
                    <>
                      <p className="font-semibold">Avg: {currentValue}{unit}</p>
                      {metricStats && (
                        <p className="text-muted-foreground">
                          Min: {metricStats.min}{unit} | Max: {metricStats.max}{unit}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <CardTitle>Wellness Trend Chart</CardTitle>
        <CardDescription>
          Live and historical data of user.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-2 pt-4 sm:px-6 sm:pt-6 min-h-0">
        <ChartContainer
          config={chartConfig}
          className="h-full w-full"
        >
          <AreaChart data={processedData}>
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
                switch(timeRange) {
                  case "live":
                    return date.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    })
                  case "1h":
                    return date.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  case "24h":
                    return date.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  case "7d":
                  case "30d":
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  case "12mo":
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      year: "2-digit",
                    })
                  default:
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                }
              }}
            />
            <ChartTooltip
              content={<CustomTooltip />}
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
