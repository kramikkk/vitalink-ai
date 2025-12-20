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
import { Loader2 } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
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
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  disabled={isLoading}
                />
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
        <span>IoT Health & Activity Dashboard for Students v1.0. © 2025 VitaLink AI. All rights reserved.</span>
      </FieldDescription>
    </div>
  )
}
