import { Bell, TriangleAlert } from "lucide-react"
import { Card, CardContent, CardTitle } from "./ui/card"
import { CardHeader } from "./ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

const AlertCards = () => {
  return (
    <div className="flex flex-col h-full">
        <Card className="@container/card flex-1 flex flex-col relative overflow-hidden">
            <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>System Alerts</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
                <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                    <Bell />
                    </EmptyMedia>
                    <EmptyTitle>No Alerts Yet</EmptyTitle>
                    <EmptyDescription>
                    No abnormalities detected.
                    </EmptyDescription>
                </EmptyHeader>
                </Empty>
            </CardContent>
            <div className="absolute bottom-10 right-0 pointer-events-none">
              <TriangleAlert
                className="size-[350px] lg:size-[600px] text-red-300 opacity-20 translate-x-1/3 translate-y-1/3"
                strokeWidth={1}
              />
            </div>
        </Card>
    </div>
  )
}

export default AlertCards