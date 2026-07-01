import type { Metadata } from "next";
import { Suspense } from "react";
import { getSafeCustomerRedirect } from "@/server/validators/auth";
import { CustomerLoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Login | UAG",
  description: "Sign in to your UAG customer account.",
};

interface CustomerLoginPageProps {
  searchParams: Promise<{ next?: string | string[] }>;
}

export default function CustomerLoginPage(props: CustomerLoginPageProps) {
  return (
    <main className="bg-zinc-50 px-4 py-10 dark:bg-zinc-950 md:py-16">
      <Suspense fallback={<AuthShell />}>
        <CustomerLoginContent {...props} />
      </Suspense>
    </main>
  );
}

async function CustomerLoginContent({ searchParams }: CustomerLoginPageProps) {
  const search = await searchParams;
  const next = getSafeCustomerRedirect(
    typeof search.next === "string" ? search.next : undefined
  );

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.78fr)] md:items-stretch">
      <section className="hidden md:flex min-h-[520px] flex-col justify-between rounded-lg bg-zinc-950 p-6 text-white shadow-xl md:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
            UAG Account
          </p>
          <h1 className="mt-5 max-w-xl text-4xl font-heading font-bold tracking-tight md:text-5xl">
            Pick up where your gear journey left off.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-zinc-300">
            Sign in to track orders, manage saved details, and keep your next
            tech upgrade moving without friction.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-zinc-300 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            Order tracking
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            Faster checkout
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            Secure session
          </div>
        </div>
      </section>

      <CustomerLoginForm initialState={{ next, message: null }} />
    </div>
  );
}

function AuthShell() {
  return (
    <div className="mx-auto h-[520px] w-full max-w-md rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950" />
  );
}
