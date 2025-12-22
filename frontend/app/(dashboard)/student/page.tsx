"use client"

import { useState, useEffect } from "react"
import { UserCards } from "@/components/UserCards"
import { AppAreaChart } from "@/components/AppAreaChart"
import AlertCards from "@/components/AlertCards"
import UserProfileCard from "@/components/UserProfileCard"
import { ChartFilters } from "@/components/ChartFilters"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRoleProtection } from "@/hooks/use-role-protection"
import { UserRole, metricsApi, tokenManager } from "@/lib/api"

const page = () => {
  // Protect this route - only allow STUDENT role
  useRoleProtection([UserRole.STUDENT])
  
  const [selectedMetric, setSelectedMetric] = useState<"All" | "HeartRate" | "ActivityLevel" | "StressLevel">("All")
  const [timeRange, setTimeRange] = useState("live")
  
  // Metrics state
  const [heartRate, setHeartRate] = useState<number>(0)
  const [activityLevel, setActivityLevel] = useState<number>(0)
  const [stressLevel, setStressLevel] = useState<number>(0)
  const [prediction, setPrediction] = useState<string>("NORMAL")
  const [anomalyScore, setAnomalyScore] = useState<number>(0)
  const [isStale, setIsStale] = useState<boolean>(false)

  // Fetch metrics from backend
  useEffect(() => {
    const fetchMetrics = async () => {
      const token = tokenManager.getToken()
      if (!token) return

      try {
        const metrics = await metricsApi.getLatestMetrics(token)
        if (metrics && metrics.length > 0) {
          const latest = metrics[0] // Get the most recent metric

          // Check if data is stale (older than 5 seconds)
          const metricTimestamp = new Date(latest.timestamp).getTime()
          const now = Date.now()
          const ageInSeconds = (now - metricTimestamp) / 1000
          const dataIsStale = ageInSeconds > 5

          setHeartRate(Math.round(latest.heart_rate))
          setActivityLevel(Math.round(latest.motion_intensity))
          setStressLevel(Math.round(latest.confidence_anomaly))
          setPrediction(latest.prediction)
          setAnomalyScore(latest.anomaly_score)
          setIsStale(dataIsStale)
        } else {
          // No data at all
          setIsStale(true)
        }
      } catch (error) {
        console.error('Error fetching metrics:', error)
        setIsStale(true)
      }
    }

    // Fetch immediately
    fetchMetrics()

    // Then fetch every 1 second for real-time updates
    const interval = setInterval(fetchMetrics, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] pb-4 flex flex-col gap-4 overflow-y-auto lg:overflow-hidden">
      {/* Header Section */}
      <Card className="flex-shrink-0">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl flex items-center gap-3">
                IoT Health & Activity Dashboard for Students
                <span className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${isStale ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {isStale ? 'Offline' : 'Online'}
                  </span>
                </span>
              </CardTitle>
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
            <UserCards
              heartRate={heartRate}
              activityLevel={activityLevel}
              stressLevel={stressLevel}
              prediction={prediction}
              anomalyScore={anomalyScore}
              isStale={isStale}
            />
          </div>
          {/* AppAreaChart fills remaining space */}
          <div className="flex-1 min-h-[400px]">
            <AppAreaChart selectedMetric={selectedMetric} timeRange={timeRange} isStale={isStale} />
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-full lg:w-1/3 min-w-[300px] flex flex-col gap-4 lg:overflow-y-auto">
          {/* AlertCards takes 60% of available space */}
          <div className="flex-[0.6] min-h-0">
            <AlertCards isStale={isStale} />
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