"use client"

import * as React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert"
import { AlertCircle, AlertTriangle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const alerts = [
  {
    id: 1,
    title: "HEART RATE ANOMALY",
    description: "Heart rate elevated above 120BPM for over 10 minutes.",
    timestamp: "2 min ago"
  },
  {
    id: 2,
    title: "ACTIVITY ANOMALY", 
    description: "Activity level elevated above 90% for over 5 minutes.",
    timestamp: "5 min ago"
  },
  {
    id: 3,
    title: "STRESS DETECTED",
    description: "Stress level elevated above 86% for over 10 minutes.",
    timestamp: "8 min ago"
  },
  {
    id: 4,
    title: "SLEEP QUALITY LOW",
    description: "Sleep efficiency below 70% for the past 3 nights.",
    timestamp: "12 min ago"
  },
  {
    id: 5,
    title: "BLOOD PRESSURE HIGH",
    description: "Systolic pressure above 140mmHg detected multiple times.",
    timestamp: "15 min ago"
  },
  {
    id: 6,
    title: "IRREGULAR HEARTBEAT",
    description: "Atrial fibrillation episodes detected over past hour.",
    timestamp: "18 min ago"
  },
]

export function AlertCards() {
  const [readAlerts, setReadAlerts] = React.useState<number[]>([])

  const markAsRead = (id: number) => {
    setReadAlerts((prev) => [...prev, id])
  }

  const markAllAsRead = () => {
    const unreadIds = alerts.filter(alert => !readAlerts.includes(alert.id)).map(alert => alert.id)
    setReadAlerts((prev) => [...prev, ...unreadIds])
  }

  const unreadCount = alerts.filter(alert => !readAlerts.includes(alert.id)).length

  return (
    <Card className="w-full flex flex-col relative overflow-hidden">
      <CardHeader className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Health Alerts</CardTitle>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Recent Notifications
          </CardDescription>
        </div>
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={markAllAsRead}
            className="text-xs hover:bg-green-50 hover:text-green-700"
          >
            Mark all as read
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3 max-h-71 overflow-y-auto">
        {alerts.map((alert) => {
          const isRead = readAlerts.includes(alert.id)
          return (
            <Alert
              key={alert.id}
              variant={isRead ? "default" : "destructive"}
              className={`flex justify-between items-start transition-all duration-200 ${
                isRead ? 'opacity-75 border-green-200 bg-green-50' : ''
              }`}
            >
              <div className="flex gap-3 items-start">
                <AlertCircle className={`mt-1 size-5 ${isRead ? 'text-green-600' : ''}`} />
                <div className="flex-1">
                  <AlertTitle className={`flex items-center justify-between ${isRead ? 'text-green-800' : ''}`}>
                    <span>{alert.title}</span>
                  </AlertTitle>
                  <AlertDescription className={`mb-1 ${isRead ? 'text-green-700' : ''}`}>
                    {alert.description}
                  </AlertDescription>
                  <div className={`text-xs ${isRead ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {alert.timestamp}
                  </div>
                </div>
              </div>
              {!isRead && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => markAsRead(alert.id)}
                  className="ml-2 hover:bg-green-50 hover:border-green-300 p-2"
                >
                  <Check className="size-4" />
                </Button>
              )}
            </Alert>
          )
        })}
      </CardContent>
      
      <div className="absolute bottom-10 right-0 pointer-events-none">
        <AlertTriangle
          className="size-145 text-red-300 opacity-30 translate-x-1/3 translate-y-1/3"
          strokeWidth={1}
        />
      </div>
    </Card>
  )
}