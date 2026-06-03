"use client";

import { useActionState } from "react";
import { LockKeyhole, LogIn } from "lucide-react";
import { signInAdminAction, type AdminLoginState } from "@/server/auth/actions";
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

interface AdminLoginFormProps {
  initialState: AdminLoginState;
}

export function AdminLoginForm({ initialState }: AdminLoginFormProps) {
  const [state, action, pending] = useActionState(
    signInAdminAction,
    initialState
  );

  return (
    <Card className="w-full max-w-md border-zinc-200 shadow-xl dark:border-zinc-800">
      <CardHeader className="space-y-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <CardTitle className="text-2xl font-heading">Admin Login</CardTitle>
          <CardDescription>
            Sign in with an admin account to manage the storefront.
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
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                required
              />
              <FieldError>{state.fieldErrors?.email?.[0] ?? null}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                minLength={8}
                required
              />
              <FieldDescription>
                Admin access is verified on the server after login.
              </FieldDescription>
              <FieldError>
                {state.fieldErrors?.password?.[0] ?? null}
              </FieldError>
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={pending}>
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {pending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
