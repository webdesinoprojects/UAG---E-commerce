"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Archive,
  CheckCircle2,
  Edit,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  deleteDraftCatalogProductAction,
  updateCatalogProductStatusAction,
} from "@/features/catalog/actions";
import type { AdminProductListItemDto, ProductStatus } from "@/features/catalog/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductsListClientProps {
  products: AdminProductListItemDto[];
  toastMessage: string | null;
  initialSearch?: string;
}

function formatPrice(priceCents: number, currency: string) {
  const amount = priceCents / 100;
  if (currency === "INR") {
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  }
  return `${currency} ${amount.toFixed(2)}`;
}

const STATUS_STYLES: Record<ProductStatus, string> = {
  active:
    "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
  draft:
    "bg-zinc-100 text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300",
  archived:
    "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS: Record<ProductStatus, string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
};

export default function ProductsListClient({
  products,
  toastMessage,
  initialSearch,
}: ProductsListClientProps) {
  const router = useRouter();
  const consumedToastRef = useRef<string | null>(null);
  const [search, setSearch] = useState(initialSearch ?? "");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Fire the toast once then clean the query param so a refresh does not repeat it.
  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    if (consumedToastRef.current !== toastMessage) {
      consumedToastRef.current = toastMessage;
      toast.success(toastMessage);
    }

    router.replace("/admin/products", { scroll: false });
  }, [toastMessage, router]);

  const filtered = products.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.categoryName?.toLowerCase().includes(q) ?? false) ||
      (p.sku?.toLowerCase().includes(q) ?? false)
    );
  });

  function handlePublish(productId: string) {
    startTransition(async () => {
      const result = await updateCatalogProductStatusAction(productId, "active");
      if (result.success) {
        toast.success("Product published.");
      } else {
        toast.error(result.error ?? "Could not publish product.");
      }
    });
  }

  function handleArchive(productId: string) {
    startTransition(async () => {
      const result = await updateCatalogProductStatusAction(productId, "archived");
      if (result.success) {
        toast.success("Product archived.");
      } else {
        toast.error(result.error ?? "Could not archive product.");
      }
    });
  }

  function handleDelete(productId: string) {
    startTransition(async () => {
      const result = await deleteDraftCatalogProductAction(productId);
      if (result.success) {
        toast.success("Product deleted.");
      } else {
        toast.error(result.error ?? "Could not delete product.");
      }
      setConfirmDeleteId(null);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Products
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {products.length} {products.length === 1 ? "product" : "products"} in catalog
            </p>
          </div>
          <Button
            asChild
            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm h-9"
          >
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <Search className="h-4 w-4 shrink-0 text-zinc-400" />
          <Input
            placeholder="Search by name, brand, category, or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 placeholder:text-zinc-400"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <Table>
            <TableHeader className="bg-zinc-50/50 dark:bg-zinc-950/50">
              <TableRow className="border-zinc-200 hover:bg-transparent dark:border-zinc-800">
                <TableHead className="w-14">Image</TableHead>
                <TableHead className="min-w-[200px]">Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-zinc-400">
                      <Package className="h-10 w-10" />
                      {products.length === 0 ? (
                        <>
                          <p className="font-medium text-zinc-700 dark:text-zinc-300">
                            No products yet
                          </p>
                          <p className="text-sm">Add your first product to get started.</p>
                          <Button asChild size="sm" className="mt-1">
                            <Link href="/admin/products/new">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Product
                            </Link>
                          </Button>
                        </>
                      ) : (
                        <p className="text-sm">No products match your search.</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((product) => {
                  const isLowStock =
                    product.stockQuantity > 0 &&
                    product.stockQuantity <= product.lowStockThreshold;

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
                      <TableCell className="text-sm text-zinc-500 dark:text-zinc-400">
                        {product.categoryName ?? (
                          <span className="italic text-zinc-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_STYLES[product.status]}>
                          {STATUS_LABELS[product.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(product.priceCents, product.currency)}
                        {product.compareAtPriceCents && (
                          <p className="text-xs text-zinc-400 line-through">
                            {formatPrice(product.compareAtPriceCents, product.currency)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            isLowStock
                              ? "font-medium text-amber-600 dark:text-amber-400"
                              : ""
                          }
                        >
                          {product.stockQuantity}
                        </span>
                        {isLowStock && (
                          <p className="text-xs text-amber-600 dark:text-amber-400">Low</p>
                        )}
                        {product.stockQuantity === 0 && (
                          <p className="text-xs text-red-500">Out of stock</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {product.isFeatured && (
                            <Badge variant="outline" className="text-xs py-0">
                              Featured
                            </Badge>
                          )}
                          {product.isNewArrival && (
                            <Badge variant="outline" className="text-xs py-0">
                              New
                            </Badge>
                          )}
                          {product.isPopular && (
                            <Badge variant="outline" className="text-xs py-0">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              disabled={isPending}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/products/${product.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>

                            {(product.status === "draft" ||
                              product.status === "archived") && (
                              <DropdownMenuItem
                                onClick={() => handlePublish(product.id)}
                                disabled={isPending}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                                Publish
                              </DropdownMenuItem>
                            )}

                            {(product.status === "active" ||
                              product.status === "draft") && (
                              <DropdownMenuItem
                                onClick={() => handleArchive(product.id)}
                                disabled={isPending}
                              >
                                <Archive className="mr-2 h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                            )}

                            {product.status === "draft" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setConfirmDeleteId(product.id)}
                                  disabled={isPending}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete draft product?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the product and its media links. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              {isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
