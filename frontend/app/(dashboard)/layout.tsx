import { AppSidebar } from "@/components/AppSidebar";
import NavBar from "@/components/NavBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  return (
    <div className="flex min-h-screen">
      <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <main className="flex-1 w-full">
        <NavBar />
        <div className="px-4">{children}</div>
      </main>
      </SidebarProvider>
    </div>
  );
}
