"use server";

import "server-only";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import {
  CATALOG_CATEGORIES_CACHE_TAG,
  CATALOG_PRODUCTS_CACHE_TAG,
} from "@/features/catalog/queries";
import { requireAdmin } from "@/server/auth/admin";
import {
  upsertCatalogCategory,
  createCatalogProduct,
  updateCatalogProduct,
  updateCatalogProductStatus,
  deleteDraftCatalogProduct,
  updateCatalogProductMedia,
} from "@/server/repositories/catalog-repository";
import {
  parseCatalogCategoryForm,
  parseCatalogProductCreateForm,
  parseCatalogProductDraftMediaForm,
  parseCatalogProductMediaForm,
} from "@/server/validators/catalog";

// UUID regex for runtime validation of caller-supplied IDs.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Runtime schema for product status (fix: TypeScript type alone is not enough).
const productStatusSchema = z.enum(["draft", "active", "archived"]);

export interface CatalogMutationResult {
  success: boolean;
  error?: string;
}

export interface CatalogActionState {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Record<string, string[] | undefined>;
  productId?: string;
}

export async function upsertCatalogCategoryAction(
  _previousState: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const admin = await requireAdmin();
  const parsed = parseCatalogCategoryForm(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await upsertCatalogCategory(parsed.data, admin.id);
    updateTag(CATALOG_CATEGORIES_CACHE_TAG);
    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/");

    return {
      status: "success",
      message: "Category saved.",
    };
  } catch {
    return {
      status: "error",
      message: "Could not save the category. Check the slug and media selection.",
    };
  }
}

export async function createCatalogProductAction(
  _previousState: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const admin = await requireAdmin();
  const parsed = parseCatalogProductCreateForm(formData);
  const parsedMedia = parseCatalogProductDraftMediaForm(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!parsedMedia.success) {
    const firstMessage = parsedMedia.error.issues[0]?.message;
    return {
      status: "error",
      message: firstMessage ?? "Check the media items and try again.",
    };
  }

  try {
    await createCatalogProduct(parsed.data, admin.id, parsedMedia.data.items);
  } catch {
    return {
      status: "error",
      message: "Could not create the product. Check for duplicate slug or invalid data.",
    };
  }

  updateTag(CATALOG_PRODUCTS_CACHE_TAG);
  revalidatePath("/admin/products");
  // Server-side redirect keeps the RSC for /admin/products/new in an idle/empty
  // state in the router cache; prevents the cached success state from looping
  // when the user opens the new-product form a second time.
  redirect("/admin/products?created=1");
}

export async function updateCatalogProductAction(
  _previousState: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const admin = await requireAdmin();

  const productId = formData.get("productId")?.toString() ?? "";
  if (!productId || !UUID_RE.test(productId)) {
    return { status: "error", message: "Invalid product ID." };
  }

  const parsed = parseCatalogProductCreateForm(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await updateCatalogProduct(productId, parsed.data, admin.id);
  } catch {
    return {
      status: "error",
      message: "Could not update the product. Check for duplicate slug or invalid data.",
    };
  }

  updateTag(CATALOG_PRODUCTS_CACHE_TAG);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  redirect("/admin/products?updated=1");
}

export async function updateCatalogProductStatusAction(
  productId: string,
  status: string
): Promise<CatalogMutationResult> {
  const admin = await requireAdmin();

  if (!productId || !UUID_RE.test(productId)) {
    return { success: false, error: "Invalid product ID." };
  }

  // Runtime validation because TypeScript types are stripped at runtime.
  const statusResult = productStatusSchema.safeParse(status);
  if (!statusResult.success) {
    return { success: false, error: "Invalid product status." };
  }

  try {
    await updateCatalogProductStatus(productId, statusResult.data, admin.id);
  } catch {
    return { success: false, error: "Could not update product status." };
  }

  updateTag(CATALOG_PRODUCTS_CACHE_TAG);
  revalidatePath("/admin/products");

  return { success: true };
}

export async function deleteDraftCatalogProductAction(
  productId: string
): Promise<CatalogMutationResult> {
  await requireAdmin();

  if (!productId || !UUID_RE.test(productId)) {
    return { success: false, error: "Invalid product ID." };
  }

  try {
    await deleteDraftCatalogProduct(productId);
  } catch {
    return {
      success: false,
      error: "Could not delete product. Only draft products can be deleted.",
    };
  }

  updateTag(CATALOG_PRODUCTS_CACHE_TAG);
  revalidatePath("/admin/products");

  return { success: true };
}

export async function updateCatalogProductMediaAction(
  _previousState: CatalogActionState,
  formData: FormData
): Promise<CatalogActionState> {
  const admin = await requireAdmin();

  const parsed = parseCatalogProductMediaForm(formData);

  if (!parsed.success) {
    const firstMessage = parsed.error.issues[0]?.message;
    return {
      status: "error",
      message: firstMessage ?? "Check the media items and try again.",
    };
  }

  const productId = parsed.data.productId;

  try {
    await updateCatalogProductMedia(productId, parsed.data, admin.id);
  } catch {
    return {
      status: "error",
      message: "Could not update product media. Check media selection and types.",
    };
  }

  updateTag(CATALOG_PRODUCTS_CACHE_TAG);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);

  return {
    status: "success",
    message: "Media saved.",
  };
}
