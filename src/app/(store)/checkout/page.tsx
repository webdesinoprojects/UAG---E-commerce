import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import { CouponSection } from "@/features/checkout/components/coupon-section";
import { getCartSummary } from "@/features/cart/queries";
import { getCurrentCustomer } from "@/server/auth/customer";
import { getRazorpayPublicKey } from "@/server/payments/razorpay";
import { lookupCouponByCode, calculateCouponDiscount } from "@/server/repositories/commerce-repository";

export const metadata: Metadata = {
  title: "Checkout | UAG",
  description: "Complete your UAG order.",
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

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
  const [customer, cart] = await Promise.all([
    getCurrentCustomer(),
    getCartSummary(),
  ]);

  if (cart.items.length === 0) {
    redirect("/cart");
  }

  const coupon = await lookupCouponByCode("");
  const discountCents = coupon ? calculateCouponDiscount(coupon, cart.subtotalCents) : 0;
  const totalCents = cart.subtotalCents - discountCents;

  return (
    <main className="bg-zinc-50 dark:bg-zinc-950 px-4 py-10">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            Checkout
          </p>
          <h1 className="mt-3 text-3xl font-heading font-bold text-zinc-950 dark:text-zinc-100">
            Delivery and payment
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {customer ? `Signed in as ${customer.displayName ?? customer.email}. Orders will appear in your account.` : "Checking out as guest. You can track your order with the order number and phone after placing it."}
          </p>
          <div className="mt-8">
            <CheckoutForm
              defaultName={customer?.displayName ?? ""}
              onlinePaymentEnabled={Boolean(getRazorpayPublicKey())}
              isGuest={!customer}
            />
          </div>
        </section>

        <aside className="h-fit rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-100">Order summary</h2>
          <div className="mt-5 space-y-4">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                  <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${item.slug}`} className="line-clamp-1 text-sm font-semibold text-zinc-950 dark:text-zinc-100">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100">
                  {formatMoney(item.lineTotalCents)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3 border-t border-zinc-200 pt-5 text-sm dark:border-zinc-800">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
              <span>Subtotal</span>
              <span>{formatMoney(cart.subtotalCents)}</span>
            </div>
            {discountCents > 0 && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                <span>Coupon discount</span>
                <span>-{formatMoney(discountCents)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between text-lg font-black text-zinc-950 dark:text-zinc-100">
              <span>Total</span>
              <span>{formatMoney(totalCents)}</span>
            </div>
          </div>
          <CouponSection subtotalCents={cart.subtotalCents} />
        </aside>
      </div>
    </main>
  );
}