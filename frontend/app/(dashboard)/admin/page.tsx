"use client"

import { useState, useEffect } from "react"
import { UserCards } from "@/components/UserCards"
import { AppAreaChart } from "@/components/AppAreaChart"
import AlertCards from "@/components/AlertCards"
import UserProfileCard from "@/components/UserProfileCard"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, ChevronsUpDown, Check, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useRoleProtection } from "@/hooks/use-role-protection"
import { UserRole, authApi, tokenManager, UserProfile, metricsApi } from "@/lib/api"

const AdminPage = () => {
	// Protect this route - only allow ADMIN and SUPER_ADMIN
	useRoleProtection([UserRole.ADMIN, UserRole.SUPER_ADMIN])
	
	const [students, setStudents] = useState<UserProfile[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
	const [searchQuery, setSearchQuery] = useState("")
	const [open, setOpen] = useState(false)

	// Metrics state for selected student
	const [heartRate, setHeartRate] = useState<number>(0)
	const [activityLevel, setActivityLevel] = useState<number>(0)
	const [stressLevel, setStressLevel] = useState<number>(0)
	const [prediction, setPrediction] = useState<string>("NORMAL")
	const [anomalyScore, setAnomalyScore] = useState<number>(0)
	const [isStale, setIsStale] = useState<boolean>(false)

	// Fetch students from database
	useEffect(() => {
		const fetchStudents = async () => {
			try {
				const token = tokenManager.getToken()
				if (!token) {
					setError("No authentication token found")
					return
				}
				
				const studentsData = await authApi.getStudents(token)
				setStudents(studentsData)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Failed to fetch students')
			} finally {
				setLoading(false)
			}
		}

		fetchStudents()
	}, [])

	// Fetch metrics for selected student
	useEffect(() => {
		if (!selectedStudent) {
			// Reset metrics when no student is selected
			setHeartRate(0)
			setActivityLevel(0)
			setStressLevel(0)
			setPrediction("NORMAL")
			setAnomalyScore(0)
			setIsStale(false)
			return
		}

		const fetchMetrics = async () => {
			const token = tokenManager.getToken()
			if (!token) return

			try {
				const studentId = parseInt(selectedStudent)
				const metrics = await metricsApi.getStudentLatestMetrics(token, studentId)
				if (metrics && metrics.length > 0) {
					const latest = metrics[0]

					// Check if data is stale (older than 5 seconds)
					const metricTimestamp = new Date(latest.timestamp).getTime()
					const now = Date.now()
					const ageInSeconds = (now - metricTimestamp) / 1000
					const dataIsStale = ageInSeconds > 5

					setHeartRate(Math.round(latest.heart_rate))
					setActivityLevel(Math.round(latest.motion_intensity))
					// Use AI-detected anomaly confidence as stress level (0-100 range)
					setStressLevel(Math.round(latest.confidence_anomaly))
					setPrediction(latest.prediction)
					setAnomalyScore(latest.anomaly_score)
					setIsStale(dataIsStale)
				} else {
					// No data available for this student
					setHeartRate(0)
					setActivityLevel(0)
					setStressLevel(0)
					setPrediction("NORMAL")
					setAnomalyScore(0)
					setIsStale(true)
				}
			} catch (error) {
				console.error('Error fetching student metrics:', error)
				setIsStale(true)
			}
		}

		// Fetch immediately
		fetchMetrics()

		// Then fetch every 1 second for real-time updates
		const interval = setInterval(fetchMetrics, 1000)

		return () => clearInterval(interval)
	}, [selectedStudent])

	const filteredStudents = students.filter(
		(student) =>
			student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			student.student_id?.includes(searchQuery)
	)

	const currentStudent = students.find((s) => s.id.toString() === selectedStudent)

	// Transform UserProfile to Student type for components
	const transformedStudent = currentStudent ? {
		id: currentStudent.id.toString(),
		name: currentStudent.full_name,
		schoolId: currentStudent.student_id || '',
		avatar: currentStudent.avatar_url || ''
	} : undefined

	return (
		<div className="min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] pb-4 flex flex-col gap-4 overflow-y-auto lg:overflow-hidden">
			{/* Header Section */}
			<Card className="flex-shrink-0">
				<CardHeader>
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
						<div className="flex-1 flex flex-col justify-center">
							<CardTitle className="text-xl sm:text-2xl lg:text-3xl flex items-center gap-3">
								IoT Health & Activity Dashboard for Admin
								{selectedStudent && (
									<span className="flex items-center gap-2">
										<span className={`h-3 w-3 rounded-full ${isStale ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></span>
										<span className="text-sm font-normal text-muted-foreground">
											{isStale ? 'Offline' : 'Online'}
										</span>
									</span>
								)}
							</CardTitle>
							<CardDescription className="text-sm sm:text-base">
								View and monitor individual student health metrics
							</CardDescription>
						</div>

						{/* Student Selector */}
						<div className="flex flex-col gap-2 flex-shrink-0">
							<label className="text-sm font-medium">Select Student</label>
							<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={open}
									className="w-full sm:w-[280px] justify-between h-auto py-2"
									disabled={loading}
								>
									{loading ? (
										<div className="flex items-center gap-2">
											<Loader2 className="h-4 w-4 animate-spin" />
											<span>Loading students...</span>
										</div>
									) : currentStudent ? (
										<div className="flex items-center gap-2 flex-1 min-w-0">
											<Avatar className="h-8 w-8 flex-shrink-0">
												<AvatarImage src={currentStudent.avatar_url || undefined} />
												<AvatarFallback>
													{currentStudent.full_name
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
											<div className="flex flex-col items-start flex-1 min-w-0">
												<span className="truncate text-sm font-medium">
													{currentStudent.full_name}
												</span>
												<span className="text-xs text-muted-foreground">
													ID: {currentStudent.student_id}
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
									{error ? (
										<div className="p-4 text-center text-sm text-destructive">
											{error}
										</div>
									) : filteredStudents.length > 0 ? (
										filteredStudents.map((student) => (
											<Button
												key={student.id}
												variant="ghost"
												className="w-full justify-start font-normal h-auto py-3 px-2"
												onClick={() => {
													setSelectedStudent(student.id.toString())
													setOpen(false)
												}}
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4 flex-shrink-0",
														selectedStudent === student.id.toString()
															? "opacity-100"
															: "opacity-0"
													)}
												/>
												<Avatar className="h-8 w-8 mr-2 flex-shrink-0">
													<AvatarImage src={student.avatar_url || undefined} />
													<AvatarFallback>
														{student.full_name
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</AvatarFallback>
												</Avatar>
												<div className="flex flex-col items-start flex-1 min-w-0">
													<span className="truncate text-sm font-medium">
														{student.full_name}
													</span>
													<span className="text-xs text-muted-foreground">
														ID: {student.student_id}
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
				</CardHeader>
			</Card>

			{/* Hidden profile card for admin's own profile editing */}
			<div className="hidden">
				<UserProfileCard />
			</div>

			{/* Student Dashboard Content */}
			{!transformedStudent ? (
				<Card className="flex-1 flex items-center justify-center">
					<div className="text-center p-8">
						<p className="text-lg text-muted-foreground">Please select a student to view their health metrics</p>
					</div>
				</Card>
			) : (
			<div className="flex-1 flex gap-4 flex-col lg:flex-row items-stretch min-h-0 overflow-y-auto lg:overflow-hidden">
				{/* LEFT */}
				<div className="flex-1 min-w-0 flex flex-col gap-4 lg:min-h-0 lg:overflow-y-auto">
					<div className="flex-shrink-0">
					<UserCards
						heartRate={heartRate}
						activityLevel={activityLevel}
						stressLevel={stressLevel}
						student={transformedStudent}
						prediction={prediction}
						anomalyScore={anomalyScore}
						isStale={isStale}
					/>
					</div>
					<div className="flex-1 min-h-[400px]">
					<AppAreaChart
						student={transformedStudent}
						studentId={selectedStudent ? parseInt(selectedStudent) : undefined}
						isStale={isStale}
					/>
					</div>
				</div>

				{/* RIGHT */}
				<div className="w-full lg:w-1/3 min-w-[300px] flex flex-col gap-4 lg:overflow-y-auto">
					<div className="flex-[0.6] min-h-0">
						<AlertCards student={transformedStudent} studentId={selectedStudent ? parseInt(selectedStudent) : undefined} isStale={isStale} />
					</div>
					<div className="flex-[0.4] min-h-0">
						<UserProfileCard studentProfile={currentStudent} />
					</div>
				</div>
			</div>
			)}
		</div>
	)
}

export default AdminPage