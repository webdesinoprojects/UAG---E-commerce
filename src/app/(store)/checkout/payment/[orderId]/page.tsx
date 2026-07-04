import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { RazorpayPayment } from "@/features/checkout/components/razorpay-payment";
import { CHECKOUT_ORDER_ACCESS_COOKIE } from "@/lib/checkout-order-cookies";
import { getCurrentCustomer } from "@/server/auth/customer";
import { getRazorpayPublicKey } from "@/server/payments/razorpay";
import { readOrderById } from "@/server/repositories/commerce-repository";
import { createSupabaseServiceRoleClient } from "@/server/db/supabase";

export const metadata: Metadata = {
  title: "Payment | UAG",
  description: "Complete your UAG payment.",
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export default function RazorpayPaymentPage(props: {
  params: Promise<{ orderId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="bg-zinc-50 px-4 py-10">
          <div className="mx-auto h-80 max-w-xl rounded-lg border border-zinc-200 bg-white" />
        </main>
      }
    >
      <RazorpayPaymentContent {...props} />
    </Suspense>
  );
}

async function RazorpayPaymentContent({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const [{ orderId }] = await Promise.all([params]);
  const client = createSupabaseServiceRoleClient();
  if (!client) notFound();

  const [order, keyId] = await Promise.all([
    readOrderById(client, orderId),
    Promise.resolve(getRazorpayPublicKey()),
  ]);

  if (!order) notFound();

  const [customer, cookieStore] = await Promise.all([
    getCurrentCustomer(),
    cookies(),
  ]);
  const hasGuestCheckoutAccess =
    cookieStore.get(CHECKOUT_ORDER_ACCESS_COOKIE)?.value === order.id;

  if (order.customerId) {
    if (customer?.id !== order.customerId) notFound();
  } else if (!hasGuestCheckoutAccess) {
    notFound();
  }

  if (order.paymentMethod !== "razorpay") redirect("/checkout");
  if (order.paymentStatus === "paid") redirect(`/checkout/confirmation/${orderId}`);
  if (!order.razorpayOrderId || !keyId) redirect("/checkout");

  return (
    <main className="bg-zinc-50 px-4 py-10">
      <section className="mx-auto max-w-xl rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Secure Payment
        </p>
        <h1 className="mt-3 text-3xl font-heading font-bold text-zinc-950">
          Complete payment
        </h1>
        <div className="mt-6 rounded-lg bg-zinc-50 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Order</span>
            <span className="font-semibold">{order.orderNumber}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-zinc-500">Amount</span>
            <span className="font-black">
              {formatMoney(order.totalCents, order.currency)}
            </span>
          </div>
        </div>
        <div className="mt-6">
          <RazorpayPayment
            orderId={order.id}
            orderNumber={order.orderNumber}
            razorpayOrderId={order.razorpayOrderId}
            keyId={keyId}
            amountCents={order.totalCents}
            currency={order.currency}
            customerName={order.customerName}
            customerEmail={order.customerEmail}
            customerPhone={order.customerPhone}
          />
        </div>
      </section>
    </main>
  );
}
