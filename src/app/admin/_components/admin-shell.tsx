/**
 * @file admin-shell.tsx
 * @description Client-side admin chrome. Auth must stay in the server layout.
 */
"use client";

import * as React from "react";
import { Bell, LogOut, Moon, Search } from "lucide-react";
import { signOutAdminAction } from "@/server/auth/actions";
import { AdminSidebar } from "./admin-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface AdminShellProps {
  children: React.ReactNode;
  adminEmail: string;
}

export function AdminShell({ children, adminEmail }: AdminShellProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-zinc-50/30 dark:bg-zinc-950">
        <AdminSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-1 items-center gap-4">
              <SidebarTrigger className="md:hidden" />

              <div className="relative hidden w-full max-w-md items-center md:flex">
                <Input
                  type="text"
                  placeholder="Search..."
                  className="h-9 rounded-lg border-zinc-200 bg-zinc-50 pl-9 text-sm focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50"
                />
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                  aria-hidden="true"
                />
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 shadow-xs dark:border-zinc-700 dark:bg-zinc-800">
                  <kbd>Ctrl</kbd>
                  <kbd>K</kbd>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-4">
              <span className="hidden max-w-56 truncate text-xs font-semibold text-zinc-500 md:block">
                {adminEmail}
              </span>
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="h-5 w-5" aria-hidden="true" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Toggle theme">
                  <Moon className="h-5 w-5" aria-hidden="true" />
                </Button>
                <form action={signOutAdminAction}>
                  <Button variant="ghost" size="icon" aria-label="Sign out">
                    <LogOut className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </form>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
