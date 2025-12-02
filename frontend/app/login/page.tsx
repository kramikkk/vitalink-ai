'use client'

import DarkVeil from "@/components/DarkVeil"
import { LoginForm } from "@/components/LoginForm"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="absolute inset-0 z-[-1] h-full w-full">
        <DarkVeil 
          hueShift={57}
        />
      </div>
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}