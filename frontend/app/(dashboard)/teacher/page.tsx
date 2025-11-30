"use client"

import { useState } from "react"
import { UserCards } from "@/components/UserCards"
import { AppAreaChart } from "@/components/AppAreaChart"
import AlertCards from "@/components/AlertCards"
import UserProfileCard from "@/components/UserProfileCard"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, ChevronsUpDown, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Mock student data - replace with API call
const students = [
	{
		id: "1",
		name: "Mark Jeric Exconde",
		schoolId: "0322-3614",
		avatar: "https://images.unsplash.com/photo-1494790108755-2616c0763e6c?w=150",
	},
	{
		id: "2",
		name: "Jasmine Macalintal",
		schoolId: "0322-3615",
		avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
	},
	{
		id: "3",
		name: "Zyra Mae Flores",
		schoolId: "0322-3616",
		avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
	},
]

const TeacherPage = () => {
	const [selectedStudent, setSelectedStudent] = useState<string>(students[0].id)
	const [searchQuery, setSearchQuery] = useState("")
	const [open, setOpen] = useState(false)
	const [selectedMetric, setSelectedMetric] = useState<"All" | "HeartRate" | "ActivityLevel" | "StressLevel">("All")
	const [timeRange, setTimeRange] = useState("live")

	const filteredStudents = students.filter(
		(student) =>
			student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			student.schoolId.includes(searchQuery)
	)

	const currentStudent = students.find((s) => s.id === selectedStudent)

	return (
		<div className="min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] pb-4 flex flex-col gap-4 overflow-y-auto lg:overflow-hidden">
			{/* Header Section */}
			<Card className="flex-shrink-0">
				<CardHeader>
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
						<div className="flex-1 flex flex-col justify-center">
							<CardTitle className="text-xl sm:text-2xl lg:text-3xl">
								IoT Health & Activity Dashboard for Teacher
							</CardTitle>
							<CardDescription className="text-sm sm:text-base">
								View and monitor individual student health metrics
							</CardDescription>
						</div>

						<div className="flex flex-col lg:flex-row gap-4">
							{/* Chart Filters */}
							<div className="flex flex-col justify-between gap-2">
								<label className="text-sm font-medium">Chart Filters</label>
								<div className="flex flex-col sm:flex-row gap-2">
									<Select value={selectedMetric} onValueChange={(val) => setSelectedMetric(val as any)}>
										<SelectTrigger className="w-full sm:w-[180px] h-[80px]">
											<SelectValue placeholder="Select metric" />
										</SelectTrigger>
										<SelectContent className="rounded-xl">
											<SelectItem value="All">All Metrics</SelectItem>
											<SelectItem value="HeartRate">Heart Rate</SelectItem>
											<SelectItem value="ActivityLevel">Activity Level</SelectItem>
											<SelectItem value="StressLevel">Stress Level</SelectItem>
										</SelectContent>
									</Select>
							<Select value={timeRange} onValueChange={setTimeRange}>
								<SelectTrigger className="w-full sm:w-[180px] h-[60px]">
									<SelectValue placeholder="Time range" />
								</SelectTrigger>
								<SelectContent className="rounded-xl">
									<SelectItem value="live">Live (seconds)</SelectItem>
									<SelectItem value="1h">Last 1 hour</SelectItem>
									<SelectItem value="24h">Last 24 hours</SelectItem>
									<SelectItem value="7d">Last 7 days</SelectItem>
									<SelectItem value="30d">Last 30 days</SelectItem>
									<SelectItem value="12mo">Last 12 months</SelectItem>
								</SelectContent>
							</Select>
								</div>
							</div>

							{/* Student Selector */}
							<div className="flex flex-col justify-between gap-2">
								<label className="text-sm font-medium">Select Student</label>
								<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={open}
									className="w-full sm:w-[280px] justify-between h-auto py-2"
								>
									{currentStudent ? (
										<div className="flex items-center gap-2 flex-1 min-w-0">
											<Avatar className="h-8 w-8 flex-shrink-0">
												<AvatarImage src={currentStudent.avatar} />
												<AvatarFallback>
													{currentStudent.name
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col items-start flex-1 min-w-0">
												<span className="truncate text-sm font-medium">
													{currentStudent.name}
												</span>
												<span className="text-xs text-muted-foreground">
													ID: {currentStudent.schoolId}
												</span>
											</div>
										</div>
									) : (
										"Select student..."
									)}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[280px] p-0">
								<div className="p-2 border-b">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Search student..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="pl-9"
										/>
									</div>
								</div>
								<div className="max-h-[300px] overflow-y-auto">
									{filteredStudents.length > 0 ? (
										filteredStudents.map((student) => (
											<Button
												key={student.id}
												variant="ghost"
												className="w-full justify-start font-normal h-auto py-3 px-2"
												onClick={() => {
													setSelectedStudent(student.id)
													setOpen(false)
												}}
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4 flex-shrink-0",
														selectedStudent === student.id
															? "opacity-100"
															: "opacity-0"
													)}
												/>
												<Avatar className="h-8 w-8 mr-2 flex-shrink-0">
													<AvatarImage src={student.avatar} />
													<AvatarFallback>
														{student.name
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</AvatarFallback>
												</Avatar>
												<div className="flex flex-col items-start flex-1 min-w-0">
													<span className="truncate text-sm font-medium">
														{student.name}
													</span>
													<span className="text-xs text-muted-foreground">
														ID: {student.schoolId}
													</span>
												</div>
											</Button>
										))
									) : (
										<div className="p-4 text-center text-sm text-muted-foreground">
											No students found
										</div>
									)}
												</div>
											</PopoverContent>
										</Popover>
									</div>
							</div>
						</div>
					</CardHeader>
				</Card>			{/* Student Dashboard Content */}
			<div className="flex-1 flex gap-4 flex-col lg:flex-row items-stretch min-h-0 overflow-y-auto lg:overflow-hidden">
				{/* LEFT */}
				<div className="flex-1 min-w-0 flex flex-col gap-4 lg:min-h-0 lg:overflow-y-auto">
					<div className="flex-shrink-0">
						<UserCards />
					</div>
					<div className="flex-1 min-h-[400px]">
						<AppAreaChart selectedMetric={selectedMetric} timeRange={timeRange} />
					</div>
				</div>

				{/* RIGHT */}
				<div className="w-full lg:w-1/3 min-w-[300px] flex flex-col gap-4 lg:overflow-y-auto">
					<div className="flex-[0.6] min-h-0">
						<AlertCards />
					</div>
					<div className="flex-[0.4] min-h-0">
						<UserProfileCard />
					</div>
				</div>
			</div>
		</div>
	)
}

export default TeacherPage