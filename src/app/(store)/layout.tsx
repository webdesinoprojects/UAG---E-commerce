import React, { Suspense } from "react";
import SiteHeader from "@/components/site/site-header";
import SiteFooter from "@/components/site/site-footer";
import { getCartSummary } from "@/features/cart/queries";
import { getSiteFooter } from "@/features/homepage/queries";
import { getCurrentCustomer } from "@/server/auth/customer";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const footer = await getSiteFooter();

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Suspense fallback={<header className="sticky top-0 z-50 w-full h-16 border-b border-border/40 bg-background" />}>
        <StoreHeader />
      </Suspense>
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <SiteFooter footer={footer} />
    </div>
  );
}

async function StoreHeader() {
  const [customer, cart] = await Promise.all([
    getCurrentCustomer(),
    getCartSummary(),
  ]);

  return (
    <SiteHeader
      isCustomerSignedIn={Boolean(customer)}
      cartItemCount={cart.itemCount}
    />
  );
}
