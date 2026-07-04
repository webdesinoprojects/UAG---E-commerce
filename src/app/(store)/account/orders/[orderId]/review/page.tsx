import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, PackageCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { requireCustomer } from "@/server/auth/customer";
import { readOrderById } from "@/server/repositories/commerce-repository";
import { createSupabaseServiceRoleClient } from "@/server/db/supabase";
import { createProductReview } from "@/server/repositories/reviews";

export const metadata: Metadata = {
  title: "Rate & Review Product | UAG",
  description: "Share your experience with this product.",
};

function formatCurrency(cents: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function OrderReviewPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <div className="w-full max-w-2xl">
        <Suspense fallback={<div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm" />}>
          <OrderReviewContent params={params} />
        </Suspense>
      </div>
    </main>
  );
}

async function OrderReviewContent({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const client = createSupabaseServiceRoleClient();
  if (!client) notFound();

  const [customer, order] = await Promise.all([
    requireCustomer(),
    readOrderById(client, orderId),
  ]);

  if (!order || order.customerId !== customer.id) notFound();

  const item = order.items[0];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4">
        <div>
          <Button asChild variant="ghost" className="-ml-3 mb-2">
            <Link href={`/account/orders/${orderId}`}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Order
            </Link>
          </Button>
          <h1 className="text-2xl font-heading font-bold text-zinc-950 dark:text-white">
            Rate & Review Product
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Share your experience with this product.
          </p>
        </div>

        {item && (
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <PackageCheck className="m-5 h-6 w-6 text-zinc-300" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-zinc-900">{item.productName}</p>
                <p className="mt-1 text-xs text-zinc-500">{formatCurrency(item.lineTotalCents, item.currency)}</p>
              </div>
            </div>
          </div>
        )}

        <form action={`/account/orders/${orderId}/review`} className="space-y-4" method="post">
          <input type="hidden" name="productId" value={item?.productId ?? ""} />
          <input type="hidden" name="orderId" value={orderId} />

          <FieldGroup>
            <Field>
              <FieldLabel>Rating</FieldLabel>
              <select name="rating" defaultValue="5" className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm">
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </Field>

            <Field>
              <FieldLabel htmlFor="title">Title (optional)</FieldLabel>
              <Input id="title" name="title" placeholder="Great product!" />
              <FieldError />
            </Field>

            <Field>
              <FieldLabel htmlFor="comment">Review</FieldLabel>
              <Textarea
                id="comment"
                name="comment"
                rows={4}
                placeholder="Tell us what you liked or didn't like..."
                required
              />
              <FieldError />
            </Field>
          </FieldGroup>

          <Button type="submit" className="w-full bg-black">
            Submit Review
          </Button>
        </form>
      </div>
    </div>
  );
}