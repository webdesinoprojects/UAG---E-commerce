/**
 * @file admin-shell.tsx
 * @description Client-side admin chrome. Auth must stay in the server layout.
 */
"use client";

import * as React from "react";
import {
  Bell,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { signOutAdminAction } from "@/server/auth/actions";
import { AdminSidebar } from "./admin-sidebar";
import { AdminSearch } from "./admin-search";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  children: React.ReactNode;
  adminEmail: string;
}

export function AdminShell({ children, adminEmail }: AdminShellProps) {
  const [isAdminDark, setIsAdminDark] = React.useState(() => {
    try {
      const stored = localStorage.getItem("admin-theme");
      return stored === "dark";
    } catch {
      return false;
    }
  });

  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      localStorage.setItem("admin-theme", isAdminDark ? "dark" : "light");
    } catch {}
  }, [isAdminDark]);

  return (
    <div className={cn("h-dvh", isAdminDark && "dark")}>
      <SidebarProvider>
        <div className="flex h-full w-full overflow-hidden bg-zinc-50/30 dark:bg-zinc-950">
          <AdminSidebar />

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-950">
            <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950 md:px-6">
              <div className="flex flex-1 items-center gap-4">
                <SidebarTrigger className="md:hidden" />

                <AdminSearch />
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <span className="hidden max-w-56 truncate text-xs font-semibold text-zinc-500 md:block">
                  {adminEmail}
                </span>
                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Notifications"
                    aria-expanded={notificationsOpen}
                    className="relative"
                    onClick={() => setNotificationsOpen((open) => !open)}
                  >
                    <Bell className="h-5 w-5" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Toggle theme"
                    onClick={() => setIsAdminDark((current) => !current)}
                  >
                    {isAdminDark ? (
                      <Sun className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Moon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </Button>
                  <form action={signOutAdminAction}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      aria-label="Sign out"
                    >
                      <LogOut className="h-5 w-5" aria-hidden="true" />
                    </Button>
                  </form>
                </div>
              </div>
            </header>

            <main className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
