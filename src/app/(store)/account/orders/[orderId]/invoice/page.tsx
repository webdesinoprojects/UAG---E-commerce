import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireCustomer } from "@/server/auth/customer";
import { readCustomerOrderById } from "@/server/repositories/commerce-repository";
import { AccountPageFrameShell } from "@/app/(store)/account/_components/account-page-frame";
import { InvoicePrintButton } from "@/app/(store)/account/orders/[orderId]/invoice/_components/invoice-print-button";

export const metadata: Metadata = {
  title: "Invoice | UAG",
  description: "Print or download your UAG order invoice.",
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
  }).format(new Date(value));
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  return (
    <Suspense fallback={<AccountPageFrameShell />}>
      <InvoiceContent params={params} />
    </Suspense>
  );
}

async function InvoiceContent({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const [{ orderId }, customer] = await Promise.all([params, requireCustomer()]);
  const order = await readCustomerOrderById(orderId, customer.id);

  if (!order) notFound();

  return (
    <>
      <style>{printStyles}</style>
      <main className="bg-zinc-100 px-4 py-10 text-zinc-950 print:bg-white print:px-0 print:py-0">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <Button asChild variant="ghost">
              <Link href={`/account/orders/${order.id}`}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Order details
              </Link>
            </Button>
            <InvoicePrintButton />
          </div>

          <section className="overflow-hidden rounded-2xl bg-white shadow-xl print:rounded-none print:shadow-none">
            <div className="border-b border-zinc-100 bg-zinc-950 px-8 py-6 print:border-zinc-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-white/10 print:bg-zinc-100">
                    <Image
                      src="/images/logo/logo.png"
                      alt="UAG logo"
                      fill
                      sizes="48px"
                      className="object-contain p-1.5"
                      priority
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                      UAG
                    </p>
                    <h1 className="text-xl font-black tracking-tight text-white">
                      Invoice
                    </h1>
                  </div>
                </div>
                <div className="text-right text-sm text-zinc-300">
                  <p className="font-mono font-black text-white">{order.orderNumber}</p>
                  <p className="mt-1">Date: {formatDate(order.createdAt)}</p>
                  <p className="mt-0.5">Payment: {order.paymentStatus.toUpperCase()}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-8 border-b border-zinc-200 px-8 py-8 sm:grid-cols-2">
              <div>
                <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  Customer
                </h2>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="font-bold text-zinc-950">{order.customerName}</p>
                  <p className="text-zinc-600">{order.customerEmail}</p>
                  <p className="text-zinc-600">{order.customerPhone}</p>
                </div>
              </div>
              <div>
                <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                  Delivery Address
                </h2>
                {order.shippingAddress ? (
                  <div className="mt-3 space-y-1 text-sm text-zinc-600">
                    <p className="font-bold text-zinc-950">
                      {order.shippingAddress.fullName}
                    </p>
                    <p>{order.shippingAddress.line1}</p>
                    {order.shippingAddress.line2 ? (
                      <p>{order.shippingAddress.line2}</p>
                    ) : null}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                      {order.shippingAddress.postalCode}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-zinc-500">No shipping address provided.</p>
                )}
              </div>
            </div>

            <div className="px-8 py-8">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-zinc-200 text-xs uppercase tracking-wider text-zinc-500">
                    <th className="pb-3 font-black">Item</th>
                    <th className="pb-3 text-center font-black">Qty</th>
                    <th className="pb-3 text-right font-black">Rate</th>
                    <th className="pb-3 text-right font-black">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-zinc-100 last:border-0">
                      <td className="py-4 font-semibold text-zinc-900">{item.productName}</td>
                      <td className="py-4 text-center text-zinc-600">{item.quantity}</td>
                      <td className="py-4 text-right text-zinc-600">
                        {formatMoney(item.unitPriceCents, item.currency)}
                      </td>
                      <td className="py-4 text-right font-black text-zinc-900">
                        {formatMoney(item.lineTotalCents, item.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-end gap-4 border-t-2 border-zinc-200 px-8 py-8">
              <div className="w-full max-w-xs space-y-3 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span>{formatMoney(order.subtotalCents, order.currency)}</span>
                </div>
                {order.discountCents > 0 ? (
                  <div className="flex justify-between text-emerald-700">
                    <span>
                      Discount {order.couponCode ? `(${order.couponCode})` : ""}
                    </span>
                    <span>-{formatMoney(order.discountCents, order.currency)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-zinc-600">
                  <span>Shipping</span>
                  <span>
                    {order.shippingCents === 0
                      ? "Free"
                      : formatMoney(order.shippingCents, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between border-t-2 border-zinc-900 pt-3 text-lg font-black text-zinc-900">
                  <span>Total</span>
                  <span>{formatMoney(order.totalCents, order.currency)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-200 bg-zinc-50 px-8 py-6 print:bg-white">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-8 overflow-hidden rounded bg-white">
                    <Image
                      src="/images/logo/logo.png"
                      alt="UAG logo"
                      fill
                      sizes="32px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-900">
                      UAG
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Urban Armour Gear Ecommerce
                    </p>
                  </div>
                </div>
                <p className="max-w-md text-[11px] leading-6 text-zinc-500">
                  This computer-generated invoice is valid for UAG ecommerce orders.
                  For warranty, replacement, return, or refund support, use the order
                  detail page in your account.
                </p>
              </div>
            </div>

            <div className="invoice-print-footer hidden print:flex">
              <Image
                src="/images/logo/logo.png"
                alt="UAG logo"
                width={80}
                height={32}
                className="object-contain"
              />
              <span>Urban Armour Gear</span>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

const printStyles = `
  @media print {
    @page {
      size: A4;
      margin: 0;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    header,
    footer,
    nav,
    .no-print,
    [class*="site-header"],
    [class*="site-footer"],
    [class*="account-sidebar"],
    [class*="account-hero"],
    [class*="store-header"],
    [class*="store-footer"] {
      display: none !important;
    }

    main {
      padding: 0 !important;
    }

    .max-w-4xl {
      max-width: 100% !important;
    }

    .rounded-2xl,
    .shadow-xl {
      border-radius: 0 !important;
      box-shadow: none !important;
    }

    .break-inside-avoid {
      break-inside: avoid;
    }

    .page-break {
      break-after: page;
    }
  }

  @media print {
    .invoice-print-footer {
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      padding: 20px 40px !important;
      background: #fff !important;
      border-top: 1px solid #e5e7eb !important;
      z-index: 9999 !important;
    }

    .invoice-print-footer img {
      height: 32px !important;
      width: auto !important;
      object-fit: contain !important;
    }

    .invoice-print-footer span {
      margin-left: 10px !important;
      font-size: 11px !important;
      color: #6b7280 !important;
      letter-spacing: 0.05em !important;
    }
  }
`;
