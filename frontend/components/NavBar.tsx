import { LogOut, Settings, User } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "./ModeToggle"
import { SidebarTrigger } from "./ui/sidebar"

const NavBar = () => {
  return (
    <nav className="p-4 flex items-center justify-between">
      {/* LEFT SIDE */}
        <div className="flex items-center gap-4">
            <SidebarTrigger />
        <div className="w-px h-6 bg-border" />
        <Link href="/" className="font-bold">
          IoT Health & Activity Dashboard
        </Link>
      </div>
        {/*RIGHT SIDE*/}
        <div className="flex items-center gap-4">
            <ModeToggle />
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={10}>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem> 
                        <User className="h-[1.2rem] w-[1.2rem] mr-2"/> 
                        Profile
                        </DropdownMenuItem>
                    <DropdownMenuItem> 
                        <Settings className="h-[1.2rem] w-[1.2rem] mr-2"/> 
                        Settings
                        </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive"> 
                        <LogOut className="h-[1.2rem] w-[1.2rem] mr-2"/> 
                        <Link href="/login">Logout</Link>
                        </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
        </div>
    </nav> 
  )
}

export default NavBar