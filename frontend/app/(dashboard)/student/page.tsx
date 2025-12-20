"use client"

import { useState } from "react"
import { UserCards } from "@/components/UserCards"
import { AppAreaChart } from "@/components/AppAreaChart"
import AlertCards from "@/components/AlertCards"
import UserProfileCard from "@/components/UserProfileCard"
import { ChartFilters } from "@/components/ChartFilters"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRoleProtection } from "@/hooks/use-role-protection"
import { UserRole } from "@/lib/api"

const page = () => {
  // Protect this route - only allow STUDENT role
  useRoleProtection([UserRole.STUDENT])
  
  const [selectedMetric, setSelectedMetric] = useState<"All" | "HeartRate" | "ActivityLevel" | "StressLevel">("All")
  const [timeRange, setTimeRange] = useState("live")

  return (
    <div className="min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] pb-4 flex flex-col gap-4 overflow-y-auto lg:overflow-hidden">
      {/* Header Section */}
      <Card className="flex-shrink-0">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl">IoT Health & Activity Dashboard for Students</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Monitor your health metrics and activity levels in real-time
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3">
              <ChartFilters
                selectedMetric={selectedMetric}
                timeRange={timeRange}
                onMetricChange={setSelectedMetric}
                onTimeRangeChange={setTimeRange}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Dashboard Content */}
      <div className="flex-1 flex gap-4 flex-col lg:flex-row items-stretch min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* LEFT */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 lg:min-h-0 lg:overflow-y-auto">
          {/* UserCards takes natural height */}
          <div className="flex-shrink-0">
            <UserCards />
          </div>
          {/* AppAreaChart fills remaining space */}
          <div className="flex-1 min-h-[400px]">
            <AppAreaChart selectedMetric={selectedMetric} timeRange={timeRange} />
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full lg:w-1/3 min-w-[300px] flex flex-col gap-4 lg:overflow-y-auto">
          {/* AlertCards takes 60% of available space */}
          <div className="flex-[0.6] min-h-0">
            <AlertCards />
          </div>
          {/* UserProfileCard takes 40% of available space */}
          <div className="flex-[0.4] min-h-0">
            <UserProfileCard/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default page