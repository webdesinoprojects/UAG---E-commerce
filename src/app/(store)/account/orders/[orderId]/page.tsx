import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft,
  Download,
  MapPin,
  PackageCheck,
  ReceiptText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireCustomer } from "@/server/auth/customer";
import {
  readCustomerOrderById,
  readCustomerServiceRequestsForOrder,
  readOrderEvents,
} from "@/server/repositories/commerce-repository";
import {
  AccountPageFrame,
  AccountPageFrameShell,
} from "@/app/(store)/account/_components/account-page-frame";
import { OrderSelfService } from "@/app/(store)/account/orders/_components/order-self-service";

export const metadata: Metadata = {
  title: "Order Details | UAG",
  description: "View your UAG order details, invoice, and service options.",
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusLabel(value: string) {
  return value.replace(/_/g, " ");
}

export default function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  return (
    <Suspense fallback={<AccountPageFrameShell />}>
      <CustomerOrderDetailContent params={params} />
    </Suspense>
  );
}

async function CustomerOrderDetailContent({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const [{ orderId }, customer] = await Promise.all([params, requireCustomer()]);
  const order = await readCustomerOrderById(orderId, customer.id);

  if (!order) notFound();

  const [events, requests] = await Promise.all([
    readOrderEvents(order.id),
    readCustomerServiceRequestsForOrder(customer.id, order.id),
  ]);

  return (
    <AccountPageFrame active="orders">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Button asChild variant="ghost" className="-ml-3 mb-2">
              <Link href="/account/orders">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Orders
              </Link>
            </Button>
            <h2 className="font-sans text-3xl font-bold text-zinc-950 dark:text-zinc-100">
              {order.orderNumber}
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Placed {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{statusLabel(order.status)}</Badge>
            <Badge variant="outline">{order.paymentStatus}</Badge>
            <Button asChild variant="outline">
              <Link href={`/account/orders/${order.id}/invoice`}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Invoice
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-100">
                Items
              </h3>
            </div>
            <div className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-950 dark:text-zinc-100">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Qty {item.quantity}
                      {item.sku ? ` - SKU ${item.sku}` : ""}
                    </p>
                  </div>
                  <p className="font-bold text-zinc-950 dark:text-zinc-100">
                    {formatMoney(item.lineTotalCents, item.currency)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2">
                <ReceiptText className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-100">
                  Total
                </h3>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span>{formatMoney(order.subtotalCents, order.currency)}</span>
                </div>
                {order.discountCents > 0 ? (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                    <span>-{formatMoney(order.discountCents, order.currency)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-zinc-500">
                  <span>Shipping</span>
                  <span>
                    {order.shippingCents === 0
                      ? "Free"
                      : formatMoney(order.shippingCents, order.currency)}
                  </span>
                </div>
                <div className="border-t border-zinc-200 pt-3 text-base font-black text-zinc-950 dark:border-zinc-800 dark:text-zinc-100">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>{formatMoney(order.totalCents, order.currency)}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-100">
                  Delivery
                </h3>
              </div>
              {order.shippingAddress ? (
                <div className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  <p className="font-semibold text-zinc-950 dark:text-zinc-100">
                    {order.shippingAddress.fullName}
                  </p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 ? <p>{order.shippingAddress.line2}</p> : null}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.phone}</p>
                  {order.trackingNumber ? (
                    <p className="mt-3 font-semibold">Tracking: {order.trackingNumber}</p>
                  ) : null}
                </div>
              ) : null}
            </section>
          </aside>
        </div>

        <OrderSelfService order={order} />

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-100">
              Activity
            </h3>
            <div className="mt-4 space-y-3">
              {events.length === 0 ? (
                <p className="text-sm text-zinc-500">No activity yet.</p>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-950"
                  >
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold text-zinc-950 dark:text-zinc-100">
                        {event.message ?? event.eventType}
                      </span>
                      <span className="shrink-0 text-xs text-zinc-500">
                        {formatDate(event.createdAt)}
                      </span>
                    </div>
                    {event.newStatus ? (
                      <p className="mt-1 text-xs text-zinc-500">
                        Status: {statusLabel(event.newStatus)}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-100">
              Return and replacement requests
            </h3>
            <div className="mt-4 space-y-3">
              {requests.length === 0 ? (
                <p className="text-sm text-zinc-500">No requests submitted.</p>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-zinc-950 dark:text-zinc-100">
                          {request.requestNumber}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {request.requestType} - {request.productName}
                        </p>
                      </div>
                      <Badge variant="secondary">{statusLabel(request.status)}</Badge>
                    </div>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                      {request.reason}
                    </p>
                    {request.adminNote ? (
                      <p className="mt-2 rounded-md bg-blue-50 p-2 text-xs text-blue-800 dark:bg-blue-950/30 dark:text-blue-200">
                        {request.adminNote}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </AccountPageFrame>
  );
}
