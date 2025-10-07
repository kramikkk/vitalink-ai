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
import Link from "next/link"
import { Avatar, AvatarImage} from "./ui/avatar"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">

          <div className="bg-muted relative hidden md:block">
            <img
              src="/VitaLinkAILogo.png"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
                    <form className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="pb-2">
                    <Avatar className="size-20">
                        <AvatarImage src="/VitaLinkAILogo.png" alt="VitaLink AI" />
                    </Avatar>
                </div>
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your VitaLink AI account
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
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
                <Input id="password" type="password" placeholder="Enter your password" required />
              </Field>
              <Field>
                <Button type="submit">Login</Button>
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
