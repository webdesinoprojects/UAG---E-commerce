import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireCustomer } from "@/server/auth/customer";
import {
  AccountPageFrame,
  AccountPageFrameShell,
} from "@/app/(store)/account/_components/account-page-frame";

export const metadata: Metadata = {
  title: "Downloads | UAG",
  description: "View your UAG account downloads.",
};

export default function AccountDownloadsPage() {
  return (
    <Suspense fallback={<AccountPageFrameShell />}>
      <AccountDownloadsContent />
    </Suspense>
  );
}

async function AccountDownloadsContent() {
  await requireCustomer();

  return (
    <AccountPageFrame active="downloads">
      <div className="space-y-7">
        <div>
          <h2 className="font-sans text-3xl font-bold text-zinc-950">
            Downloads
          </h2>
          <p className="mt-3 text-base leading-7 text-zinc-500">
            Downloadable products linked to your orders will appear here.
          </p>
        </div>

        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[8px] border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
          <Download
            className="size-16 text-zinc-300"
            strokeWidth={1.4}
            aria-hidden="true"
          />
          <h3 className="mt-5 font-sans text-2xl font-bold text-zinc-950">
            No downloads available
          </h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">
            Your available files will show here after a qualifying order is
            completed.
          </p>
          <Button
            asChild
            className="mt-6 bg-zinc-950 text-white hover:bg-zinc-800"
          >
            <Link href="/categories">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </AccountPageFrame>
  );
}
