"use client"

import { useState, useEffect } from "react"
import { Users, Search, Trash2, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { authApi, tokenManager, UserProfile, UserRole } from "@/lib/api"
import { useUser } from "@/contexts/UserContext"
import { useToast } from "@/hooks/use-toast"

interface UserManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserManagementDialog({ open, onOpenChange }: UserManagementDialogProps) {
  const { user: currentUser } = useUser()
  const { toast } = useToast()
  const [students, setStudents] = useState<UserProfile[]>([])
  const [admins, setAdmins] = useState<UserProfile[]>([])
  const [superAdmins, setSuperAdmins] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [createAdminDialogOpen, setCreateAdminDialogOpen] = useState(false)
  const [creatingAdmin, setCreatingAdmin] = useState(false)
  
  const [studentSearch, setStudentSearch] = useState("")
  const [adminSearch, setAdminSearch] = useState("")
  const [superAdminSearch, setSuperAdminSearch] = useState("")

  const [newAdminForm, setNewAdminForm] = useState({
    full_name: "",
    username: "",
    admin_id: "",
    email: "",
    password: "",
    confirm_password: "",
  })

  useEffect(() => {
    if (open) {
      fetchAllUsers()
    }
  }, [open])

  const fetchAllUsers = async () => {
    setLoading(true)
    const token = tokenManager.getToken()
    if (!token) return

    try {
      const [studentsData, adminsData, superAdminsData] = await Promise.all([
        authApi.getStudents(token),
        authApi.getAdmins(token),
        authApi.getSuperAdmins(token),
      ])
      setStudents(studentsData)
      setAdmins(adminsData)
      setSuperAdmins(superAdminsData)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = (users: UserProfile[], searchTerm: string) => {
    if (!searchTerm) return users
    const term = searchTerm.toLowerCase()
    return users.filter(
      (user) =>
        user.full_name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.student_id?.toLowerCase().includes(term) ||
        user.admin_id?.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term)
    )
  }

  const canDeleteUser = (user: UserProfile) => {
    if (!currentUser) return false
    
    // Admins can only delete students
    if (currentUser.role === UserRole.ADMIN) {
      return user.role === UserRole.STUDENT
    }
    
    // Super admins can delete students and admins, but not other super admins
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      return user.role === UserRole.STUDENT || user.role === UserRole.ADMIN
    }
    
    return false
  }

  const handleDeleteClick = (user: UserProfile) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return
    
    const token = tokenManager.getToken()
    if (!token) return

    try {
      await authApi.deleteUser(userToDelete.id, token)
      
      // Update local state
      setStudents(students.filter(s => s.id !== userToDelete.id))
      setAdmins(admins.filter(a => a.id !== userToDelete.id))
      setSuperAdmins(superAdmins.filter(sa => sa.id !== userToDelete.id))
      
      toast({
        title: "User deleted",
        description: `${userToDelete.full_name} has been removed from the system.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleCreateAdmin = async () => {
    const token = tokenManager.getToken()
    if (!token) return

    // Validation
    if (!newAdminForm.full_name || !newAdminForm.username || !newAdminForm.admin_id || 
        !newAdminForm.email || !newAdminForm.password || !newAdminForm.confirm_password) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      })
      return
    }

    if (newAdminForm.password !== newAdminForm.confirm_password) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (newAdminForm.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      })
      return
    }

    setCreatingAdmin(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/admin/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAdminForm),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create admin')
      }

      toast({
        title: "Success",
        description: `Admin account for ${newAdminForm.full_name} has been created.`,
      })

      // Reset form
      setNewAdminForm({
        full_name: "",
        username: "",
        admin_id: "",
        email: "",
        password: "",
        confirm_password: "",
      })

      // Refresh users list
      await fetchAllUsers()
      setCreateAdminDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create admin",
        variant: "destructive",
      })
    } finally {
      setCreatingAdmin(false)
    }
  }

  const filteredStudents = filterUsers(students, studentSearch)
  const filteredAdmins = filterUsers(admins, adminSearch)
  const filteredSuperAdmins = filterUsers(superAdmins, superAdminSearch)

  const UserCard = ({ user }: { user: UserProfile }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar_url || undefined} />
        <AvatarFallback>
          {user.full_name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.full_name}</p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        {user.student_id && (
          <p className="text-xs text-muted-foreground">ID: {user.student_id}</p>
        )}
        {user.admin_id && (
          <p className="text-xs text-muted-foreground">ID: {user.admin_id}</p>
        )}
      </div>
      {canDeleteUser(user) && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => handleDeleteClick(user)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between mr-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </div>
            {currentUser?.role === UserRole.SUPER_ADMIN && (
              <Button
                onClick={() => setCreateAdminDialogOpen(true)}
                size="sm"
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Create Admin
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            View all users in the system by role
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Students Column */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0 space-y-2">
              <CardTitle className="text-lg flex items-center justify-between">
                Students
                <span className="text-sm font-normal text-muted-foreground">
                  {filteredStudents.length}/{students.length}
                </span>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 px-6 pb-6">
              <ScrollArea className="h-full min-h-[200px] max-h-[400px] pr-4">
                {loading ? (
                  <div className="text-center text-muted-foreground py-8">
                    Loading...
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    {studentSearch ? "No matching students" : "No students found"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredStudents.map((student) => (
                      <UserCard key={student.id} user={student} />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Admins Column */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0 space-y-2">
              <CardTitle className="text-lg flex items-center justify-between">
                Admins
                <span className="text-sm font-normal text-muted-foreground">
                  {filteredAdmins.length}/{admins.length}
                </span>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search admins..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 px-6 pb-6">
              <ScrollArea className="h-full min-h-[200px] max-h-[400px] pr-4">
                {loading ? (
                  <div className="text-center text-muted-foreground py-8">
                    Loading...
                  </div>
                ) : filteredAdmins.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    {adminSearch ? "No matching admins" : "No admins found"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAdmins.map((admin) => (
                      <UserCard key={admin.id} user={admin} />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Super Admins Column */}
          <Card className="flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0 space-y-2">
              <CardTitle className="text-lg flex items-center justify-between">
                Super Admins
                <span className="text-sm font-normal text-muted-foreground">
                  {filteredSuperAdmins.length}/{superAdmins.length}
                </span>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search super admins..."
                  value={superAdminSearch}
                  onChange={(e) => setSuperAdminSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 px-6 pb-6">
              <ScrollArea className="h-full min-h-[200px] max-h-[400px] pr-4">
                {loading ? (
                  <div className="text-center text-muted-foreground py-8">
                    Loading...
                  </div>
                ) : filteredSuperAdmins.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    {superAdminSearch ? "No matching super admins" : "No super admins found"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredSuperAdmins.map((superAdmin) => (
                      <UserCard key={superAdmin.id} user={superAdmin} />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </DialogContent>

      {/* Create Admin Dialog */}
      <AlertDialog open={createAdminDialogOpen} onOpenChange={setCreateAdminDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Create Admin Account</AlertDialogTitle>
            <AlertDialogDescription>
              Fill in the details to create a new admin account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={newAdminForm.full_name}
                onChange={(e) => setNewAdminForm({ ...newAdminForm, full_name: e.target.value })}
                placeholder="Full Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newAdminForm.username}
                onChange={(e) => setNewAdminForm({ ...newAdminForm, username: e.target.value })}
                placeholder="Username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin_id">Admin ID</Label>
              <Input
                id="admin_id"
                value={newAdminForm.admin_id}
                onChange={(e) => setNewAdminForm({ ...newAdminForm, admin_id: e.target.value })}
                placeholder="Admin ID"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newAdminForm.email}
                onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                placeholder="admin@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newAdminForm.password}
                onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <Input
                id="confirm_password"
                type="password"
                value={newAdminForm.confirm_password}
                onChange={(e) => setNewAdminForm({ ...newAdminForm, confirm_password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={creatingAdmin}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateAdmin}
              disabled={creatingAdmin}
            >
              {creatingAdmin ? "Creating..." : "Create Admin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the account for{" "}
              <span className="font-semibold">{userToDelete?.full_name}</span>{" "}
              ({userToDelete?.email}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
