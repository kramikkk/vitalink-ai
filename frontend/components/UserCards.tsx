import { Activity, Brain, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Student {
  id: string
  name: string
  schoolId: string
  avatar: string
}

interface UserCardsProps {
  heartRate?: number
  activityLevel?: number
  stressLevel?: number
  student?: Student
  prediction?: string
  anomalyScore?: number
  isStale?: boolean
}

export function UserCards({
  heartRate = 0,
  activityLevel = 0,
  stressLevel = 0,
  student,
  prediction = "NORMAL",
  anomalyScore = 0,
  isStale = false
}: UserCardsProps = {}) {
  
  // Check if we have any data
  const hasData = heartRate > 0 || activityLevel > 0 || stressLevel > 0
  
  // Heart Rate: Low (<60), Normal (60-100), High (>100)
  const getHeartRateColor = (value: number) => {
    if (value === 0) return "text-muted-foreground"
    if (value < 60) return "text-yellow-500"
    if (value > 100) return "text-red-500"
    return "text-green-500"
  }
  
  const getHeartRateStatus = (value: number) => {
    if (value === 0) return "No Data"
    if (value < 60) return "Low"
    if (value > 100) return "High"
    return "Normal"
  }

  // Activity Level: Low (<60), Normal (60-80), High (>80)
  const getActivityColor = (value: number) => {
    if (value < 60) return "text-green-500"
    if (value > 80) return "text-red-500"
    return "text-yellow-500"
  }

  const getActivityStatus = (value: number) => {
    if (value < 60) return "Low"
    if (value > 80) return "High"
    return "Moderate"
  }

  // Stress Level: Low (<60), Normal (60-80), High (>80)
  const getStressColor = (value: number) => {
    if (heartRate === 0) return "text-muted-foreground"  // No data when no heart rate
    if (value < 60) return "text-green-500"
    if (value > 80) return "text-red-500"
    return "text-yellow-500"
  }

  const getStressStatus = (value: number) => {
    if (heartRate === 0) return "No Data"  // No data when no heart rate
    if (value < 60) return "Low"
    if (value > 80) return "High"
    return "Moderate"
  }

  return (
    <div className="space-y-4 flex-shrink-0">
      <div className={cn("grid gap-4 grid-cols-1 min-[388px]:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]", isStale && "opacity-60")}>
        {/* Card 1 */}
        <Card className="@container/card relative overflow-hidden flex flex-col">
        <CardHeader className="flex flex-col sm:flex-row items-start gap-2 flex-1">
          <div className="flex-1 min-w-0">
            <CardDescription className="truncate flex items-center gap-1.5">
              Heart Rate
              <Heart className="size-4" />
            </CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums whitespace-nowrap mb-2 sm:mb-0">
              {heartRate > 0 ? `${heartRate} BPM` : "--"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm flex-shrink-0">
          <div className={cn("font-medium", getHeartRateColor(heartRate))}>
            {getHeartRateStatus(heartRate)}
          </div>
        </CardFooter>
        <div className="absolute bottom-0 right-0 pointer-events-none">
          <Heart
            className="size-64 text-red-300 dark:text-red-200 opacity-30 translate-x-2/5 translate-y-1/3"
            strokeWidth={1}
          />
        </div>
      </Card>

      {/* Card 2 */}
      <Card className="@container/card relative overflow-hidden flex flex-col">
        <CardHeader className="flex flex-col sm:flex-row items-start gap-2 flex-1">
          <div className="flex-1 min-w-0">
            <CardDescription className="truncate flex items-center gap-1.5">
              Activity Level
              <Activity className="size-4" />
            </CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums truncate mb-2 sm:mb-0">
              {activityLevel}%
            </CardTitle>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm flex-shrink-0">
          <div className={cn("font-medium", getActivityColor(activityLevel))}>
            {getActivityStatus(activityLevel)}
          </div>
        </CardFooter>
        <div className="absolute bottom-0 right-0 pointer-events-none">
          <Activity className="size-56 text-blue-300 opacity-30 translate-x-1/3 translate-y-1/3" strokeWidth={1} />
        </div>
      </Card>

      {/* Card 3 */}
      <Card className="@container/card relative overflow-hidden col-span-2 flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between gap-2 flex-1">
          <div className="flex-1 min-w-0">
            <CardDescription className="truncate flex items-center gap-1.5">
              Stress Level
              <Brain className="size-4" />
            </CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums truncate mb-2 sm:mb-0">
              {heartRate > 0 ? `${stressLevel}%` : "--"}
            </CardTitle>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
              AI-Driven
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm flex-shrink-0">
          <div className="flex w-full items-center justify-between">
            <div className={cn("font-medium", getStressColor(stressLevel))}>
              {getStressStatus(stressLevel)}
            </div>
            <div className="text-xs text-muted-foreground">
              Isolation Forest
            </div>
          </div>
          <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
            <span>Prediction: <span className={cn("font-medium", heartRate === 0 ? "text-muted-foreground" : prediction === "ANOMALY" ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400")}>{heartRate === 0 ? "No Data" : prediction}</span></span>
            <span>Score: <span className="font-mono">{heartRate === 0 ? "--" : anomalyScore.toFixed(4)}</span></span>
          </div>
        </CardFooter>
        <div className="absolute bottom-7 right-0 pointer-events-none">
          <Brain className="size-150 text-orange-300 opacity-30 translate-x-1/3 translate-y-3/4" strokeWidth={0.5} />
        </div>
      </Card>
      </div>
    </div>
  )
}
