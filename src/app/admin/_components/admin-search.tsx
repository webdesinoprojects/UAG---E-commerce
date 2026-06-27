"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  Package,
  Search,
  ShoppingCart,
  Star,
  Users,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  mockAdminCustomers,
  mockAdminOrders,
  mockProducts,
  mockProductReviews,
  mockReturnRefundOrders,
} from "@/features/admin/mock-data";

type SearchEntry = {
  title: string;
  description: string;
  href: string;
  type: string;
  keywords: string;
  icon: React.ComponentType<{ className?: string }>;
};

const routeEntries: SearchEntry[] = [
  {
    title: "Dashboard",
    description: "Sales overview and recent activity",
    href: "/admin",
    type: "Page",
    keywords: "dashboard overview analytics sales revenue",
    icon: LayoutDashboard,
  },
  {
    title: "Media Library",
    description: "Images and uploaded media assets",
    href: "/admin/media",
    type: "Page",
    keywords: "media images assets upload library",
    icon: ImageIcon,
  },
  {
    title: "Homepage CMS",
    description: "Storefront sections and homepage content",
    href: "/admin/homepage",
    type: "Page",
    keywords: "homepage cms storefront banner carousel bento footer",
    icon: FileText,
  },
  {
    title: "More Pages",
    description: "Blog, about, contact, FAQs, and policies",
    href: "/admin/pages",
    type: "Page",
    keywords: "blog about contact privacy faq new launches pages content",
    icon: FileText,
  },
  {
    title: "Products",
    description: "Catalog products, price, stock, and status",
    href: "/admin/products",
    type: "Page",
    keywords: "products catalog stock sku price inventory",
    icon: Package,
  },
  {
    title: "Add Product",
    description: "Create a new catalog product",
    href: "/admin/products/new",
    type: "Action",
    keywords: "new product add create catalog",
    icon: Package,
  },
  {
    title: "Categories",
    description: "Catalog categories and storefront grouping",
    href: "/admin/categories",
    type: "Page",
    keywords: "categories catalog groups collection",
    icon: Package,
  },
  {
    title: "All Orders",
    description: "Booked customer orders",
    href: "/admin/orders",
    type: "Page",
    keywords: "orders booked checkout purchase quantity price",
    icon: ShoppingCart,
  },
  {
    title: "Returns & Refunds",
    description: "Returned, refunded, and replaced orders",
    href: "/admin/orders/returns",
    type: "Page",
    keywords: "returns refunds replacements return refund order",
    icon: ShoppingCart,
  },
  {
    title: "All Customers",
    description: "Customer login details and order activity",
    href: "/admin/customers",
    type: "Page",
    keywords: "customers users email phone login booked returned replaced",
    icon: Users,
  },
  {
    title: "Reviews & Ratings",
    description: "Product-wise customer reviews and ratings",
    href: "/admin/customers/reviews",
    type: "Page",
    keywords: "reviews ratings stars product sentiment customers",
    icon: Star,
  },
];

const dataEntries: SearchEntry[] = [
  ...mockProducts.map((product) => ({
    title: product.name,
    description: `${product.category} product, ${product.sales} sold`,
    href: `/admin/products?q=${encodeURIComponent(product.name)}`,
    type: "Product",
    keywords: `${product.name} ${product.category} ${product.status}`,
    icon: Package,
  })),
  ...mockAdminOrders.map((order) => ({
    title: order.id,
    description: `${order.customer} booked ${order.productName}`,
    href: `/admin/orders?q=${encodeURIComponent(order.id)}`,
    type: "Order",
    keywords: `${order.id} ${order.customer} ${order.email} ${order.productName} ${order.status}`,
    icon: ShoppingCart,
  })),
  ...mockReturnRefundOrders.map((order) => ({
    title: order.id,
    description: `${order.requestType} for ${order.productName}`,
    href: `/admin/orders/returns?q=${encodeURIComponent(order.id)}`,
    type: "Return",
    keywords: `${order.id} ${order.orderId} ${order.customer} ${order.productName} ${order.requestType} ${order.reason} ${order.status}`,
    icon: ShoppingCart,
  })),
  ...mockAdminCustomers.map((customer) => ({
    title: customer.name,
    description: `${customer.email} - ${customer.phone}`,
    href: `/admin/customers?q=${encodeURIComponent(customer.name)}`,
    type: "Customer",
    keywords: `${customer.id} ${customer.name} ${customer.email} ${customer.phone}`,
    icon: Users,
  })),
  ...mockProductReviews.map((review) => ({
    title: review.productName,
    description: `${review.rating.toFixed(1)} rating from ${review.reviews} reviews`,
    href: `/admin/customers/reviews?q=${encodeURIComponent(review.productName)}`,
    type: "Review",
    keywords: `${review.id} ${review.productName} ${review.reviewer} ${review.sentiment} ${review.latestComment}`,
    icon: Star,
  })),
];

const searchEntries = [...routeEntries, ...dataEntries];

export function AdminSearch() {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const normalizedQuery = query.trim().toLowerCase();
  const results = React.useMemo(() => {
    if (!normalizedQuery) {
      return routeEntries.slice(0, 6);
    }

    return searchEntries
      .map((entry) => ({ entry, score: getSearchScore(entry, normalizedQuery) }))
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((result) => result.entry);
  }, [normalizedQuery]);

  function navigateTo(entry: SearchEntry) {
    setOpen(false);
    setQuery("");
    router.push(entry.href);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selected = results[activeIndex] ?? results[0];

    if (selected) {
      navigateTo(selected);
      return;
    }

    if (normalizedQuery) {
      setOpen(false);
      router.push(`/admin/products?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      event.currentTarget.select();
      setOpen(true);
      return;
    }

    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative hidden w-full max-w-md items-center md:flex"
    >
      <Input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search admin panel..."
        className="h-9 rounded-lg border-zinc-200 bg-zinc-50 pl-9 pr-14 text-sm focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50"
        aria-label="Search admin panel"
        aria-expanded={open}
      />
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        aria-hidden="true"
      />
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 shadow-xs dark:border-zinc-700 dark:bg-zinc-800">
        <kbd>Ctrl</kbd>
        <kbd>K</kbd>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
          <div className="max-h-96 overflow-y-auto p-1">
            {results.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-zinc-500">
                No admin results found.
              </div>
            ) : (
              results.map((entry, index) => {
                const Icon = entry.icon;

                return (
                  <button
                    key={`${entry.type}-${entry.title}-${entry.href}`}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => navigateTo(entry)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={[
                      "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                      index === activeIndex
                        ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-white"
                        : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900",
                    ].join(" ")}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {entry.title}
                      </span>
                      <span className="block truncate text-xs text-zinc-500">
                        {entry.description}
                      </span>
                    </span>
                    <span className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {entry.type}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </form>
  );
}

function getSearchScore(entry: SearchEntry, query: string) {
  const title = entry.title.toLowerCase();
  const keywords = entry.keywords.toLowerCase();
  const description = entry.description.toLowerCase();

  if (title === query) return 100;
  if (title.startsWith(query)) return 80;
  if (title.includes(query)) return 60;
  if (keywords.includes(query)) return 35;
  if (description.includes(query)) return 20;

  const searchableText = `${title} ${keywords} ${description}`;
  const queryWords = query.split(/\s+/).filter(Boolean);

  if (queryWords.every((word) => searchableText.includes(word))) {
    return 10;
  }

  return 0;
}
