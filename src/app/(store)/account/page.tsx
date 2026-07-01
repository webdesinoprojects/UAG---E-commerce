import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  CircleAlert,
  ClipboardList,
  LogOut,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { signOutCustomerAction } from "@/server/auth/actions";
import { requireCustomer } from "@/server/auth/customer";
import {
  AccountPageFrame,
  AccountPageFrameShell,
} from "@/app/(store)/account/_components/account-page-frame";

export const metadata: Metadata = {
  title: "My Account | UAG",
  description: "View your UAG customer account.",
};

const dashboardTiles = [
  { label: "Orders", href: "/account/orders", icon: ClipboardList },
  { label: "Account details", href: "/account/profile", icon: UserCircle },
];

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountPageFrameShell />}>
      <AccountContent />
    </Suspense>
  );
}

async function AccountContent() {
  const customer = await requireCustomer();
  const customerName = customer.displayName ?? customer.email.split("@")[0];

  return (
    <AccountPageFrame active="dashboard">
      <div className="space-y-7">
        <div className="flex items-start gap-5 rounded-[8px] bg-[#e2b349] px-7 py-6 text-white shadow-sm">
          <CircleAlert
            className="mt-0.5 size-6 shrink-0"
            strokeWidth={2}
            aria-hidden="true"
          />
          <p className="text-[15px] font-semibold leading-7 sm:text-base">
            Your account with UAG URBN ARMOUR GEAR is using a temporary
            password. We emailed you a link to change your password.
          </p>
        </div>

        <div className="space-y-6 text-[15px] leading-8 text-zinc-500 sm:text-base dark:text-zinc-400">
          <p>
            Welcome,{" "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">{customerName}</span>.
          </p>
          <p>
            From your account dashboard you can view your{" "}
            <Link
              href="/account/orders"
              className="font-semibold text-zinc-800 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              recent orders
            </Link>
            , and edit your password and{" "}
            <Link
              href="/account/profile"
              className="font-semibold text-zinc-800 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-100"
            >
              account details
            </Link>
            .
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {dashboardTiles.map((tile) => (
            <AccountTile key={tile.label} {...tile} />
          ))}
          <LogoutTile />
        </div>
      </div>
    </AccountPageFrame>
  );
}

function AccountTile({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[172px] flex-col items-center justify-center rounded-[8px] border border-zinc-200 bg-white px-6 py-7 text-center shadow-[0_1px_10px_rgba(0,0,0,0.10)] transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_8px_22px_rgba(0,0,0,0.12)] dark:border-zinc-800 dark:bg-zinc-900"
    >
      <Icon
        className="size-16 text-zinc-300 transition-colors group-hover:text-zinc-400 dark:text-zinc-600 dark:group-hover:text-zinc-500"
        strokeWidth={1.4}
        aria-hidden="true"
      />
      <span className="mt-4 text-lg font-bold text-zinc-950 dark:text-zinc-100">{label}</span>
    </Link>
  );
}

function LogoutTile() {
  return (
    <form action={signOutCustomerAction} className="contents">
      <button
        type="submit"
        className="group flex min-h-[172px] flex-col items-center justify-center rounded-[8px] border border-zinc-200 bg-white px-6 py-7 text-center shadow-[0_1px_10px_rgba(0,0,0,0.10)] transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_8px_22px_rgba(0,0,0,0.12)] dark:border-zinc-800 dark:bg-zinc-900"
      >
        <LogOut
          className="size-16 text-zinc-300 transition-colors group-hover:text-zinc-400 dark:text-zinc-600 dark:group-hover:text-zinc-500"
          strokeWidth={1.4}
          aria-hidden="true"
        />
        <span className="mt-4 text-lg font-bold text-red-600 dark:text-red-400">Logout</span>
      </button>
    </form>
  );
}
