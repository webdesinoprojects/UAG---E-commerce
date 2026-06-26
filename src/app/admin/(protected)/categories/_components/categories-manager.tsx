"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  FolderTree,
  ImageIcon,
  Plus,
  Save,
} from "lucide-react";
import { upsertCatalogCategoryAction } from "@/features/catalog/actions";
import type { CatalogCategoryDto } from "@/features/catalog/types";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface CategoriesManagerProps {
  categories: CatalogCategoryDto[];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function createDraftCategory(existingCount: number): CatalogCategoryDto {
  const sortOrder = existingCount > 0 ? (existingCount + 1) * 10 : 10;

  return {
    id: "",
    parentId: null,
    name: "New Category",
    slug: `new-category-${Date.now().toString().slice(-5)}`,
    description: "",
    mediaAssetId: null,
    mediaUrl: null,
    bannerMediaAssetId: null,
    bannerMediaUrl: null,
    sortOrder,
    isActive: true,
    isFeatured: false,
    seoTitle: "",
    seoDescription: "",
    productCount: 0,
    createdAt: "",
    updatedAt: "",
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-xs text-destructive">{message}</p>;
}

export default function CategoriesManager({
  categories,
}: CategoriesManagerProps) {
  const [state, action, isPending] = useActionState(upsertCatalogCategoryAction, {
    status: "idle",
    message: null,
  });
  const [items, setItems] = useState<CatalogCategoryDto[]>(categories);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedCategory = items[selectedIndex] ?? null;

  const updateSelected = (updates: Partial<CatalogCategoryDto>) => {
    setItems((current) =>
      current.map((item, index) =>
        index === selectedIndex ? { ...item, ...updates } : item
      )
    );
  };

  const addCategory = () => {
    const draft = createDraftCategory(items.length);
    setItems((current) => [...current, draft]);
    setSelectedIndex(items.length);
  };

  return (
    <form action={action} className="flex flex-col gap-6 pb-20">
      {selectedCategory ? (
        <>
          <input type="hidden" name="id" value={selectedCategory.id} />
          <input type="hidden" name="parentId" value={selectedCategory.parentId ?? ""} />
          <input
            type="hidden"
            name="mediaAssetId"
            value={selectedCategory.mediaAssetId ?? ""}
          />
          <input
            type="hidden"
            name="bannerMediaAssetId"
            value={selectedCategory.bannerMediaAssetId ?? ""}
          />
          <input
            type="hidden"
            name="isActive"
            value={selectedCategory.isActive.toString()}
          />
          <input
            type="hidden"
            name="isFeatured"
            value={selectedCategory.isFeatured.toString()}
          />
        </>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
            <FolderTree className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
            <p className="text-sm text-muted-foreground">
              Manage catalog categories before building product creation.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={addCategory}>
            <Plus className="h-4 w-4" />
            New Category
          </Button>
          <Button type="submit" disabled={isPending || !selectedCategory}>
            <Save className="h-4 w-4" />
            {isPending ? "Saving..." : "Save Category"}
          </Button>
        </div>
      </div>

      {state.status === "error" && state.message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state.status === "success" && state.message && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Category List</CardTitle>
              <CardDescription>
                Seeded from the catalog migration, editable here.
              </CardDescription>
            </div>
            <Badge variant="outline">{items.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No categories yet. Add one to begin.
              </div>
            )}

            {items.map((category, index) => (
              <button
                key={category.id || `${category.slug}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                  selectedIndex === index
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted"
                }`}
              >
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                  {category.mediaUrl ? (
                    <Image
                      src={category.mediaUrl}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{category.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    /categories/{category.slug}
                  </p>
                </div>
                <Badge variant={category.isActive ? "default" : "secondary"}>
                  {category.isActive ? "Live" : "Hidden"}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Editor</CardTitle>
            <CardDescription>
              Product creation will use these categories for assignment and filters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedCategory ? (
              <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                Select or create a category.
              </div>
            ) : (
              <div className="grid gap-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Name</Label>
                    <Input
                      name="name"
                      value={selectedCategory.name}
                      onChange={(event) => {
                        const name = event.target.value;
                        updateSelected({
                          name,
                          slug: selectedCategory.id
                            ? selectedCategory.slug
                            : slugify(name),
                        });
                      }}
                    />
                    <FieldError message={state.fieldErrors?.name?.[0]} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Slug</Label>
                    <Input
                      name="slug"
                      value={selectedCategory.slug}
                      onChange={(event) =>
                        updateSelected({ slug: slugify(event.target.value) })
                      }
                    />
                    <FieldError message={state.fieldErrors?.slug?.[0]} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Textarea
                    name="description"
                    value={selectedCategory.description}
                    onChange={(event) =>
                      updateSelected({ description: event.target.value })
                    }
                    maxLength={500}
                  />
                </div>

                <div className="grid gap-4">
                  <div className="max-w-40 space-y-1.5">
                    <Label>Sort Order</Label>
                    <Input
                      name="sortOrder"
                      type="number"
                      value={selectedCategory.sortOrder}
                      onChange={(event) =>
                        updateSelected({
                          sortOrder: Number(event.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    <div className="min-w-0 rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="category-active">Category active</Label>
                        <Switch
                          id="category-active"
                          className="shrink-0"
                          checked={selectedCategory.isActive}
                          onCheckedChange={(checked) =>
                            updateSelected({ isActive: checked })
                          }
                        />
                      </div>
                      <p className="mt-2 text-[11px] leading-4 text-muted-foreground/75">
                        Hidden categories will not show publicly.
                      </p>
                    </div>
                    <div className="min-w-0 rounded-lg border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <Label htmlFor="category-featured">Featured</Label>
                        <Switch
                          id="category-featured"
                          className="shrink-0"
                          checked={selectedCategory.isFeatured}
                          onCheckedChange={(checked) =>
                            updateSelected({ isFeatured: checked })
                          }
                        />
                      </div>
                      <p className="mt-2 text-[11px] leading-4 text-muted-foreground/75">
                        Show in the homepage Shop by Tech Category section.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category Image</Label>
                    <MediaPickerModal
                      allowedTypes="image"
                      selectedAssetId={selectedCategory.mediaAssetId}
                      onSelect={(asset) =>
                        updateSelected({
                          mediaAssetId: asset?.id ?? null,
                          mediaUrl: asset?.url ?? null,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Banner Image</Label>
                    <MediaPickerModal
                      allowedTypes="image"
                      selectedAssetId={selectedCategory.bannerMediaAssetId}
                      onSelect={(asset) =>
                        updateSelected({
                          bannerMediaAssetId: asset?.id ?? null,
                          bannerMediaUrl: asset?.url ?? null,
                        })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>SEO Title</Label>
                    <Input
                      name="seoTitle"
                      value={selectedCategory.seoTitle}
                      onChange={(event) =>
                        updateSelected({ seoTitle: event.target.value })
                      }
                      maxLength={80}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>SEO Description</Label>
                    <Input
                      name="seoDescription"
                      value={selectedCategory.seoDescription}
                      onChange={(event) =>
                        updateSelected({ seoDescription: event.target.value })
                      }
                      maxLength={180}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="xl:sticky xl:top-8 xl:self-start">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              How this category will read in admin and storefront links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCategory ? (
              <div className="space-y-4">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
                  {selectedCategory.bannerMediaUrl || selectedCategory.mediaUrl ? (
                    <Image
                      src={selectedCategory.bannerMediaUrl ?? selectedCategory.mediaUrl ?? ""}
                      alt={selectedCategory.name}
                      fill
                      className="object-cover"
                      sizes="360px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <Badge className="mb-2">
                      {selectedCategory.productCount} Products
                    </Badge>
                    <h3 className="text-xl font-black uppercase">
                      {selectedCategory.name}
                    </h3>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory.description || "No description added yet."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 w-full"
                    asChild
                  >
                    <Link
                      href={`/categories/${selectedCategory.slug}`}
                      target="_blank"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open storefront URL
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
                No category selected.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
