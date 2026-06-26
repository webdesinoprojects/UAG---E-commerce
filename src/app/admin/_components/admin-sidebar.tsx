/**
 * @file admin-sidebar.tsx
 * @description Sidebar component for the Admin Dashboard.
 * Utilizes Shadcn UI Sidebar primitives to create a responsive, 
 * multi-level navigation menu mirroring the Dashboard 2 design.
 */
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  CreditCard,
  LineChart,
  Home,
  MessageSquare,
  FileText,
  Calendar,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Image as MediaIcon } from "lucide-react";

// Configuration for sidebar navigation routes
const navigationData = {
  navMain: [
    {
      title: "Main Menu",
      items: [
        { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
        { title: "Media Library", url: "/admin/media", icon: MediaIcon },
        { 
          title: "Storefront (CMS)", 
          url: "/admin/homepage", 
          icon: FileText,
          defaultExpanded: false,
          subItems: [
            { title: "Top Marquee Banner", url: "/admin/homepage/top-banner" },
            { title: "Hero Carousel", url: "/admin/homepage/hero-carousel" },
            { title: "Categories Showcase", url: "/admin/homepage/categories" },
            { title: "Bento Gallery", url: "/admin/homepage/bento-gallery" },
            { title: "Merchandising", url: "/admin/homepage/merchandising" },
            { title: "Footer Settings", url: "/admin/homepage/footer" },
          ]
        },
        { 
          title: "Catalog", 
          url: "/admin/products", 
          icon: Package,
          defaultExpanded: true,
          subItems: [
            { title: "Products", url: "/admin/products" },
            { title: "Categories", url: "/admin/categories" },
          ]
        },
        { 
          title: "Orders", 
          url: "/admin/orders", 
          icon: ShoppingCart,
          defaultExpanded: false,
          subItems: [
            { title: "All Orders", url: "/admin/orders" },
            { title: "Abandoned Checkouts", url: "/admin/orders/abandoned" },
            { title: "Fulfillment", url: "/admin/orders/fulfillment" },
            { title: "Returns & Refunds", url: "/admin/orders/returns" },
          ]
        },
        { 
          title: "Customers", 
          url: "/admin/customers", 
          icon: Users,
          defaultExpanded: false,
          subItems: [
            { title: "All Customers", url: "/admin/customers" },
            { title: "Customer Segments", url: "/admin/customers/segments" },
            { title: "Reviews & Ratings", url: "/admin/customers/reviews" },
            { title: "Support Tickets", url: "/admin/customers/support" },
          ]
        },
        { title: "Settings", url: "/admin/settings", icon: Settings },
      ],
    }
  ],
};

export function AdminSidebar() {
  return (
    <React.Suspense fallback={<div className="w-[260px] hidden md:block border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50" />}>
      <AdminSidebarContent />
    </React.Suspense>
  );
}

function AdminSidebarContent() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/50 w-[260px] hidden md:flex flex-col">
      {/* Header / Logo */}
      <SidebarHeader className="h-16 flex items-center px-6 border-b border-zinc-100 dark:border-zinc-800/60">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-lg tracking-tight text-zinc-900 dark:text-white">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          Ecommerce Admin
        </Link>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
        {navigationData.navMain.map((group) => (
          <SidebarGroup key={group.title} className="mb-6">
            <SidebarGroupLabel className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase mb-2 px-3">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  item.subItems ? (
                    <Collapsible 
                      key={item.title}
                      defaultOpen={item.defaultExpanded || pathname.startsWith(item.url)} 
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton 
                            isActive={pathname === item.url && !item.subItems} 
                            className="h-10 gap-3 font-medium text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/50 rounded-lg px-3"
                          >
                            <item.icon className="h-4.5 w-4.5" />
                            <span>{item.title}</span>
                            <ChevronDown className="h-4 w-4 ml-auto opacity-50 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="mt-1 ml-5 border-l border-zinc-200 dark:border-zinc-800 pl-3 flex flex-col gap-1">
                            {item.subItems.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton 
                                  asChild 
                                  isActive={pathname === subItem.url || (subItem.url !== "/admin" && pathname.startsWith(subItem.url + "/"))}
                                  className="h-8 text-[13px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                                >
                                  <Link href={subItem.url}>
                                    {subItem.title}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={pathname === item.url}
                        className="h-10 gap-3 font-medium text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/50 rounded-lg px-3"
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4.5 w-4.5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer / Profile */}
      <SidebarFooter className="p-4 border-t border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden shrink-0">
            <img src="https://i.pravatar.cc/150?u=admin" alt="Admin Avatar" className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-bold text-zinc-900 dark:text-white truncate">Toby Belhome</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">hello@tobybelhome.com</span>
          </div>
          <LogOut className="h-4 w-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer shrink-0" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
