import type { Metadata } from "next";
import { Suspense } from "react";
import { getSafeCustomerRedirect } from "@/server/validators/auth";
import { CustomerRegisterForm } from "./_components/register-form";

export const metadata: Metadata = {
  title: "Register | UAG",
  description: "Create a UAG customer account.",
};

interface CustomerRegisterPageProps {
  searchParams: Promise<{ next?: string | string[] }>;
}

export default function CustomerRegisterPage(props: CustomerRegisterPageProps) {
  return (
    <main className="bg-zinc-50 px-4 py-10 dark:bg-zinc-950 md:py-16">
      <Suspense fallback={<AuthShell />}>
        <CustomerRegisterContent {...props} />
      </Suspense>
    </main>
  );
}

async function CustomerRegisterContent({
  searchParams,
}: CustomerRegisterPageProps) {
  const search = await searchParams;
  const next = getSafeCustomerRedirect(
    typeof search.next === "string" ? search.next : undefined
  );

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.78fr)] md:items-stretch">
      <section className="hidden md:flex min-h-[560px] flex-col justify-between rounded-lg bg-zinc-950 p-6 text-white shadow-xl md:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Create Account
          </p>
          <h1 className="mt-5 max-w-xl text-4xl font-heading font-bold tracking-tight text-white md:text-5xl">
            Your UAG account keeps the useful stuff close.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-zinc-300">
            Register once with email and password. Supabase handles the secure
            account record, and the app keeps your auth session server-side.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            Email account
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            Customer profile
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            Account-ready cart
          </div>
        </div>
      </section>

      <CustomerRegisterForm initialState={{ next, message: null }} />
    </div>
  );
}

function AuthShell() {
  return (
    <div className="mx-auto h-[560px] w-full max-w-md rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950" />
  );
}
