/**
 * @file layout.tsx
 * @description The main layout wrapper for all protected `/admin` routes.
 * Initializes the SidebarProvider and renders the top header (Search, Notifications).
 */
"use client";

import * as React from "react";
import Link from "next/link";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "../_components/admin-sidebar";
import { Input } from "@/components/ui/input";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-zinc-50/30 dark:bg-zinc-950">
        
        <AdminSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Header */}
          <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shrink-0 sticky top-0 z-10">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="md:hidden" />
              
              {/* Global Search */}
              <div className="hidden md:flex items-center w-full max-w-md relative">
                <Input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-9 h-9 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-400 text-sm rounded-lg"
                />
                <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-medium text-zinc-400 bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded shadow-xs border border-zinc-200 dark:border-zinc-700">
                  <kbd>⌘</kbd>
                  <kbd>K</kbd>
                </div>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-4 shrink-0">
              <Link href="#" className="hidden sm:block text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline">
                Get Pro
              </Link>
              <div className="flex items-center gap-4 text-zinc-500 dark:text-zinc-400">
                {/* Notifications */}
                <button className="relative hover:text-zinc-900 dark:hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-zinc-950"></span>
                </button>
                {/* Dark Mode Toggle Placeholder */}
                <button className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            {children}
          </main>
          
        </div>
      </div>
    </SidebarProvider>
  );
}
