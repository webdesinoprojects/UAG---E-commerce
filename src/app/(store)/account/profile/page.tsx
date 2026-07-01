import type { Metadata } from "next";
import { Suspense } from "react";
import { Mail, UserRound } from "lucide-react";
import { requireCustomer } from "@/server/auth/customer";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AccountPageFrame,
  AccountPageFrameShell,
} from "@/app/(store)/account/_components/account-page-frame";

export const metadata: Metadata = {
  title: "Account Details | UAG",
  description: "View and edit your UAG account details.",
};

export default function AccountProfilePage() {
  return (
    <Suspense fallback={<AccountPageFrameShell />}>
      <AccountProfileContent />
    </Suspense>
  );
}

async function AccountProfileContent() {
  const customer = await requireCustomer();

  return (
    <AccountPageFrame active="profile">
        <div className="max-w-3xl space-y-6">
          <div>
            <h2 className="font-sans text-3xl font-bold text-zinc-950 dark:text-zinc-100">
              Account details
            </h2>
            <p className="mt-3 text-base leading-7 text-zinc-500 dark:text-zinc-400">
              Your personal account details.
            </p>
          </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserRound className="h-5 w-5" aria-hidden="true" />
              Profile Information
            </CardTitle>
            <CardDescription>Your personal account details.</CardDescription>
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
      </div>
    </AccountPageFrame>
  );
}
