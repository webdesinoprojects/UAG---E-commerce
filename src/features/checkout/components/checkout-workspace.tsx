"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import { CouponSection } from "@/features/checkout/components/coupon-section";
import { calculateDiscount } from "@/features/commerce/coupons";
import type { CartSummary } from "@/features/cart/types";
import type { Coupon } from "@/features/commerce/types";
import type { CustomerAddressDto } from "@/server/repositories/commerce-repository";

function formatMoney(cents: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function CheckoutWorkspace({
  addresses,
  cart,
  coupons,
  defaultName,
  isGuest,
  onlinePaymentEnabled,
  signedInLabel,
}: {
  addresses: CustomerAddressDto[];
  cart: CartSummary;
  coupons: Coupon[];
  defaultName: string;
  isGuest: boolean;
  onlinePaymentEnabled: boolean;
  signedInLabel: string;
}) {
  const [couponCode, setCouponCode] = useState("");
  const appliedCoupon = useMemo(
    () => coupons.find((coupon) => coupon.code === couponCode) ?? null,
    [couponCode, coupons]
  );
  const discount = appliedCoupon
    ? calculateDiscount(appliedCoupon, cart.subtotalCents).discountCents
    : 0;
  const totalCents = Math.max(cart.subtotalCents - discount, 0);

  return (
    <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
          Checkout
        </p>
        <h1 className="mt-3 text-3xl font-heading font-bold text-zinc-950 dark:text-zinc-100">
          Delivery and payment
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {signedInLabel}
        </p>
        <div className="mt-8">
          <CheckoutForm
            addresses={addresses}
            couponCode={couponCode}
            defaultName={defaultName}
            onlinePaymentEnabled={onlinePaymentEnabled}
            isGuest={isGuest}
          />
        </div>
      </section>

      <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-bold text-zinc-950 dark:text-zinc-100">
          Order summary
        </h2>
        <div className="mt-5 space-y-4">
          {cart.items.map((item) => (
            <div key={item.productId} className="flex gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.slug}`}
                  className="line-clamp-1 text-sm font-semibold text-zinc-950 dark:text-zinc-100"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Qty {item.quantity}
                </p>
              </div>
              <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100">
                {formatMoney(item.lineTotalCents, item.currency)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3 border-t border-zinc-200 pt-5 text-sm dark:border-zinc-800">
          <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
            <span>Subtotal</span>
            <span>{formatMoney(cart.subtotalCents, cart.currency)}</span>
          </div>
          {discount > 0 ? (
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
              <span>Coupon discount</span>
              <span>-{formatMoney(discount, cart.currency)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between text-lg font-black text-zinc-950 dark:text-zinc-100">
            <span>Total</span>
            <span>{formatMoney(totalCents, cart.currency)}</span>
          </div>
        </div>
        <CouponSection
          subtotalCents={cart.subtotalCents}
          coupons={coupons}
          appliedCode={couponCode}
          onApply={setCouponCode}
        />
      </aside>
    </div>
  );
}
