import { Calendar, Heart, Home, Settings, TrendingUp } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { NavUser } from "./NavUser"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
  {
    title: "Dashboard",
    url: "#",
    icon: Home,
  },
  {
    title: "My Vitals",
    url: "#",
    icon: Heart,
  },
  {
    title: "History",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Alerts",
    url: "#",
    icon: TrendingUp,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
  ],
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="offcanvas">
        <SidebarHeader className="py-4">
            <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/">
                    <Image src="/globe.svg" alt="Logo" width={20} height={20} />
                    <span className=" text-base font-bold">VitaLink AI</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                    <SidebarMenu>
                        {data.navMain.map((item) => {
                        const Icon = item.icon;
                        return (
                            <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <a href={item.url} className="flex items-center gap-2">
                                <Icon className="w-5 h-5" />
                                <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                        })}
                    </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        <SidebarFooter>
            <NavUser user={data.user} />
        </SidebarFooter>
    </Sidebar>
  )
}