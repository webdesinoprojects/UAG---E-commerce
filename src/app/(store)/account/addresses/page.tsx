import type { Metadata } from "next";
import { Suspense } from "react";
import { MapPin } from "lucide-react";
import { requireCustomer } from "@/server/auth/customer";
import {
  AccountPageFrame,
  AccountPageFrameShell,
} from "@/app/(store)/account/_components/account-page-frame";

export const metadata: Metadata = {
  title: "Addresses | UAG",
  description: "View your UAG account addresses.",
};

const addressCards = [
  {
    title: "Billing address",
    description: "You have not set up this type of address yet.",
  },
  {
    title: "Shipping address",
    description: "You have not set up this type of address yet.",
  },
];

export default function AccountAddressesPage() {
  return (
    <Suspense fallback={<AccountPageFrameShell />}>
      <AccountAddressesContent />
    </Suspense>
  );
}

async function AccountAddressesContent() {
  await requireCustomer();

  return (
    <AccountPageFrame active="addresses">
      <div className="space-y-7">
        <div>
          <h2 className="font-sans text-3xl font-bold text-zinc-950 dark:text-zinc-100">
            Addresses
          </h2>
          <p className="mt-3 text-base leading-7 text-zinc-500 dark:text-zinc-400">
            The following addresses will be used on the checkout page by
            default.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {addressCards.map((card) => (
            <section
              key={card.title}
              className="rounded-[8px] border border-zinc-200 bg-white p-7 shadow-[0_1px_10px_rgba(0,0,0,0.08)] dark:border-zinc-800 dark:bg-zinc-900"
            >
              <MapPin
                className="size-12 text-zinc-300 dark:text-zinc-600"
                strokeWidth={1.4}
                aria-hidden="true"
              />
              <h3 className="mt-5 font-sans text-2xl font-bold text-zinc-950 dark:text-zinc-100">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {card.description}
              </p>
            </section>
          ))}
        </div>
      </div>
    </AccountPageFrame>
  );
}
