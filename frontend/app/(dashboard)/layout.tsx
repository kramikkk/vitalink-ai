'use client'

import { AppSidebar } from "@/components/AppSidebar";
import NavBar from "@/components/NavBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useRequireAuth } from "@/hooks/use-auth";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isAuthenticated, isLoading } = useRequireAuth()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, useRequireAuth will redirect to login
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 w-full">
        <NavBar />
        <div className="px-4">{children}</div>
      </main>
    </div>
  );
}
