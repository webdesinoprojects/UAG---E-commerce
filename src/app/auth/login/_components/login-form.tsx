"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LogIn, Mail } from "lucide-react";
import {
  signInCustomerAction,
  type CustomerAuthState,
} from "@/server/auth/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface CustomerLoginFormProps {
  initialState: CustomerAuthState;
}

export function CustomerLoginForm({ initialState }: CustomerLoginFormProps) {
  const [state, action, pending] = useActionState(
    signInCustomerAction,
    initialState
  );

  return (
    <Card className="border-white shadow-xl dark:border dark:border-white dark:bg-black dark:text-white">
      <CardHeader className="space-y-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
          <Mail className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <CardTitle className="text-2xl font-heading dark:text-white">Customer Login</CardTitle>
          <CardDescription className="dark:text-white/80">
            Use your email and password to access your UAG account.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-3">
          <input type="hidden" name="next" value={state.next} />
          <Button
            type="button"
            variant="outline"
            className="h-13 w-full border-[#1a73e8] bg-white text-base font-semibold text-[#1a73e8] hover:bg-[#f8fbff] hover:text-[#1557b0] dark:border-[#8ab4f8] dark:bg-white dark:text-[#1a73e8] dark:hover:bg-[#f8fbff]"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285f4"
                d="M23.52 12.27c0-.82-.07-1.6-.2-2.35H12v4.45h6.47a5.53 5.53 0 0 1-2.4 3.63v2.96h3.88c2.27-2.08 3.57-5.15 3.57-8.69Z"
              />
              <path
                fill="#34a853"
                d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.88-2.96c-1.07.72-2.45 1.15-4.05 1.15-3.12 0-5.77-2.1-6.72-4.94H1.29v3.05A11.98 11.98 0 0 0 12 24Z"
              />
              <path
                fill="#fbbc05"
                d="M5.28 14.34a7.2 7.2 0 0 1 0-4.68V6.61H1.29a12 12 0 0 0 0 10.78l3.99-3.05Z"
              />
              <path
                fill="#ea4335"
                d="M12 4.72c1.76 0 3.34.6 4.58 1.79l3.44-3.43C17.94 1.14 15.23 0 12 0A11.98 11.98 0 0 0 1.29 6.61l3.99 3.05C6.23 6.82 8.88 4.72 12 4.72Z"
              />
            </svg>
            Login with Google
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground dark:text-white">
          <div className="h-px flex-1 bg-border dark:bg-white/20" />
          <span>or</span>
          <div className="h-px flex-1 bg-border dark:bg-white/20" />
        </div>

        <form action={action} className="space-y-5">
          <input type="hidden" name="next" value={state.next} />

          {state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email" className="dark:text-white">
                Email
              </FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="dark:border-white/30 dark:bg-black dark:text-white dark:placeholder:text-white/45 dark:focus-visible:border-white dark:focus-visible:ring-white/20"
                required
              />
              <FieldError>{state.fieldErrors?.email?.[0] ?? null}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="password" className="dark:text-white">
                Password
              </FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                minLength={8}
                className="dark:border-white/30 dark:bg-black dark:text-white dark:placeholder:text-white/45 dark:focus-visible:border-white dark:focus-visible:ring-white/20"
                required
              />
              <FieldDescription className="dark:text-white/80">
                Your session is stored in HttpOnly cookies.
              </FieldDescription>
              <FieldError>
                {state.fieldErrors?.password?.[0] ?? null}
              </FieldError>
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            className="w-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            disabled={pending}
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {pending ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-center text-sm text-muted-foreground dark:text-white/80">
            New to UAG?{" "}
            <Link
              href={`/auth/register?next=${encodeURIComponent(state.next)}`}
              className="font-medium text-foreground underline-offset-4 hover:underline dark:text-white"
            >
              Create an account
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
