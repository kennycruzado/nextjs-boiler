"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { GoogleLoginButton } from "@/components/google-login-button"
import { PasswordInput } from "@/components/password-input"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsPending(true)

    try {
      if (mode === "signup") {
        const { error: signUpError } = await authClient.signUp.email({
          name,
          email,
          password,
        })
        if (signUpError) {
          setError(signUpError.message ?? "Unable to create account")
          return
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        })
        if (signInError) {
          setError(signInError.message ?? "Invalid email or password")
          return
        }
      }

      router.push("/app")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            {mode === "login" ? "Login to your account" : "Create an account"}
          </h1>
          <p className="text-sm text-balance text-muted-foreground">
            {mode === "login"
              ? "Enter your email below to login to your account"
              : "Enter your details below to get started"}
          </p>
        </div>
        {mode === "signup" ? (
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Jane Doe"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
        ) : null}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput
            id="password"
            name="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        {error ? <FieldError>{error}</FieldError> : null}
        <Field>
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending
              ? mode === "login"
                ? "Signing in…"
                : "Creating account…"
              : mode === "login"
                ? "Login"
                : "Sign up"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <GoogleLoginButton />
          <FieldDescription className="text-center">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <Button
                  variant="link"
                  type="button"
                  className="inline h-auto px-0 py-0 text-sm"
                  onClick={() => {
                    setMode("signup")
                    setError(null)
                  }}
                >
                  Sign up
                </Button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Button
                  variant="link"
                  type="button"
                  className="inline h-auto px-0 py-0 text-sm"
                  onClick={() => {
                    setMode("login")
                    setError(null)
                  }}
                >
                  Login
                </Button>
              </>
            )}
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
