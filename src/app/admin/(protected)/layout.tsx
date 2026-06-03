import * as React from "react";
import { Suspense } from "react";
import { requireAdmin } from "@/server/auth/admin";
import { AdminShell } from "../_components/admin-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminLayoutFallback />}>
      <ProtectedAdminShell>{children}</ProtectedAdminShell>
    </Suspense>
  );
}

async function ProtectedAdminShell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return <AdminShell adminEmail={admin.email}>{children}</AdminShell>;
}

function AdminLayoutFallback() {
  return (
    <div className="min-h-screen bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="h-12 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
