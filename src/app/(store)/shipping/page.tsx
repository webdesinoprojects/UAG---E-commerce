import type { Metadata } from "next";
import Link from "next/link";
import { PackageCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping | UAG",
  description: "Shipping, delivery, returns, and order support information for UAG customers.",
};

const shippingBlocks = [
  {
    title: "Fast Dispatch",
    body: "Most in-stock products are packed and handed to delivery partners within 24 to 48 business hours after order confirmation.",
    icon: PackageCheck,
  },
  {
    title: "Tracked Delivery",
    body: "Once shipped, your order can be followed from the Track Order page using your order number and mobile number.",
    icon: Truck,
  },
  {
    title: "Careful Packaging",
    body: "Audio gear, accessories, and fragile products are packed to reduce transit damage and keep the unboxing clean.",
    icon: ShieldCheck,
  },
  {
    title: "Return Support",
    body: "If something arrives damaged or incorrect, contact support with your order details so the team can review replacement or return options.",
    icon: RotateCcw,
  },
];

export default function ShippingPage() {
  return (
    <main className="bg-white dark:bg-zinc-950">
      <section className="bg-zinc-950 px-4 py-16 text-white md:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Delivery Support
          </p>
          <h1 className="mt-5 text-5xl font-heading font-bold leading-tight md:text-7xl">
            Shipping
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300">
            Clear dispatch, tracking, and support details for every UAG order.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-2">
          {shippingBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <section
                key={block.title}
                className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <Icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                <h2 className="mt-4 text-2xl font-heading font-semibold">
                  {block.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {block.body}
                </p>
              </section>
            );
          })}
        </div>

        <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-2xl font-heading font-semibold">Need order help?</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Use order tracking first for live status. For address changes, damaged parcels, or delivery questions, contact support with your order number.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/track-order"
              className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              Track Order
            </Link>
            <Link
              href="/contact-us"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
