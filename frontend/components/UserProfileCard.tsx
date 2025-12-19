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
import { authApi, tokenManager } from '@/lib/api'

interface Student {
  id: string
  name: string
  schoolId: string
  avatar: string
}

interface UserProfileCardProps {
  student?: Student
}

export default function UserProfileCard({ student }: UserProfileCardProps) {
  const { user, isLoading, refreshUser, updateUser } = useUser()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    emergency_contact: '',
    avatar_url: ''
  })
  const [previewImage, setPreviewImage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Listen for profile edit open event from NavBar
    const handleOpenProfileEdit = () => {
      setIsOpen(true)
    }
    
    window.addEventListener('openProfileEdit', handleOpenProfileEdit)
    
    return () => {
      window.removeEventListener('openProfileEdit', handleOpenProfileEdit)
    }
  }, [])

  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || '',
        emergency_contact: user.emergency_contact || '',
        avatar_url: user.avatar_url || ''
      })
      setPreviewImage(user.avatar_url || '')
    }
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const token = tokenManager.getToken()
      if (!token) return

      const response = await fetch('http://localhost:8000/auth/me/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await refreshUser()
        setIsOpen(false)
        
        // Dispatch custom event to notify NavBar
        const event = new CustomEvent('profileUpdated', { 
          detail: { 
            avatar: formData.avatar_url,
            name: user?.full_name,
            email: user?.email 
          } 
        })
        window.dispatchEvent(event)
      } else {
        console.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
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
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageUrl = reader.result as string
        setPreviewImage(imageUrl)
        setFormData(prev => ({
          ...prev,
          avatar_url: imageUrl
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  if (!mounted || isLoading || !user) {
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
                src={user.avatar_url || undefined}
                alt="Student Avatar" 
              />
              <AvatarFallback>{user.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold">{user.full_name}</h3>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              <Badge variant="secondary" className="w-fit mt-1">
                {user.student_id}
              </Badge>
            </div>
          </div>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] p-4">
              <SheetHeader>
                <SheetTitle className='text-2xl'>Edit Profile</SheetTitle>
                <SheetDescription>
                  Update your personal information.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 px-4">
                {/* Profile Photo Section */}
                <div className="grid gap-2">
                  <Label className="text-center">Profile Photo</Label>
                  <div className="flex flex-col items-center gap-3">
                    <div 
                      className="relative group cursor-pointer"
                      onClick={triggerFileInput}
                    >
                      <Avatar className="h-32 w-32 ring-2 ring-offset-2 ring-primary/20 transition-all group-hover:ring-primary/40">
                        <AvatarImage src={previewImage} alt="Preview" />
                        <AvatarFallback className="text-2xl">
                          {user.full_name.split(' ').map(n => n[0]).join('')}
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
                    value={user.full_name}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={user.username}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-muted"
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
                  <Label htmlFor="schoolId">School ID</Label>
                  <Input
                    id="schoolId"
                    value={user.student_id}
                    disabled
                    className="bg-muted"
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
              </div>
              <div className="px-4">
                <p className="text-xs text-muted-foreground text-center mb-3">
                  Need to change other details? Contact your teacher for assistance.
                </p>
              </div>
              <div className="flex gap-2 pt-2 px-4">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{user.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{user.phone || 'Not provided'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Emergency: {user.emergency_contact || 'Not provided'}</span>
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