"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ChartFiltersProps {
  selectedMetric: "All" | "HeartRate" | "ActivityLevel" | "StressLevel"
  timeRange: string
  onMetricChange: (value: "All" | "HeartRate" | "ActivityLevel" | "StressLevel") => void
  onTimeRangeChange: (value: string) => void
  isStale?: boolean
}

export function ChartFilters({
  selectedMetric,
  timeRange,
  onMetricChange,
  onTimeRangeChange,
  isStale = false,
}: ChartFiltersProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Chart Filters</label>
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={selectedMetric} onValueChange={onMetricChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="All">All Metrics</SelectItem>
            <SelectItem value="HeartRate">Heart Rate</SelectItem>
            <SelectItem value="ActivityLevel">Activity Level</SelectItem>
            <SelectItem value="StressLevel">Stress Level</SelectItem>
          </SelectContent>
        </Select>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="live">{isStale ? "Recent Data" : "Live Data"}</SelectItem>
            <SelectItem value="1h">Last 1 hour</SelectItem>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="12mo">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
