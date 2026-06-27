import type { Metadata } from "next";
import { Suspense } from "react";
import { Mail, ShieldCheck, UserRound } from "lucide-react";
import { signOutCustomerAction } from "@/server/auth/actions";
import { requireCustomer } from "@/server/auth/customer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "My Account | UAG",
  description: "View your UAG customer account.",
};

export default async function AccountPage() {
  return (
    <main className="bg-zinc-50 px-4 py-10 dark:bg-zinc-950 md:py-16">
      <Suspense fallback={<AccountShell />}>
        <AccountContent />
      </Suspense>
    </main>
  );
}

async function AccountContent() {
  const customer = await requireCustomer();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 rounded-lg bg-zinc-950 p-6 text-white shadow-xl md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
            My Account
          </p>
          <h1 className="mt-3 text-3xl font-heading font-bold tracking-tight md:text-4xl">
            Welcome{customer.displayName ? `, ${customer.displayName}` : ""}.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-300">
            Your customer session is active. Order history, addresses, and
            checkout preferences can be connected here as those modules land.
          </p>
        </div>

        <form action={signOutCustomerAction}>
          <Button type="submit" variant="outline" className="bg-white text-zinc-950">
            Sign Out
          </Button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserRound className="h-5 w-5" aria-hidden="true" />
              Profile
            </CardTitle>
            <CardDescription>
              Basic account details from your secure customer profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Name
              </p>
              <p className="mt-2 font-medium">
                {customer.displayName ?? "Not set"}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Role
              </p>
              <div className="mt-2">
                <Badge variant="secondary">{customer.role}</Badge>
              </div>
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:col-span-2">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                Email
              </p>
              <p className="mt-2 font-medium">{customer.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              Security
            </CardTitle>
            <CardDescription>
              Session cookies are HttpOnly and scoped to this site.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Customer auth is separate from admin auth, so shopper sessions do
            not grant admin access.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AccountShell() {
  return (
    <div className="mx-auto h-[520px] w-full max-w-5xl rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950" />
  );
}
