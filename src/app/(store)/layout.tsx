import React, { Suspense } from "react";
import SiteHeader from "@/components/site/site-header";
import SiteFooter from "@/components/site/site-footer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Suspense fallback={<header className="sticky top-0 z-50 w-full h-16 border-b border-border/40 bg-background" />}>
        <SiteHeader />
      </Suspense>
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <SiteFooter />
    </div>
  );
}
