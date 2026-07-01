import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackOrderForm } from "../(store)/track-order/_components/track-order-form";

export const metadata: Metadata = {
  title: "Track Order | UAG",
  description: "Track your order by order number and phone number.",
};

export default function TrackOrderPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#f1f3f6] px-0 py-0 dark:bg-zinc-950 md:pb-12">
      <div className="flex flex-1 items-start justify-center">
        <div className="w-full max-w-7xl">
          <Suspense
            fallback={
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900" />
            }
          >
            <TrackOrderForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
