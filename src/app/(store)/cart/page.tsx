import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { clearCartAction } from "@/features/cart/actions";
import { getCartSummary } from "@/features/cart/queries";
import { CartLineControls } from "./_components/cart-line-controls";

export const metadata: Metadata = {
  title: "Cart | UAG",
  description: "Review your UAG cart and checkout summary.",
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export default async function CartPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-zinc-200 px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Shopping Cart
          </p>
          <h1 className="mt-3 text-4xl font-heading font-bold text-zinc-950 md:text-5xl">
            Your cart
          </h1>
        </div>
      </section>
      <Suspense
        fallback={
          <section className="mx-auto max-w-7xl px-4 py-10 text-sm text-zinc-500">
            Loading cart...
          </section>
        }
      >
        <CartContent />
      </Suspense>
    </main>
  );
}

async function CartContent() {
  const cart = await getCartSummary();
  const shippingCents = cart.subtotalCents > 0 ? 0 : 0;
  const totalCents = cart.subtotalCents + shippingCents;

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_380px]">
        {cart.items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center lg:col-span-2">
            <ShoppingBag className="mx-auto h-12 w-12 text-zinc-300" />
            <h2 className="mt-4 text-2xl font-bold text-zinc-950">
              Your cart is empty
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Add products from the catalog and they will appear here.
            </p>
            <Link
              href="/categories"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-800"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cart.items.map((item) => (
                <article
                  key={item.productId}
                  className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-[120px_minmax(0,1fr)]"
                >
                  <Link
                    href={`/products/${item.slug}`}
                    className="relative aspect-square overflow-hidden rounded-md bg-zinc-100"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        {item.category}
                      </p>
                      <Link href={`/products/${item.slug}`}>
                        <h2 className="mt-1 text-lg font-bold text-zinc-950 hover:text-blue-700">
                          {item.name}
                        </h2>
                      </Link>
                      <p className="mt-2 text-sm font-bold text-blue-600">
                        {formatMoney(item.priceCents)}
                      </p>
                      {item.stockQuantity <= 0 ? (
                        <p className="mt-2 text-xs font-semibold text-red-600">
                          Currently out of stock
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      <CartLineControls
                        productId={item.productId}
                        quantity={item.quantity}
                      />
                      <p className="text-sm font-black text-zinc-950">
                        {formatMoney(item.lineTotalCents)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-lg border border-zinc-200 bg-zinc-50 p-6">
              <h2 className="text-xl font-bold text-zinc-950">Order Summary</h2>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Items</span>
                  <span>{cart.itemCount}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span>{formatMoney(cart.subtotalCents)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-zinc-200 pt-3">
                  <div className="flex justify-between text-lg font-black text-zinc-950">
                    <span>Total</span>
                    <span>{formatMoney(totalCents)}</span>
                  </div>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-6 flex w-full items-center justify-center rounded-md bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-800"
              >
                Checkout
              </Link>
              <form action={clearCartAction}>
                <button
                  type="submit"
                  className="mt-3 w-full rounded-md border border-zinc-300 px-5 py-3 text-sm font-bold text-zinc-700 transition-colors hover:bg-white"
                >
                  Clear Cart
                </button>
              </form>
            </aside>
          </>
        )}
    </section>
  );
}
