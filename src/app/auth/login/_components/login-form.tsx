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
