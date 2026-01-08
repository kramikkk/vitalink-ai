"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Phone, User, Edit, User2, Camera } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { authApi, tokenManager, UserProfile } from '@/lib/api'

interface Student {
  id: string
  name: string
  schoolId: string
  avatar: string
}

interface UserProfileCardProps {
  student?: Student
  studentProfile?: UserProfile
}

export default function UserProfileCard({ student, studentProfile }: UserProfileCardProps) {
  const { user, isLoading, refreshUser, updateUser } = useUser()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    student_id: '',
    phone: '',
    emergency_contact: '',
    avatar_url: '',
    password: ''
  })
  const [previewImage, setPreviewImage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSaving, setIsSaving] = useState(false)

  // If studentProfile is provided (admin viewing a student), use that
  // Otherwise if student prop is provided (legacy), transform it
  // Otherwise use logged-in user
  const displayUser = studentProfile ? studentProfile : student ? {
    full_name: student.name,
    username: student.name.toLowerCase().replace(/\s+/g, ''),
    student_id: student.schoolId,
    admin_id: null,
    email: 'N/A', // Student email not provided in Student type
    phone: null,
    emergency_contact: null,
    avatar_url: student.avatar
  } : user

  useEffect(() => {
    setMounted(true)
    
    // Listen for profile edit open event from NavBar
    // Only respond if this is the user's own profile (not viewing a student)
    const handleOpenProfileEdit = () => {
      if (!studentProfile && !student) {
        setIsOpen(true)
      }
    }
    
    window.addEventListener('openProfileEdit', handleOpenProfileEdit)
    
    return () => {
      window.removeEventListener('openProfileEdit', handleOpenProfileEdit)
    }
  }, [studentProfile, student])

  useEffect(() => {
    const profileToEdit = studentProfile || user
    if (profileToEdit) {
      const userRole = tokenManager.getRole()
      const isAdmin = userRole === 'admin' || userRole === 'super_admin'
      
      setFormData({
        full_name: profileToEdit.full_name || '',
        username: profileToEdit.username || '',
        email: profileToEdit.email || '',
        // Use admin_id for admins, student_id for students
        student_id: (!studentProfile && isAdmin) 
          ? (profileToEdit.admin_id || '') 
          : (profileToEdit.student_id || ''),
        phone: profileToEdit.phone || '',
        emergency_contact: profileToEdit.emergency_contact || '',
        avatar_url: profileToEdit.avatar_url || '',
        password: ''
      })
      setPreviewImage(profileToEdit.avatar_url || '')
    }
  }, [user, studentProfile])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const token = tokenManager.getToken()
      if (!token) return

      const userRole = tokenManager.getRole()
      const isAdmin = userRole === 'admin' || userRole === 'super_admin'

      // If editing a student profile, use their ID, otherwise update own profile
      const updateUrl = studentProfile 
        ? `http://localhost:8000/auth/users/${studentProfile.id}/update`
        : 'http://localhost:8000/auth/me/update'

      // Prepare data - only send fields that can be updated
      const updateData = (studentProfile || isAdmin) ? {
        // Admin can update all fields (for students or themselves)
        ...(formData.full_name && { full_name: formData.full_name }),
        ...(formData.username && { username: formData.username }),
        ...(formData.email && { email: formData.email }),
        // Send student_id for students, admin_id for admins editing themselves
        ...(formData.student_id && {
          [studentProfile ? 'student_id' : (isAdmin ? 'admin_id' : 'student_id')]: formData.student_id
        }),
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.emergency_contact && { emergency_contact: formData.emergency_contact }),
        ...(formData.avatar_url && { avatar_url: formData.avatar_url }),
        ...(formData.password && { password: formData.password })
      } : {
        // Regular student can only update limited fields
        phone: formData.phone,
        emergency_contact: formData.emergency_contact,
        avatar_url: formData.avatar_url
      }

      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        if (!studentProfile) {
          // Only refresh user context if editing own profile
          await refreshUser()
          
          // Dispatch custom event to notify NavBar
          const event = new CustomEvent('profileUpdated', { 
            detail: { 
              avatar: formData.avatar_url,
              name: user?.full_name,
              email: user?.email 
            } 
          })
          window.dispatchEvent(event)
        }
        setIsOpen(false)
        
        // Optionally reload the page to refresh student data
        if (studentProfile) {
          window.location.reload()
        }
      } else {
        const errorData = await response.json()
        alert(errorData.detail || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const img = new Image()
        img.onload = () => {
          // Create canvas for cropping
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (!ctx) return

          // Determine the size of the square (use the smaller dimension)
          const size = Math.min(img.width, img.height)

          // Set canvas to square dimensions
          canvas.width = size
          canvas.height = size

          // Calculate center crop coordinates
          const startX = (img.width - size) / 2
          const startY = (img.height - size) / 2

          // Draw the center-cropped square image
          ctx.drawImage(
            img,
            startX, startY, size, size,  // Source rectangle (center crop)
            0, 0, size, size              // Destination rectangle (full canvas)
          )

          // Convert canvas to data URL
          const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9)

          setPreviewImage(croppedImageUrl)
          setFormData(prev => ({
            ...prev,
            avatar_url: croppedImageUrl
          }))
        }
        img.src = reader.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  if (!mounted || isLoading || (!user && !student)) {
    return (
      <Card className="w-full mx-auto">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback>...</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-muted rounded animate-pulse mt-1"></div>
                <div className="h-5 w-20 bg-muted rounded animate-pulse mt-1"></div>
              </div>
            </div>
            <Button variant="outline" size="icon" disabled>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div className="h-4 w-36 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="h-4 w-40 bg-muted rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full mx-auto relative overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src={displayUser?.avatar_url || undefined}
                alt="Student Avatar"
                className="object-cover"
              />
              <AvatarFallback>{displayUser?.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold">{displayUser?.full_name}</h3>
              <p className="text-sm text-muted-foreground">@{displayUser?.username}</p>
              {(displayUser?.student_id || displayUser?.admin_id) && (
                <Badge variant="secondary" className="w-fit mt-1">
                  {displayUser?.student_id || displayUser?.admin_id}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Show edit button for own profile or when editing a student profile */}
          {(!student || studentProfile) && (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[400px] md:w-[540px] p-0 flex flex-col">
              <SheetHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 flex-shrink-0">
                <SheetTitle className='text-xl sm:text-2xl'>Edit Profile</SheetTitle>
                <SheetDescription className="text-sm">
                  Update your personal information.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-4 sm:px-6">
              <div className="grid gap-3 sm:gap-4">
                {/* Profile Photo Section */}
                <div className="grid gap-2">
                  <Label className="text-center">Profile Photo</Label>
                  <div className="flex flex-col items-center gap-3">
                    <div 
                      className="relative group cursor-pointer"
                      onClick={triggerFileInput}
                    >
                      <Avatar className="h-32 w-32 ring-2 ring-offset-2 ring-primary/20 transition-all group-hover:ring-primary/40">
                        <AvatarImage src={previewImage} alt="Preview" className="object-cover" />
                        <AvatarFallback className="text-2xl">
                          {(studentProfile || user)?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Click photo to change • JPG, PNG or GIF (max. 5MB)
                    </p>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    disabled={!studentProfile && tokenManager.getRole() !== 'admin' && tokenManager.getRole() !== 'super_admin'}
                    className={!studentProfile && tokenManager.getRole() !== 'admin' && tokenManager.getRole() !== 'super_admin' ? "bg-muted" : ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    disabled={!studentProfile && tokenManager.getRole() !== 'admin' && tokenManager.getRole() !== 'super_admin'}
                    className={!studentProfile && tokenManager.getRole() !== 'admin' && tokenManager.getRole() !== 'super_admin' ? "bg-muted" : ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!studentProfile && tokenManager.getRole() !== 'admin' && tokenManager.getRole() !== 'super_admin'}
                    className={!studentProfile && tokenManager.getRole() !== 'admin' && tokenManager.getRole() !== 'super_admin' ? "bg-muted" : ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="schoolId">
                    {studentProfile ? 'Student ID' : 
                     (tokenManager.getRole() === 'admin' || tokenManager.getRole() === 'super_admin') ? 'Admin ID' : 'Student ID'}
                  </Label>
                  <Input
                    id="schoolId"
                    value={formData.student_id}
                    onChange={(e) => handleInputChange('student_id', e.target.value)}
                    disabled={!studentProfile && tokenManager.getRole() !== 'admin' && tokenManager.getRole() !== 'super_admin'}
                    className={!studentProfile && tokenManager.getRole() !== 'admin' && tokenManager.getRole() !== 'super_admin' ? "bg-muted" : ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergency_contact}
                    onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                    placeholder="Enter emergency contact"
                  />
                </div>
                {(studentProfile || tokenManager.getRole() === 'admin' || tokenManager.getRole() === 'super_admin') && (
                  <div className="grid gap-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Leave blank to keep current password"
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters long
                    </p>
                  </div>
                )}
              </div>
              </div>
              <div className="border-t px-6 py-4 flex-shrink-0">
                <p className="text-xs text-muted-foreground text-center mb-4">
                  Need to change other details? Contact your teacher for assistance.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{displayUser?.email || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{displayUser?.phone || 'Not provided'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Emergency: {displayUser?.emergency_contact || 'Not provided'}</span>
        </div>
      </CardContent>
      
      <div className="absolute bottom-0 right-0 pointer-events-none">
        <User2
          className="size-120 text-green-300 opacity-30 translate-x-1/3 translate-y-1/3"
          strokeWidth={1}
        />
      </div>
    </Card>
  )
}