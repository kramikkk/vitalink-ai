"use client"

import * as React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card"
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert"
import { AlertCircleIcon, AlertTriangleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

const alerts = [
  {
    id: 1,
    title: "HEART RATE ANOMALY",
    description: "Heart rate elevated above 120BPM for over 10 minutes.",
  },
  {
    id: 2,
    title: "ACTIVITY ANOMALY",
    description: "Activity level elevated above 90% for over 5 minutes.",
  },
  {
    id: 3,
    title: "STRESS DETECTED",
    description: "Stress level elevated above 86% for over 10 minutes.",
  },
]

export function AlertCards() {
  const [readAlerts, setReadAlerts] = React.useState<number[]>([])

  const markAsRead = (id: number) => {
    setReadAlerts((prev) => [...prev, id])
  }

  return (
    <Card className="w-full flex flex-col relative overflow-hidden">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold">Health Alerts</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Recent Notifications
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {alerts.slice(0, 3).map((alert) => (
            <Alert
                key={alert.id}
                variant={readAlerts.includes(alert.id) ? "default" : "destructive"}
                className="flex justify-between items-start"
            >
                <div className="flex gap-3 items-start">
                <AlertCircleIcon className="mt-1 size-5" />
                <div>
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertDescription>{alert.description}</AlertDescription>
                </div>
                </div>
                {!readAlerts.includes(alert.id) && (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAsRead(alert.id)}
                >
                    Mark as read
                </Button>
                )}
            </Alert>
        ))}
      </CardContent>
        <div className="absolute bottom-10 right-0 pointer-events-none">
        <AlertTriangleIcon
            className="size-115 text-red-300 opacity-30 translate-x-1/3 translate-y-1/3"
            strokeWidth={1}
        />
        </div>
    </Card>
  )
}
