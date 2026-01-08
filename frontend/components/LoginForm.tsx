'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import Image from "next/image"
import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { authApi, tokenManager, UserRole } from "@/lib/api"
import { validateLoginForm } from "@/lib/validation"
import { Loader2, Eye, EyeOff } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    const validation = validateLoginForm({ email, password })
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0]
      setError(firstError)
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.login({ email, password })
      tokenManager.setToken(response.access_token)
      tokenManager.setRole(response.role)
      
      // Role-based redirect
      if (response.role === UserRole.STUDENT) {
        router.push('/student')
      } else if (response.role === UserRole.ADMIN || response.role === UserRole.SUPER_ADMIN) {
        router.push('/admin')
      } else {
        router.push('/student') // fallback
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">

          <div className="bg-muted relative hidden md:block">
            <Image
              src="/VitaLinkLogoCenter.png"
              width={500}
              height={500}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
            <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup className="py-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <Avatar className="size-20 mb-2 md:hidden">
                  <AvatarImage src="/VitaLinkLogoCircleTransparent.png" alt="VitaLink AI" />
                  <AvatarFallback>VL</AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your VitaLink AI account
                </p>
              </div>
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldDescription className="text-xs mt-1">
                  Forgot password? Contact admin for assistance.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Don&apos;t have an account? <Link href="/register" className="underline-offset-2 hover:underline">Sign up</Link>
              </FieldDescription>
              <FieldDescription className="text-center">
                Back to <Link href="/" className="underline-offset-2 hover:underline">Home</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        <span>IoT Health & Activity Dashboard for Students v1.0. © 2026 VitaLink AI. All rights reserved.</span>
      </FieldDescription>
    </div>
  )
}
