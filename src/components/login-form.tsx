import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { GoogleLoginButton } from "@/components/google-login-button"
import { PasswordInput } from "@/components/password-input"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Login to your account
          </h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Button
              variant="link"
              type="button"
              className="ml-auto h-auto px-0 text-sm"
            >
              Forgot your password?
            </Button>
          </div>
          <PasswordInput id="password" required />
        </Field>
        <Field>
          <Button type="submit" size="lg">
            Login
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <GoogleLoginButton />
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Button
              variant="link"
              type="button"
              className="inline h-auto px-0 py-0 text-sm"
            >
              Sign up
            </Button>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
