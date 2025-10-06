import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Brain, Calendar, Heart, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SummaryStatistics = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-muted rounded-lg">
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Summary Statistics</CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                Updated 5 mins ago
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select>
              <SelectTrigger className="w-[105px] h-8">
                <SelectValue placeholder="Daily" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stress Level */}
        <Card className="border shadow-none bg-muted/20">
          <CardContent className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg">
                  <Brain className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-sm md:text-base">Stress Level</CardTitle>
                  <p className="text-xs text-muted-foreground">Overall wellness</p>
                </div>
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
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Average</p>
                <p className="font-semibold text-lg">30%</p>
              </div>
              <div className="flex-1">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Peak</p>
                <p className="font-semibold text-lg text-red-600">70%</p>
              </div>
              <div className="flex-1">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Lowest</p>
                <p className="font-semibold text-lg text-blue-600">10%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 gap-4">
          {/* Heart Rate */}
          <Card className="border shadow-none">
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg">
                    <Heart className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm md:text-base">Heart Rate</CardTitle>
                    <p className="text-xs text-muted-foreground">BPM monitoring</p>
                  </div>
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
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">Average</p>
                  <p className="font-semibold text-lg">75</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">Peak</p>
                  <p className="font-semibold text-lg text-red-600">120</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">Resting</p>
                  <p className="font-semibold text-lg text-blue-600">60</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Level */}
          <Card className="border shadow-none">
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm md:text-base">Activity Level</CardTitle>
                    <p className="text-xs text-muted-foreground">Daily movement</p>
                  </div>
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
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">Average</p>
                  <p className="font-semibold text-lg">65%</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">Peak</p>
                  <p className="font-semibold text-lg text-orange-600">92%</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">Minimum</p>
                  <p className="font-semibold text-lg text-blue-600">20%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryStatistics;