"use client"

import { useState, useEffect } from "react"
import { LogOut, CircleUser, Bell, Settings } from "lucide-react"
import Link from "next/link"
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

const NavBar = () => {
  const [user, setUser] = useState({
    name: "Mark Jeric Exconde",
    email: "0322-3614@lspu.edu.ph",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616c0763e6c?w=150&h=150&fit=crop&crop=face"
  })

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event: CustomEvent) => {
      setUser(prevUser => ({
        ...prevUser,
        avatar: event.detail.avatar
      }))
    }

    window.addEventListener('profileUpdated' as any, handleProfileUpdate)
    
    return () => {
      window.removeEventListener('profileUpdated' as any, handleProfileUpdate)
    }
  }, [])
  
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
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
                <AnimatedThemeToggler />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => {
                const event = new CustomEvent('openProfileEdit')
                window.dispatchEvent(event)
              }}>
                <CircleUser />
                Profile
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild variant="destructive">
              <Link href="/login" className="flex items-center">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav> 
  )
}

export default NavBar