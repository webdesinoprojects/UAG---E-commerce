import type { Metadata } from "next";
import { Suspense } from "react";
import { requireCustomer } from "@/server/auth/customer";
import { readCustomerAddresses } from "@/server/repositories/commerce-repository";
import {
  AccountPageFrame,
  AccountPageFrameShell,
} from "@/app/(store)/account/_components/account-page-frame";
import { AddressManager } from "@/app/(store)/account/addresses/_components/address-manager";

export const metadata: Metadata = {
  title: "Addresses | UAG",
  description: "Manage your UAG account addresses.",
};

export default function AccountAddressesPage() {
  return (
    <Suspense fallback={<AccountPageFrameShell />}>
      <AccountAddressesContent />
    </Suspense>
  );
}

async function AccountAddressesContent() {
  const customer = await requireCustomer();
  const addresses = await readCustomerAddresses(customer.id);

  return (
    <AccountPageFrame active="addresses">
      <div className="space-y-7">
        <div>
          <h2 className="font-sans text-3xl font-bold text-zinc-950 dark:text-zinc-100">
            Addresses
          </h2>
          <p className="mt-3 text-base leading-7 text-zinc-500 dark:text-zinc-400">
            Saved addresses can be reused during checkout and updated from here.
          </p>
        </div>
        <AddressManager
          addresses={addresses}
          defaultName={customer.displayName ?? ""}
        />
      </div>
    </AccountPageFrame>
  );
}
