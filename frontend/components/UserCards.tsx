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
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(170px,1fr))] flex-shrink-0">
      {/* Card 1 */}
      <Card className="@container/card relative overflow-hidden flex flex-col">
        <CardHeader className="flex flex-col sm:flex-row items-start gap-2 flex-1">
          <div className="flex-1 min-w-0">
            <CardDescription className="truncate">Heart Rate</CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums whitespace-nowrap mb-2 sm:mb-0">
              72 BPM
            </CardTitle>
          </div>
          <div className="hidden sm:block">
            <CardAction className="flex-shrink-0">
              <Badge variant="outline" className="whitespace-nowrap">
                +12.5%
              </Badge>
            </CardAction>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm flex-shrink-0">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Uptrend <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Normal</div>
        </CardFooter>
        <div className="absolute bottom-0 right-0 pointer-events-none">
          <Heart
            className="size-64 text-red-300 dark:text-red-200 opacity-30 translate-x-1/3 translate-y-1/3"
            strokeWidth={1}
          />
        </div>
      </Card>

      {/* Card 2 */}
      <Card className="@container/card relative overflow-hidden flex flex-col">
        <CardHeader className="flex flex-col sm:flex-row items-start gap-2 flex-1">
          <div className="flex-1 min-w-0">
            <CardDescription className="truncate">Activity Level</CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums truncate mb-2 sm:mb-0">
              58%
            </CardTitle>
          </div>
          <div className="hidden sm:block">
            <CardAction className="flex-shrink-0">
              <Badge variant="outline" className="whitespace-nowrap">
                -20%
              </Badge>
            </CardAction>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm flex-shrink-0">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Downtrend <TrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">Normal</div>
        </CardFooter>
        <div className="absolute bottom-0 right-0 pointer-events-none">
          <Activity className="size-64 text-blue-300 opacity-30 translate-x-1/3 translate-y-1/3" strokeWidth={1} />
        </div>
      </Card>

      {/* Card 3 */}
      <Card className="@container/card relative overflow-hidden col-span-2 flex flex-col">
        <CardHeader className="flex flex-col sm:flex-row items-start gap-2 flex-1">
          <div className="flex-1 min-w-0">
            <CardDescription className="truncate">Stress Level</CardDescription>
            <CardTitle className="text-2xl lg:text-3xl font-semibold tabular-nums truncate mb-2 sm:mb-0">
              21%
            </CardTitle>
          </div>
          <div className="hidden sm:block">
            <CardAction className="flex-shrink-0">
              <Badge variant="outline" className="whitespace-nowrap">
                +1.5%
              </Badge>
            </CardAction>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm flex-shrink-0">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Uptrend <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Relax</div>
        </CardFooter>
        <div className="absolute bottom-0 right-0 pointer-events-none">
          <Brain className="size-64 text-orange-300 opacity-30 translate-x-1/3 translate-y-1/3" strokeWidth={1} />
        </div>
      </Card>
    </div>
  )
}
