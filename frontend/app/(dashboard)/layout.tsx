import { AppSidebar } from "@/components/AppSidebar";
import NavBar from "@/components/NavBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 w-full">
        <NavBar />
        <div className="px-4">{children}</div>
      </main>
    </div>
  );
}
