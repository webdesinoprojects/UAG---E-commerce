"use client";

import Image from "next/image";
import type { AdminProductListItemDto } from "@/features/catalog/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  active:
    "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
  draft:
    "bg-zinc-100 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300",
  archived:
    "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
};

interface InventoryClientProps {
  products: AdminProductListItemDto[];
}

export default function InventoryClient({
  products,
}: InventoryClientProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Stock levels are automatically updated when customers add products to cart or place orders.
          </p>
        </div>
        <Badge variant="outline" className="h-fit text-xs">
          Auto-managed
        </Badge>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <Table>
          <TableHeader className="bg-zinc-50/50 dark:bg-zinc-950/50">
            <TableRow className="border-zinc-200 hover:bg-transparent dark:border-zinc-800">
              <TableHead className="w-14">Image</TableHead>
              <TableHead className="min-w-[200px]">Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Low Stock Threshold</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-zinc-400">
                    <Package className="h-10 w-10" />
                    <p className="font-medium text-zinc-700 dark:text-zinc-300">
                      No products yet
                    </p>
                    <p className="text-sm">Add products to see inventory.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const isLowStock =
                  product.stockQuantity > 0 &&
                  product.stockQuantity <= product.lowStockThreshold;
                const isOutOfStock = product.stockQuantity === 0;

                return (
                  <TableRow
                    key={product.id}
                    className="border-zinc-100 dark:border-zinc-800/60"
                  >
                    <TableCell>
                      <div className="relative h-10 w-10 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                        {product.primaryImageUrl ? (
                          <Image
                            src={product.primaryImageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <Package className="absolute inset-0 m-auto h-5 w-5 text-zinc-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400">/{product.slug}</p>
                      {product.sku && (
                        <p className="mt-0.5 text-xs text-zinc-400">SKU: {product.sku}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[product.status]}>
                        {STATUS_LABELS[product.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          isOutOfStock
                            ? "font-medium text-red-600"
                            : isLowStock
                            ? "font-medium text-amber-600 dark:text-amber-400"
                            : "font-medium text-zinc-900 dark:text-zinc-100"
                        }
                      >
                        {product.stockQuantity}
                      </span>
                      {isOutOfStock && (
                        <p className="text-xs text-red-500">Out of stock</p>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <p className="text-xs text-amber-600 dark:text-amber-400">Low stock</p>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm text-zinc-500 dark:text-zinc-400">
                      {product.lowStockThreshold}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
