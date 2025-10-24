'use client'

import { Activity, Map as MapIcon, MessageCircle } from 'lucide-react'
import DottedMap from 'dotted-map'
import { Area, AreaChart, CartesianGrid } from 'recharts'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import Image from 'next/image'

export default function FeaturesSection() {
    return (
        <section id="features" className="px-4 py-16 md:py-32">
            <div className="text-center">
                <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Built for Real-Time Health Insights</h2>
                <p className="mt-4">From heart rate tracking to stress detection, VitaLink AI brings real-time health awareness to schools.</p>
            </div>
            <div className="mx-auto grid max-w-7xl border md:grid-cols-2 mt-16">
                <div>
                    <div className="p-6 sm:p-12">
                        <span className="text-muted-foreground flex items-center gap-2">
                            <MapIcon className="size-4" />
                            AI-Powered Stress Detection
                        </span>

                        <p className="mt-8 text-2xl font-semibold">Uses the Isolation Forest algorithm to analyze data and detect early signs of stress or fatigue.</p>
                    </div>

                    <div
                        aria-hidden
                        className="relative">
                        <div className="absolute inset-0 z-10 m-auto size-fit">
                            <div className="rounded-(--radius) bg-background z-1 dark:bg-muted relative flex size-fit w-fit items-center gap-2 border px-3 py-1 text-xs font-medium shadow-md shadow-zinc-950/5">
                                <span>Isolation Forest AI</span>
                            </div>
                            <div className="rounded-(--radius) bg-background absolute inset-2 -bottom-2 mx-auto border px-2 py-3 text-xs font-medium shadow-md shadow-zinc-950/5 dark:bg-zinc-900"></div>
                        </div>

                        <div className="relative overflow-hidden">
                            <div className="bg-radial z-1 to-background absolute inset-0 from-transparent to-75%"></div>
                            <Map />
                        </div>
                    </div>
                </div>
                <div className="overflow-hidden border-t bg-zinc-50 p-6 sm:p-12 md:border-0 md:border-l dark:bg-transparent">
                    <div className="relative z-10">
                        <span className="text-muted-foreground flex items-center gap-2">
                            <MessageCircle className="size-4" />
                            Automated Health Alerts
                        </span>

                        <p className="my-8 text-2xl font-semibold">Instantly notifies students or school health staff when abnormal readings are detected.</p>
                    </div>
                    <div
                        aria-hidden
                        className="flex flex-col gap-8">
                        <Image
                            src="/AlertCard.png"
                            alt="Automated Health Alerts"
                            width={500}
                            height={200}
                            className="rounded-md"
                            style={{
                                maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
                                WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
                            }}
                        />
                    </div>
                </div>
                <div className="col-span-full border-y p-12">
                    <p className="text-center text-4xl font-semibold lg:text-7xl">Live and Historical Data</p>
                </div>
                <div className="relative col-span-full">
                    <div className="absolute z-10 max-w-lg px-6 pr-12 pt-6 md:px-12 md:pt-12">
                        <span className="text-muted-foreground flex items-center gap-2">
                            <Activity className="size-4" />
                            Real-Time Health Monitoring
                        </span>

                        <p className="my-8 text-2xl font-semibold">
                            Tracks heart rate and movement in real time. <span className="text-muted-foreground"> Keeps students and staff informed on wellness. </span>
                        </p>
                    </div>
                    <MonitoringChart />
                </div>
            </div>
        </section>
    )
}

const map = new DottedMap({ height: 55, grid: 'diagonal' })

const points = map.getPoints()

const svgOptions = {
    backgroundColor: 'var(--color-background)',
    color: 'currentColor',
    radius: 0.15,
}

const Map = () => {
    const viewBox = `0 0 120 60`
    return (
        <svg
            viewBox={viewBox}
            style={{ background: svgOptions.backgroundColor }}>
            {points.map((point, index) => (
                <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r={svgOptions.radius}
                    fill={svgOptions.color}
                />
            ))}
        </svg>
    )
}

const chartConfig = {
    heartrate: {
        label: 'Heart Rate',
        color: '#2563eb',
    },
    activity: {
        label: 'Activity',
        color: '#60a5fa',
    },
} satisfies ChartConfig

const chartData = [
    { month: 'January', heartrate: 88, activity: 25 }, 
    { month: 'February', heartrate: 72, activity: 56 },
    { month: 'March', heartrate: 92, activity: 23 },   
    { month: 'April', heartrate: 68, activity: 75 },   
    { month: 'May', heartrate: 85, activity: 40 },    
    { month: 'June', heartrate: 70, activity: 80 },     
]

const MonitoringChart = () => {
    return (
        <ChartContainer
            className="h-120 aspect-auto md:h-96"
            config={chartConfig}>
            <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                    left: 0,
                    right: 0,
                }}>
                <defs>
                    <linearGradient
                        id="fillDesktop"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1">
                        <stop
                            offset="0%"
                            stopColor="var(--color-heartrate)"
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="55%"
                            stopColor="var(--color-heartrate)"
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                    <linearGradient
                        id="fillMobile"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1">
                        <stop
                            offset="0%"
                            stopColor="var(--color-activity)"
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="55%"
                            stopColor="var(--color-activity)"
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <ChartTooltip
                    active
                    cursor={false}
                    content={<ChartTooltipContent className="dark:bg-muted" />}
                />
                <Area
                    strokeWidth={2}
                    dataKey="activity"
                    type="natural"
                    fill="url(#fillMobile)"
                    fillOpacity={0.1}
                    stroke="var(--color-activity)"
                    stackId="a"
                />
                <Area
                    strokeWidth={2}
                    dataKey="heartrate"
                    type="natural"
                    fill="url(#fillDesktop)"
                    fillOpacity={0.1}
                    stroke="var(--color-heartrate)"
                    stackId="a"
                />
            </AreaChart>
        </ChartContainer>
    )
}
