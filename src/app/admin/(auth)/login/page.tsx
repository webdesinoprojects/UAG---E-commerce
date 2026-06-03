import { Suspense } from "react";
import { getSafeAdminRedirect } from "@/server/validators/auth";
import { AdminLoginForm } from "./_components/login-form";

interface AdminLoginPageProps {
  searchParams: Promise<{ next?: string | string[] }>;
}

export default function AdminLoginPage(props: AdminLoginPageProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <Suspense fallback={<LoginShell />}>
        <AdminLoginContent {...props} />
      </Suspense>
    </main>
  );
}

async function AdminLoginContent({
  searchParams,
}: AdminLoginPageProps) {
  const search = await searchParams;
  const next = getSafeAdminRedirect(
    typeof search.next === "string" ? search.next : undefined
  );

  return <AdminLoginForm initialState={{ next, message: null }} />;
}

function LoginShell() {
  return (
    <div className="h-[420px] w-full max-w-md rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950" />
  );
}
