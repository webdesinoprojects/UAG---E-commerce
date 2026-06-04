"use server";

import "server-only";

import { revalidatePath, updateTag } from "next/cache";
import { CATALOG_CATEGORIES_CACHE_TAG } from "@/features/catalog/queries";
import { requireAdmin } from "@/server/auth/admin";
import { upsertCatalogCategory } from "@/server/repositories/catalog-repository";
import { parseCatalogCategoryForm } from "@/server/validators/catalog";

export interface CatalogActionState {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Record<string, string[] | undefined>;
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
