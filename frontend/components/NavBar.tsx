"use client"

import { useState, useEffect } from "react"
import { LogOut, CircleUser, Bell, Settings, Users, Radio, Smartphone } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "./ModeToggle"
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler"
import { tokenManager, UserRole } from "@/lib/api"
import { useUser } from "@/contexts/UserContext"
import { UserManagementDialog } from "./UserManagementDialog"
import { PairDeviceDialog } from "./PairDeviceDialog"
import { DeviceManagementDialog } from "./DeviceManagementDialog"

const NavBar = () => {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState('')
  const [userManagementOpen, setUserManagementOpen] = useState(false)
  const [pairDeviceOpen, setPairDeviceOpen] = useState(false)
  const [deviceManagementOpen, setDeviceManagementOpen] = useState(false)

  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarUrl(user.avatar_url)
    }
  }, [user])

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      if (event.detail.avatar) {
        setAvatarUrl(event.detail.avatar)
      }
    }

    window.addEventListener('profileUpdated' as any, handleProfileUpdate)
    
    return () => {
      window.removeEventListener('profileUpdated' as any, handleProfileUpdate)
    }
  }, [])

  const handleLogout = () => {
    tokenManager.logout()
  }

  const handleProfileClick = () => {
    const event = new CustomEvent('openProfileEdit')
    window.dispatchEvent(event)
  }

  const isAdminOrSuperAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN
  const isStudent = user?.role === UserRole.STUDENT

  if (isLoading || !user) {
    return (
      <nav className="p-4 flex items-center justify-between relative">
        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8">
            <AvatarFallback>VL</AvatarFallback>
          </Avatar>
          <div className="w-px h-6 bg-border" />
          <div className="font-bold text-xl absolute left-1/2 -translate-x-1/2">
            VitaLink AI
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 animate-pulse bg-muted" />
        </div>
      </nav>
    )
  }
  
  return (
    <nav className="p-4 flex items-center justify-between relative">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/VitaLinkLogoCircleTransparent.png" alt="VitaLink Logo" />
          <AvatarFallback>VL</AvatarFallback>
        </Avatar>
        <div className="w-px h-6 bg-border" />
        <Link href="#" className="font-bold text-xl absolute left-1/2 -translate-x-1/2">
          VitaLink AI
        </Link>
      </div>
      
      {/*RIGHT SIDE*/}
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback>{user.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-full p-2 rounded-lg"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatarUrl || undefined} alt={user.full_name} />
                  <AvatarFallback className="rounded-lg">
                    {user.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.full_name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
                <AnimatedThemeToggler />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleProfileClick}>
                <CircleUser />
                Profile
              </DropdownMenuItem>
              {isStudent && (
                <DropdownMenuItem onClick={() => setPairDeviceOpen(true)}>
                  <Radio />
                  Pair Device
                </DropdownMenuItem>
              )}
              {isAdminOrSuperAdmin && (
                <>
                  <DropdownMenuItem onClick={() => setUserManagementOpen(true)}>
                    <Users />
                    User Management
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDeviceManagementOpen(true)}>
                    <Smartphone />
                    Device Management
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* User Management Dialog */}
      <UserManagementDialog
        open={userManagementOpen}
        onOpenChange={setUserManagementOpen}
      />

      {/* Pair Device Dialog */}
      <PairDeviceDialog
        open={pairDeviceOpen}
        onOpenChange={setPairDeviceOpen}
      />

      {/* Device Management Dialog */}
      <DeviceManagementDialog
        open={deviceManagementOpen}
        onOpenChange={setDeviceManagementOpen}
      />
    </nav> 
  )
}

export default NavBar