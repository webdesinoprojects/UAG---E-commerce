import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Eye, PackageCheck, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireCustomer } from "@/server/auth/customer";
import { readCustomerOrders } from "@/server/repositories/commerce-repository";
import {
  AccountPageFrame,
  AccountPageFrameShell,
} from "@/app/(store)/account/_components/account-page-frame";

export const metadata: Metadata = {
  title: "My Orders | UAG",
  description: "View your UAG order history.",
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

export default function CustomerOrdersPage() {
  return (
    <Suspense fallback={<AccountPageFrameShell />}>
      <CustomerOrdersContent />
    </Suspense>
  );
}

async function CustomerOrdersContent() {
  const customer = await requireCustomer();
  const orders = await readCustomerOrders(customer.id);

  return (
    <AccountPageFrame active="orders">
      <div className="space-y-6">
        <div>
          <h2 className="font-sans text-3xl font-bold text-zinc-950 dark:text-zinc-100">
            Orders
          </h2>
          <p className="mt-3 text-base leading-7 text-zinc-500 dark:text-zinc-400">
            Real order history from checkout, payments, and COD bookings.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <PackageCheck className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600" />
            <h2 className="mt-4 text-2xl font-bold text-zinc-950 dark:text-zinc-100">
              No orders yet
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Complete checkout and your orders will appear here.
            </p>
            <Button asChild className="mt-6 bg-zinc-950">
              <Link href="/categories">Continue shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 md:flex-row md:items-center md:justify-between dark:border-zinc-800">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-100">
                      {order.orderNumber}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="dark:bg-zinc-800 dark:text-zinc-300">
                      {order.status.replace("_", " ")}
                    </Badge>
                    <Badge variant="outline" className="dark:border-zinc-700 dark:text-zinc-300">
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.productName}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold text-zinc-950 dark:text-zinc-100">
                          {item.productName}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Qty {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100">
                        {formatMoney(item.lineTotalCents, item.currency)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end border-t border-zinc-200 pt-4 text-lg font-black dark:border-zinc-800">
                  <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/account/orders/${order.id}`}>
                          <Eye className="h-4 w-4" aria-hidden="true" />
                          Details
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/account/orders/${order.id}/invoice`}>
                          <ReceiptText className="h-4 w-4" aria-hidden="true" />
                          Invoice
                        </Link>
                      </Button>
                    </div>
                    <span>{formatMoney(order.totalCents, order.currency)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AccountPageFrame>
  );
}
