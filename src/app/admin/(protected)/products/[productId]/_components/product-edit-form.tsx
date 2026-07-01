"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ImageIcon,
  Package,
  Save,
  Tag,
  X,
} from "lucide-react";
import { updateCatalogProductAction } from "@/features/catalog/actions";
import type {
  AdminProductDetailDto,
  AdminProductFormCategoryOption,
} from "@/features/catalog/types";
import { MediaPickerModal } from "@/features/media/components/media-picker-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface ProductEditFormProps {
  product: AdminProductDetailDto;
  categoryOptions: AdminProductFormCategoryOption[];
}

interface FormState {
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  brand: string;
  shortDescription: string;
  description: string;
  priceRupees: string;
  compareAtPriceRupees: string;
  currency: string;
  stockQuantity: string;
  lowStockThreshold: string;
  status: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isPopular: boolean;
  seoTitle: string;
  seoDescription: string;
  primaryMediaAssetId: string;
  primaryImageUrl: string | null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function formatPreviewPrice(rupees: string, currency: string) {
  const n = parseFloat(rupees);
  if (isNaN(n) || n < 0) return null;
  if (currency === "INR") return `₹${n.toLocaleString("en-IN")}`;
  return `${currency} ${n.toFixed(2)}`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function buildInitialState(product: AdminProductDetailDto): FormState {
  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku ?? "",
    categoryId: product.categoryId ?? "",
    brand: product.brand,
    shortDescription: product.shortDescription,
    description: product.description,
    priceRupees: product.priceCents > 0 ? (product.priceCents / 100).toString() : "",
    compareAtPriceRupees: product.compareAtPriceCents
      ? (product.compareAtPriceCents / 100).toString()
      : "",
    currency: product.currency,
    stockQuantity: product.stockQuantity.toString(),
    lowStockThreshold: product.lowStockThreshold.toString(),
    status: product.status,
    isFeatured: product.isFeatured,
    isNewArrival: product.isNewArrival,
    isPopular: product.isPopular,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    primaryMediaAssetId: product.primaryMediaAssetId ?? "",
    primaryImageUrl: product.primaryImageUrl,
  };
}

export default function ProductEditForm({
  product,
  categoryOptions,
}: ProductEditFormProps) {
  const [state, action, isPending] = useActionState(updateCatalogProductAction, {
    status: "idle",
    message: null,
  });

  const [form, setForm] = useState<FormState>(() => buildInitialState(product));

  const selectedCategory = categoryOptions.find((c) => c.id === form.categoryId);

  const update = (patch: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const fe = state.fieldErrors ?? {};

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as
      | HTMLElement
      | null;

    if (submitter?.dataset.productSaveSubmit !== "true") {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit} className="flex flex-col gap-6 pb-20">
      {/* Hidden inputs */}
      <input type="hidden" name="productId" value={product.id} />
      <input type="hidden" name="status" value={form.status} />
      <input type="hidden" name="categoryId" value={form.categoryId} />
      <input type="hidden" name="isFeatured" value={String(form.isFeatured)} />
      <input type="hidden" name="isNewArrival" value={String(form.isNewArrival)} />
      <input type="hidden" name="isPopular" value={String(form.isPopular)} />
      <input type="hidden" name="primaryMediaAssetId" value={form.primaryMediaAssetId} />

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="icon" asChild className="h-9 w-9 shrink-0">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{product.name}</h1>
            <p className="text-sm text-muted-foreground">
              Edit product · ID: {product.id.slice(0, 8)}…
            </p>
          </div>
        </div>
        <Button
          type="submit"
          data-product-save-submit="true"
          disabled={isPending}
          className="lg:w-auto"
        >
          <Save className="h-4 w-4" />
          {isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>

      {state.status === "error" && state.message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* ── Left column: editor cards ── */}
        <div className="flex flex-col gap-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={(e) => update({ name: e.target.value })}
                  maxLength={200}
                />
                <FieldError message={fe.name?.[0]} />
              </div>

              <div className="space-y-1.5">
                <Label>Slug *</Label>
                <Input
                  name="slug"
                  value={form.slug}
                  onChange={(e) => update({ slug: slugify(e.target.value) })}
                  maxLength={100}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  /products/{form.slug}
                </p>
                <FieldError message={fe.slug?.[0]} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Brand</Label>
                  <Input
                    name="brand"
                    value={form.brand}
                    onChange={(e) => update({ brand: e.target.value })}
                    maxLength={100}
                  />
                  <FieldError message={fe.brand?.[0]} />
                </div>
                <div className="space-y-1.5">
                  <Label>SKU</Label>
                  <Input
                    name="sku"
                    value={form.sku}
                    onChange={(e) => update({ sku: e.target.value })}
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(v) =>
                      update({ categoryId: v === "__none__" ? "" : v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No category</SelectItem>
                      {categoryOptions.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={fe.categoryId?.[0]} />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => update({ status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active (Published)</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-1.5">
                <Label>Short Description</Label>
                <Textarea
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={(e) => update({ shortDescription: e.target.value })}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {form.shortDescription.length}/500
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Full Description</Label>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={(e) => update({ description: e.target.value })}
                  rows={6}
                  maxLength={5000}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing &amp; Inventory</CardTitle>
              <CardDescription>
                Enter prices in ₹ (rupees). Stored as paise internally.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Price (₹) *</Label>
                  <Input
                    name="priceRupees"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.priceRupees}
                    onChange={(e) => update({ priceRupees: e.target.value })}
                    placeholder="1199"
                  />
                  <FieldError message={fe.priceCents?.[0]} />
                </div>
                <div className="space-y-1.5">
                  <Label>Compare Price (₹)</Label>
                  <Input
                    name="compareAtPriceRupees"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.compareAtPriceRupees}
                    onChange={(e) => update({ compareAtPriceRupees: e.target.value })}
                    placeholder="Optional"
                  />
                  <FieldError message={fe.compareAtPriceCents?.[0]} />
                </div>
                <div className="space-y-1.5">
                  <Label>Currency</Label>
                  <Input
                    name="currency"
                    value={form.currency}
                    onChange={(e) =>
                      update({ currency: e.target.value.toUpperCase().slice(0, 3) })
                    }
                    maxLength={3}
                    className="uppercase"
                  />
                  <FieldError message={fe.currency?.[0]} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Stock Quantity</Label>
                  <Input
                    name="stockQuantity"
                    type="number"
                    min="0"
                    value={form.stockQuantity}
                    onChange={(e) => update({ stockQuantity: e.target.value })}
                  />
                  <FieldError message={fe.stockQuantity?.[0]} />
                </div>
                <div className="space-y-1.5">
                  <Label>Low Stock Threshold</Label>
                  <Input
                    name="lowStockThreshold"
                    type="number"
                    min="0"
                    value={form.lowStockThreshold}
                    onChange={(e) => update({ lowStockThreshold: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visibility & Flags */}
          <Card>
            <CardHeader>
              <CardTitle>Visibility &amp; Flags</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Switch
                  checked={form.isFeatured}
                  onCheckedChange={(v) => update({ isFeatured: v })}
                />
                <div>
                  <Label>Featured</Label>
                  <p className="text-xs text-muted-foreground">Shows in featured.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Switch
                  checked={form.isNewArrival}
                  onCheckedChange={(v) => update({ isNewArrival: v })}
                />
                <div>
                  <Label>New Arrival</Label>
                  <p className="text-xs text-muted-foreground">Shows in new arrivals.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Switch
                  checked={form.isPopular}
                  onCheckedChange={(v) => update({ isPopular: v })}
                />
                <div>
                  <Label>Popular</Label>
                  <p className="text-xs text-muted-foreground">Shows in popular.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Primary Image */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Image</CardTitle>
              <CardDescription>Thumbnail used in product lists and cards.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                  {form.primaryImageUrl ? (
                    <Image
                      src={form.primaryImageUrl}
                      alt="Primary product image"
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <MediaPickerModal
                    allowedTypes="image"
                    selectedAssetId={form.primaryMediaAssetId || null}
                    onSelect={(asset) =>
                      update({
                        primaryMediaAssetId: asset?.id ?? "",
                        primaryImageUrl: asset?.url ?? null,
                      })
                    }
                    trigger={
                      <Button type="button" variant="outline" size="sm">
                        {form.primaryMediaAssetId ? "Change Image" : "Select Image"}
                      </Button>
                    }
                  />
                  {form.primaryMediaAssetId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        update({ primaryMediaAssetId: "", primaryImageUrl: null })
                      }
                    >
                      <X className="mr-1 h-3 w-3" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-1.5">
                <Label>SEO Title</Label>
                <Input
                  name="seoTitle"
                  value={form.seoTitle}
                  onChange={(e) => update({ seoTitle: e.target.value })}
                  maxLength={80}
                  placeholder="Defaults to product name if empty"
                />
                <p className="text-xs text-muted-foreground">{form.seoTitle.length}/80</p>
              </div>
              <div className="space-y-1.5">
                <Label>SEO Description</Label>
                <Textarea
                  name="seoDescription"
                  value={form.seoDescription}
                  onChange={(e) => update({ seoDescription: e.target.value })}
                  maxLength={180}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {form.seoDescription.length}/180
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right column: preview ── */}
        <div className="flex flex-col gap-6">
          <Card className="lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How this product appears in lists.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
                {form.primaryImageUrl ? (
                  <Image
                    src={form.primaryImageUrl}
                    alt={form.name || "Product"}
                    fill
                    className="object-cover"
                    sizes="360px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute left-2 top-2">
                  <Badge
                    className={
                      form.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : form.status === "archived"
                        ? "bg-red-100 text-red-800"
                        : "bg-zinc-100 text-zinc-700"
                    }
                  >
                    {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
                  {form.name || (
                    <span className="italic text-muted-foreground">No name</span>
                  )}
                </p>
                {form.brand && (
                  <p className="text-sm text-muted-foreground">{form.brand}</p>
                )}
                {selectedCategory && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Tag className="h-3 w-3" />
                    {selectedCategory.name}
                  </p>
                )}
                {form.priceRupees && (
                  <p className="text-lg font-bold">
                    {formatPreviewPrice(form.priceRupees, form.currency)}
                    {form.compareAtPriceRupees && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground line-through">
                        {formatPreviewPrice(form.compareAtPriceRupees, form.currency)}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {(form.isFeatured || form.isNewArrival || form.isPopular) && (
                <>
                  <Separator />
                  <div className="flex flex-wrap gap-1">
                    {form.isFeatured && <Badge variant="outline">Featured</Badge>}
                    {form.isNewArrival && <Badge variant="outline">New Arrival</Badge>}
                    {form.isPopular && <Badge variant="outline">Popular</Badge>}
                  </div>
                </>
              )}

              {form.seoTitle && (
                <>
                  <Separator />
                  <div className="space-y-1 rounded-lg bg-muted p-3 text-xs">
                    <p className="truncate font-medium text-blue-600">{form.seoTitle}</p>
                    <p className="truncate text-xs text-emerald-700">
                      yourdomain.com/products/{form.slug}
                    </p>
                    {form.seoDescription && (
                      <p className="line-clamp-2 text-muted-foreground">
                        {form.seoDescription}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 z-10 -mx-6 border-t bg-white/95 px-6 py-3 backdrop-blur-sm dark:bg-zinc-950/95 md:-mx-8 md:px-8">
        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/products">Back to Products</Link>
          </Button>
          <Button
            type="submit"
            data-product-save-submit="true"
            disabled={isPending}
          >
            <Save className="h-4 w-4" />
            {isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
