import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import Image from "next/image"

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
        <form className="p-6 md:p-8">
            <FieldGroup className="gap-4 py-2">
              <div className="flex flex-col items-center gap-2 text-center">
                <Avatar className="size-20 mb-2 md:hidden">
                  <AvatarImage src="/VitaLinkLogoCircleTransparent.png" alt="VitaLink AI" />
                  <AvatarFallback>VL</AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold">Register</h1>
                <p className="text-muted-foreground text-balance">
                  Create your VitaLink AI account
                </p>
              </div>
              <Field className="gap-1.5">
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  required
                />
              </Field>
              <Field className="gap-1.5">
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  required
                />
              </Field>
              <Field className="gap-1.5">
                <FieldLabel htmlFor="student-id">Student ID</FieldLabel>
                <Input
                  id="student-id"
                  type="number"
                  placeholder="Enter your student ID"
                  required
                />
              </Field>
              <Field className="gap-1.5">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                />
              </Field>
              <Field className="gap-1.5">
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input id="password" type="password" placeholder="Enter your password" required />
              </Field>
              <Field className="gap-1.5">
                <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  required
                />
              </Field>
              <Button type="submit" className="w-full mt-2">Sign Up</Button>
              <div className="flex flex-col gap-2 mt-2">
                <FieldDescription className="text-center">
                  Already have an account? <Link href="/login" className="underline-offset-2 hover:underline">Log in</Link>
                </FieldDescription>
                <FieldDescription className="text-center">
                  Back to <Link href="/" className="underline-offset-2 hover:underline">Home</Link>
                </FieldDescription>
              </div>
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
