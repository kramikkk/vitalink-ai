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

export function UserCards() {
  return (
    <div className="grid gap-4
                grid-cols-2 sm:grid-cols-2 lg:grid-cols-3
                px-0 lg:px-0
                *:data-[slot=card]:bg-gradient-to-t
                *:data-[slot=card]:from-primary/5
                *:data-[slot=card]:to-card
                dark:*:data-[slot=card]:bg-card
                *:data-[slot=card]:shadow-xs
                auto-rows-fr">

      {/* Card 1 */}
      <Card className="@container/card relative overflow-hidden">
        <CardHeader className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardDescription className="truncate">Heart Rate</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums whitespace-nowrap">
              72 BPM
            </CardTitle>
          </div>
          <CardAction className="flex-shrink-0">
            <Badge variant="outline" className="whitespace-nowrap">
              <TrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Uptrend <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Normal</div>
        </CardFooter>
        <div className="absolute bottom-0 right-0">
          <Heart
            className="size-64 text-red-300 dark:text-red-200 opacity-30 translate-x-1/3 translate-y-1/3"
            strokeWidth={1}
          />
        </div>
      </Card>

      {/* Card 2 */}
      <Card className="@container/card relative overflow-hidden">
        <CardHeader className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardDescription className="truncate">Activity Level</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums truncate">
              58%
            </CardTitle>
          </div>
          <CardAction className="flex-shrink-0">
            <Badge variant="outline" className="whitespace-nowrap">
              <TrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Downtrend <TrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">Normal</div>
        </CardFooter>
        <div className="absolute bottom-0 right-0">
          <Activity className="size-64 text-blue-300 opacity-30 translate-x-1/3 translate-y-1/3" strokeWidth={1} />
        </div>
      </Card>

      {/* Card 3 (last card spans 2 columns on small screens) */}
      <Card className="@container/card relative overflow-hidden col-span-2 sm:col-span-2 lg:col-span-1">
        <CardHeader className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardDescription className="truncate">Stress Level</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums truncate">
              21%
            </CardTitle>
          </div>
          <CardAction className="flex-shrink-0">
            <Badge variant="outline" className="whitespace-nowrap">
              <TrendingUp />
              +1.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Uptrend <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Relax</div>
        </CardFooter>
        <div className="absolute bottom-0 right-0">
          <Brain className="size-64 text-orange-300 opacity-30 translate-x-1/3 translate-y-1/3" strokeWidth={1} />
        </div>
      </Card>

    </div>
  )
}
