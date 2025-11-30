"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Phone, User, Edit, User2 } from 'lucide-react'

export default function UserProfileCard() {
  const [mounted, setMounted] = useState(false)
  const [studentData, setStudentData] = useState({
    username: 'kramik',
    name: 'Mark Jeric Exconde',
    email: '0322-3614@lspu.edup.ph',
    phone: '09490508940',
    schoolId: '0322-3614',
    emergencyContact: '09347578322'
  })

  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState(studentData)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSave = () => {
    setStudentData(formData)
    setIsOpen(false)
  }

  const handleInputChange = (field: keyof typeof studentData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!mounted) {
    return (
      <Card className="w-full mx-auto">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback>EJ</AvatarFallback>
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
                src="https://images.unsplash.com/photo-1494790108755-2616c0763e6c?w=150&h=150&fit=crop&crop=face" 
                alt="Student Avatar" 
              />
              <AvatarFallback>{studentData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold">{studentData.name}</h3>
              <p className="text-sm text-muted-foreground">@{studentData.username}</p>
              <Badge variant="secondary" className="w-fit mt-1">
                {studentData.schoolId}
              </Badge>
            </div>
          </div>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Edit Profile</SheetTitle>
                <SheetDescription>
                  Update your personal information.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4 py-4 px-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="schoolId">School ID</Label>
                  <Input
                    id="schoolId"
                    value={formData.schoolId}
                    onChange={(e) => handleInputChange('schoolId', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4 px-4">
                <Button onClick={handleSave}>Save Changes</Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{studentData.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{studentData.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Emergency: {studentData.emergencyContact}</span>
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