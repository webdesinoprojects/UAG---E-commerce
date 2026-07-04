import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CheckoutWorkspace } from "@/features/checkout/components/checkout-workspace";
import { getCartSummary } from "@/features/cart/queries";
import { getCurrentCustomer } from "@/server/auth/customer";
import { getRazorpayPublicKey } from "@/server/payments/razorpay";
import {
  listActiveCoupons,
  readCustomerAddresses,
} from "@/server/repositories/commerce-repository";

export const metadata: Metadata = {
  title: "Checkout | UAG",
  description: "Complete your UAG order.",
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-zinc-50 px-4 py-10">
          <div className="mx-auto h-[520px] max-w-7xl rounded-lg border border-zinc-200 bg-white" />
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

async function CheckoutContent() {
  const customer = await getCurrentCustomer();
  const [cart, coupons] = await Promise.all([
    getCartSummary(),
    listActiveCoupons(),
  ]);

  if (cart.items.length === 0) {
    redirect("/cart");
  }

  const addresses = customer ? await readCustomerAddresses(customer.id) : [];
  const signedInLabel = customer
    ? `Signed in as ${customer.displayName ?? customer.email}. Orders will appear in your account.`
    : "Checking out as guest. You can track your order with the order number and phone after placing it.";

  return (
    <main className="bg-zinc-50 dark:bg-zinc-950 px-4 py-10">
      <CheckoutWorkspace
        addresses={addresses}
        cart={cart}
        coupons={coupons}
        defaultName={customer?.displayName ?? ""}
        isGuest={!customer}
        onlinePaymentEnabled={Boolean(getRazorpayPublicKey())}
        signedInLabel={signedInLabel}
      />
    </main>
  );
}
