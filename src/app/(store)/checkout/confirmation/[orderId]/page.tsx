import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { readOrderById } from "@/server/repositories/commerce-repository";
import { createSupabaseServiceRoleClient } from "@/server/db/supabase";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatCurrency(cents: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function statusMeta(status: string) {
  switch (status) {
    case "pending_payment":
      return { label: "Pending Payment", variant: "secondary" as const };
    case "booked":
      return { label: "Order Booked", variant: "default" as const };
    case "processing":
      return { label: "Processing", variant: "default" as const };
    case "shipped":
      return { label: "Shipped", variant: "default" as const };
    case "delivered":
      return { label: "Delivered", variant: "default" as const };
    case "cancelled":
      return { label: "Cancelled", variant: "destructive" as const };
    case "payment_failed":
      return { label: "Payment Failed", variant: "destructive" as const };
    default:
      return { label: status, variant: "secondary" as const };
  }
}

export const metadata: Metadata = {
  title: "Order Confirmation | UAG",
  description: "Your order has been placed successfully.",
};

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  return (
    <main className="bg-zinc-50 flex min-h-screen flex-col px-4 py-10 dark:bg-zinc-950 md:py-16">
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-2xl">
          <Suspense
            fallback={
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm" />
            }
          >
            <OrderConfirmationContent params={params} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

async function OrderConfirmationContent({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const client = createSupabaseServiceRoleClient();
  if (!client) notFound();

  const order = await readOrderById(client, orderId);

  if (!order) notFound();

  const meta = statusMeta(order.status);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
          <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="mt-4 text-2xl font-heading font-bold text-zinc-950 dark:text-white">
          Order Confirmed
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Thank you, {order.customerName}. Your order has been placed successfully.
        </p>
      </div>

<div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
         <div>
           <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
             Order Number
           </p>
           <p className="mt-1 font-mono text-sm font-bold text-zinc-900 dark:text-white">
             {order.orderNumber}
           </p>
         </div>
         <div className="text-right">
           <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
             Order ID
           </p>
           <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-300 max-w-[180px] break-all">
             {orderId}
           </p>
         </div>
         <Badge variant={meta.variant}>{meta.label}</Badge>
       </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Customer
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
            {order.customerName}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Phone
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
            {order.customerPhone}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Total
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
            {formatCurrency(order.totalCents, order.currency)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Items ({order.items.length})
        </h3>
        <div className="mt-3 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 dark:bg-zinc-950">
                <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Product
                </TableHead>
                <TableHead className="text-center text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Qty
                </TableHead>
                <TableHead className="text-center text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Price
                </TableHead>
                <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm font-medium text-zinc-900 dark:text-white">
                    {item.productName}
                  </TableCell>
                  <TableCell className="text-center text-sm text-zinc-600 dark:text-zinc-300">
                    x{item.quantity}
                  </TableCell>
                  <TableCell className="text-center text-sm text-zinc-600 dark:text-zinc-300">
                    {formatCurrency(item.unitPriceCents, item.currency)}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-zinc-900 dark:text-white">
                    {formatCurrency(item.lineTotalCents, item.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-300">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotalCents, order.currency)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm text-zinc-600 dark:text-zinc-300">
          <span>Shipping</span>
          <span>{order.shippingCents === 0 ? "Free" : formatCurrency(order.shippingCents, order.currency)}</span>
        </div>
        <div className="my-3 h-px bg-zinc-200 dark:bg-zinc-800" />
        <div className="flex justify-between text-base font-bold text-zinc-900 dark:text-white">
          <span>Total</span>
          <span>{formatCurrency(order.totalCents, order.currency)}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild className="bg-black">
          <a href={`/track-order`}>Track this Order</a>
        </Button>
        <Button asChild variant="outline">
          <a href={`/`}>Continue Shopping</a>
        </Button>
      </div>
    </div>
  );
}
