import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Activity, Calendar, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const SummaryStatistics = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <CardTitle>Summary Statistics</CardTitle>
        </div>
        <CardDescription>Daily Summary</CardDescription>
        <CardAction>
            <Select>
                <SelectTrigger className="w-[105px]">
                    <SelectValue placeholder="Daily" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                </SelectContent>
            </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stress Level */}
        <Card>
          <CardContent className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-orange-600" />
                <CardTitle className="text-sm md:text-base">Stress Level</CardTitle>
              </div>
              <Badge
                variant="outline"
                className="bg-green-100 text-green-700 border-green-300"
              >
                Normal
              </Badge>
            </div>

            {/* Stats */}
            <div className="flex justify-between w-full text-center">
              <div className="flex-1">
                <p className="text-xs md:text-sm text-muted-foreground">Avg</p>
                <p className="font-semibold">30%</p>
              </div>
              <div className="flex-1">
                <p className="text-xs md:text-sm text-muted-foreground">Peak</p>
                <p className="font-semibold text-red-600">70%</p>
              </div>
              <div className="flex-1">
                <p className="text-xs md:text-sm text-muted-foreground">Lowest</p>
                <p className="font-semibold text-blue-600">10%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 gap-4">
          {/* Heart Rate */}
          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  <CardTitle className="text-sm md:text-base">Heart Rate</CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-700 border-green-300"
                >
                  Normal
                </Badge>
              </div>

              <div className="flex justify-between w-full text-center">
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Avg</p>
                  <p className="font-semibold">75</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Peak</p>
                  <p className="font-semibold text-red-600">120</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Lowest</p>
                  <p className="font-semibold text-blue-600">60</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Level */}
          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-sm md:text-base">Activity Level</CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-700 border-yellow-300"
                >
                  Moderate
                </Badge>
              </div>

              <div className="flex justify-between w-full text-center">
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Avg</p>
                  <p className="font-semibold">65%</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Peak</p>
                  <p className="font-semibold text-orange-600">92%</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Lowest</p>
                  <p className="font-semibold text-blue-600">20%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>

      <CardFooter>
        <p className="text-xs md:text-sm text-muted-foreground">Updated 5mins ago</p>
      </CardFooter>
    </Card>
  )
}

export default SummaryStatistics
