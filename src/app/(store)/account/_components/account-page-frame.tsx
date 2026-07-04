"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { signOutCustomerAction } from "@/server/auth/actions";

export type AccountNavKey =
  "dashboard"
  | "orders"
  | "downloads"
  | "addresses"
  | "profile";

const accountLinks: Array<{
  key: AccountNavKey;
  label: string;
  href: string;
}> = [
  { key: "dashboard", label: "Dashboard", href: "/account" },
  { key: "orders", label: "Orders", href: "/account/orders" },
  { key: "addresses", label: "Addresses", href: "/account/addresses" },
  { key: "profile", label: "Account details", href: "/account/profile" },
];

export function AccountPageFrame({
  active,
  children,
}: {
  active: AccountNavKey;
  children: ReactNode;
}) {
  return (
    <div className="bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <AccountHero />

      <section className="mx-auto flex w-full max-w-[1520px] gap-10 px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="hidden lg:block lg:w-[310px] lg:shrink-0">
          <div className="sticky top-6">
            <AccountSidebar active={active} />
          </div>
        </div>
        <div className="min-w-0 flex-1 lg:border-l lg:border-zinc-200 lg:pl-10 dark:lg:border-zinc-800 lg:overflow-y-auto lg:max-h-[calc(100vh-48px)]">
          {children}
        </div>
      </section>
    </div>
  );
}

export function AccountPageFrameShell() {
  return (
    <div className="bg-white dark:bg-zinc-950">
      <div className="h-[220px] bg-zinc-950" />
      <section className="mx-auto flex w-full max-w-[1520px] gap-10 px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="hidden lg:block lg:w-[310px] lg:shrink-0">
          <div className="h-[520px] rounded-[8px] bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="min-w-0 flex-1 lg:border-l lg:border-zinc-200 lg:pl-10 dark:lg:border-zinc-800">
          <div className="h-[520px] rounded-[8px] bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </section>
    </div>
  );
}

function AccountHero() {
  return (
    <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
      <div
        className="absolute inset-0 -z-10 opacity-45"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.72))]" />
      <div className="mx-auto flex min-h-[220px] w-full max-w-[1520px] flex-col items-center justify-center px-5 py-10 text-center">
        <h1 className="font-sans text-6xl font-semibold leading-none tracking-normal sm:text-7xl lg:text-[88px]">
          My account
        </h1>
        <div className="mt-8 flex items-center gap-4 text-sm font-semibold text-zinc-300">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <span className="text-white" aria-hidden="true">
            /
          </span>
          <span className="text-white">My account</span>
        </div>
      </div>
    </section>
  );
}

function AccountSidebar({ active }: { active: AccountNavKey }) {
  return (
    <aside>
      <h2 className="font-sans text-2xl font-semibold uppercase tracking-normal text-zinc-950 dark:text-zinc-100">
        My Account
      </h2>
      <div className="mt-5 h-px w-full bg-zinc-200 dark:bg-zinc-800" />
      <nav className="mt-5 space-y-3" aria-label="Account navigation">
        {accountLinks.map((item) => {
          const isActive = item.key === active;

          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "block rounded-[8px] bg-zinc-100 px-5 py-4 text-base font-bold text-zinc-950 dark:bg-zinc-900 dark:text-white"
                  : "block rounded-[8px] px-5 py-3 text-base font-bold text-zinc-950 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
              }
            >
              {item.label}
            </Link>
          );
        })}
        <form action={signOutCustomerAction}>
          <button
            type="submit"
            className="block w-full rounded-[8px] px-5 py-3 text-left text-base font-bold text-red-600 transition-colors hover:bg-zinc-100 dark:text-red-400 dark:hover:bg-zinc-900"
          >
            Logout
          </button>
        </form>
      </nav>
    </aside>
  );
}
