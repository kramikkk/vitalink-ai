import { Activity, Brain, Heart, TrendingDown, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
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
}

export function UserCards({ 
  heartRate = 101, 
  activityLevel = 58, 
  stressLevel = 21,
  student
}: UserCardsProps = {}) {
  
  // Heart Rate: Low (<60), Normal (60-100), High (>100)
  const getHeartRateColor = (value: number) => {
    if (value < 60) return "text-yellow-500"
    if (value > 100) return "text-red-500"
    return "text-green-500"
  }
  
  const getHeartRateStatus = (value: number) => {
    if (value < 60) return "Low"
    if (value > 100) return "High"
    return "Normal"
  }

  // Activity Level: Low (<40), Normal (40-70), High (>70)
  const getActivityColor = (value: number) => {
    if (value < 40) return "text-green-500"
    if (value > 70) return "text-red-500"
    return "text-yellow-500"
  }
  
  const getActivityStatus = (value: number) => {
    if (value < 40) return "Low"
    if (value > 70) return "High"
    return "Moderate"
  }

  // Stress Level: Low (<30), Normal (30-60), High (>60)
  const getStressColor = (value: number) => {
    if (value < 30) return "text-green-500"
    if (value > 60) return "text-red-500"
    return "text-yellow-500"
  }
  
  const getStressStatus = (value: number) => {
    if (value < 30) return "Low"
    if (value > 60) return "High"
    return "Moderate"
  }

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(170px,1fr))] flex-shrink-0">
      {/* Card 1 */}
      <Card className="@container/card relative overflow-hidden flex flex-col">
        <CardHeader className="flex flex-col sm:flex-row items-start gap-2 flex-1">
          <div className="flex-1 min-w-0">
            <CardDescription className="truncate flex items-center gap-1.5">
              Heart Rate
              <Heart className="size-4" />
            </CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums whitespace-nowrap mb-2 sm:mb-0">
              {heartRate} BPM
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
              {stressLevel}%
            </CardTitle>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
              AI-Driven
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-row items-center justify-between gap-1.5 text-sm flex-shrink-0">
          <div className={cn("font-medium", getStressColor(stressLevel))}>
            {getStressStatus(stressLevel)}
          </div>
          <div className="text-xs text-muted-foreground">
            Isolation Forest
          </div>
        </CardFooter>
        <div className="absolute bottom-7 right-0 pointer-events-none">
          <Brain className="size-150 text-orange-300 opacity-30 translate-x-1/3 translate-y-3/4" strokeWidth={0.5} />
        </div>
      </Card>
    </div>
  )
}
