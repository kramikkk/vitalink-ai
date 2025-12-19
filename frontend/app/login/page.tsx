'use client'

import DarkVeil from "@/components/DarkVeil"
import { LoginForm } from "@/components/LoginForm"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { useRedirectIfAuthenticated } from "@/hooks/use-auth"

export default function LoginPage() {
  const { isChecking } = useRedirectIfAuthenticated('/student')

  // Show nothing while checking authentication
  if (isChecking) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="absolute inset-0 z-[-1] h-full w-full">
        <DarkVeil 
          hueShift={57}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-full w-full bg-gradient-to-b from-transparent to-background"></div>
      <div className="w-full max-w-sm md:max-w-4xl relative z-10">
        <AnimatedThemeToggler className="absolute top-4 right-4 z-20 p-2 rounded-md hover:bg-accent" />
        <LoginForm />
      </div>
    </div>
  )
}