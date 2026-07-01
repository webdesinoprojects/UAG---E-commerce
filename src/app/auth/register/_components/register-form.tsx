"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle2, UserPlus } from "lucide-react";
import {
  registerCustomerAction,
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

interface CustomerRegisterFormProps {
  initialState: CustomerAuthState;
}

export function CustomerRegisterForm({
  initialState,
}: CustomerRegisterFormProps) {
  const [state, action, pending] = useActionState(
    registerCustomerAction,
    initialState
  );

  return (
    <Card className="border-zinc-200 shadow-xl dark:border-zinc-800">
      <CardHeader className="space-y-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
          <UserPlus className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <CardTitle className="text-2xl font-heading">
            Create Customer Account
          </CardTitle>
          <CardDescription>
            Register with your name, email, and a secure password.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-5">
          <input type="hidden" name="next" value={state.next} />

          {state.successMessage ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <AlertDescription>{state.successMessage}</AlertDescription>
            </Alert>
          ) : null}

          {state.message ? (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                required
              />
              <FieldError>{state.fieldErrors?.name?.[0] ?? null}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
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
                autoComplete="new-password"
                minLength={8}
                required
              />
              <FieldDescription>
                Use at least 8 characters with a letter and number.
              </FieldDescription>
              <FieldError>
                {state.fieldErrors?.password?.[0] ?? null}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <FieldError>
                {state.fieldErrors?.confirmPassword?.[0] ?? null}
              </FieldError>
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full bg-black" disabled={pending}>
            <UserPlus className="h-4 w-4 bg-black text-white " aria-hidden="true" />
            {pending ? "Creating account..." : "Create Account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link
              href={`/auth/login?next=${encodeURIComponent(state.next)}`}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
