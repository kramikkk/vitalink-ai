"use client"

import { useState, useEffect } from "react"
import { Bell, TriangleAlert, X, AlertCircle, Heart, Activity, Check } from "lucide-react"
import { Card, CardContent, CardTitle } from "./ui/card"
import { CardHeader } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { cn } from "@/lib/utils"
import { tokenManager } from "@/lib/api"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Student {
  id: string
  name: string
  schoolId: string
  avatar: string
}

interface Alert {
  id: number
  alert_type: string
  severity: string
  title: string
  message: string
  heart_rate?: number
  motion_intensity?: number
  stress_level?: number
  anomaly_score?: number
  is_read: boolean
  created_at: string
}

interface AlertCardsProps {
  student?: Student
  studentId?: number
  isStale?: boolean
}

const AlertCards = ({ student, studentId, isStale = false }: AlertCardsProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [readFilter, setReadFilter] = useState<"unread" | "all">("unread")
  const [typeFilter, setTypeFilter] = useState<"all" | "HIGH_HEART_RATE" | "HIGH_ACTIVITY" | "AI_ANOMALY">("all")
  const isAdmin = !!studentId // If studentId is provided, this is admin view

  useEffect(() => {
    // Don't fetch alerts if device is offline (stale data)
    if (isStale) {
      return
    }

    const fetchAlerts = async () => {
      try {
        const token = tokenManager.getToken()
        if (!token) return

        let url = `${API_BASE_URL}/metrics/alerts`
        if (studentId) {
          url = `${API_BASE_URL}/metrics/student/${studentId}/alerts`
        }

        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setAlerts(data)
        } else {
          console.error("Failed to fetch alerts:", response.status, response.statusText)
        }
      } catch (error) {
        console.error("Error fetching alerts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
    // Poll for new alerts every 1 second (only when device is online)
    const interval = setInterval(fetchAlerts, 1000)
    return () => clearInterval(interval)
  }, [studentId, isStale])

  const markAsRead = async (alertId: number) => {
    try {
      const token = tokenManager.getToken()
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/metrics/alerts/${alertId}/mark-read`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, is_read: true } : a))
      } else {
        console.error("Failed to mark alert as read:", response.status)
      }
    } catch (error) {
      console.error("Error marking alert as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = tokenManager.getToken()
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/metrics/alerts/mark-all-read`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Update all unread alerts to read in local state
        setAlerts(alerts.map(a => ({ ...a, is_read: true })))
      } else {
        console.error("Failed to mark all alerts as read:", response.status)
      }
    } catch (error) {
      console.error("Error marking all alerts as read:", error)
    }
  }

  // Filter alerts based on selection
  const filteredAlerts = alerts
    .filter(a => {
      // Filter by read status
      if (readFilter === "unread" && a.is_read) return false

      // Filter by alert type
      if (typeFilter !== "all" && a.alert_type !== typeFilter) return false

      return true
    })

  const unreadCount = alerts.filter(a => !a.is_read).length

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
      case "HIGH": return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
      case "MEDIUM": return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800"
      default: return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
    }
  }

  const getAlertMetrics = (alert: Alert) => {
    switch (alert.alert_type) {
      case "HIGH_HEART_RATE":
        return alert.heart_rate ? (
          <div className="flex items-center gap-3 text-xs opacity-75">
            <span>HR: {Math.round(alert.heart_rate)} BPM</span>
          </div>
        ) : null
      case "HIGH_ACTIVITY":
        return alert.motion_intensity !== undefined ? (
          <div className="flex items-center gap-3 text-xs opacity-75">
            <span>Activity: {Math.round(alert.motion_intensity)}%</span>
          </div>
        ) : null
      case "AI_ANOMALY":
        return (
          <div className="flex items-center gap-3 text-xs opacity-75">
            {alert.heart_rate && (
              <span>HR: {Math.round(alert.heart_rate)} BPM</span>
            )}
            {alert.motion_intensity !== undefined && (
              <span>Activity: {Math.round(alert.motion_intensity)}%</span>
            )}
            {alert.stress_level !== undefined && (
              <span>Stress: {Math.round(alert.stress_level)}%</span>
            )}
            {alert.anomaly_score !== undefined && (
              <span>Anomaly Score: {alert.anomaly_score.toFixed(2)}</span>
            )}
          </div>
        )
      default:
        return null
    }
  }

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case "HIGH_HEART_RATE":
        return <Heart className="size-4" />
      case "HIGH_ACTIVITY":
        return <Activity className="size-4" />
      case "AI_ANOMALY":
        return <AlertCircle className="size-4" />
      default:
        return <TriangleAlert className="size-4" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    // Get current time in Philippine timezone
    const nowInManila = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }))
    const dateInManila = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Manila" }))

    const diffMs = nowInManila.getTime() - dateInManila.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Asia/Manila'
    })
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="@container/card flex-1 flex flex-col relative overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between gap-2 mb-2">
            <CardTitle className="flex items-center gap-2">
            <TriangleAlert className="size-5 text-red-500" /> {/* Added icon here */}
              Alerts
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={typeFilter} onValueChange={(value: "all" | "HIGH_HEART_RATE" | "HIGH_ACTIVITY" | "AI_ANOMALY") => setTypeFilter(value)}>
                <SelectTrigger className="w-[110px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="HIGH_HEART_RATE">Heart Rate</SelectItem>
                  <SelectItem value="HIGH_ACTIVITY">Activity</SelectItem>
                  <SelectItem value="AI_ANOMALY">Anomaly</SelectItem>
                </SelectContent>
              </Select>
              <Select value={readFilter} onValueChange={(value: "unread" | "all") => setReadFilter(value)}>
                <SelectTrigger className="w-[90px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="all">History</SelectItem>
                </SelectContent>
              </Select>
              {!isAdmin && unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={markAllAsRead}
                >
                  <Check className="h-4 w-4 mr-1" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden px-3 pb-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Loading alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <TriangleAlert className="text-red-500" />
                  </EmptyMedia>
                  <EmptyTitle>
                    {readFilter === "unread" && typeFilter === "all" ? "All Read!" : "No Alerts"}
                  </EmptyTitle>
                  <EmptyDescription>
                    {readFilter === "unread" && typeFilter === "all"
                      ? "No unread alerts. You're all caught up!"
                      : typeFilter !== "all"
                      ? `No ${typeFilter === "HIGH_HEART_RATE" ? "heart rate" : typeFilter === "HIGH_ACTIVITY" ? "activity" : "anomaly"} alerts found.`
                      : "No alerts found matching your filters."}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          ) : (
            <ScrollArea className="h-full pr-3">
              <div className="space-y-3">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "rounded-lg border p-3 relative",
                      getSeverityColor(alert.severity),
                      !alert.is_read && "border-2"
                    )}
                  >
                    {!isAdmin && !alert.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-7 px-2 text-xs"
                        onClick={() => markAsRead(alert.id)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                      </Button>
                    )}
                    <div className={cn("flex items-start gap-2 pr-2")}>
                      <div className="mt-0.5">
                        {getAlertIcon(alert.alert_type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{alert.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {alert.severity}
                          </Badge>
                          {!alert.is_read && (
                            <Badge variant="default" className="text-xs bg-blue-500">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                        <div className="mt-2">
                          {getAlertMetrics(alert)}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                          <span>{formatDate(alert.created_at)}</span>
                          <span>{formatTime(alert.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
        <div className="absolute bottom-10 right-0 pointer-events-none">
          <TriangleAlert
            className="size-[350px] lg:size-[500px] text-red-300 opacity-20 translate-x-1/3 translate-y-1/3"
            strokeWidth={1}
          />
        </div>
      </Card>
    </div>
  )
}

export default AlertCards
