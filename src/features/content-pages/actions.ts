"use server";

import "server-only";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/server/auth/admin";
import { writeContentPage } from "@/server/repositories/content-pages-repository";
import { parseContentPageForm } from "@/server/validators/content-pages";
import { CONTENT_PAGES_CACHE_TAG } from "./queries";

export interface ContentPageActionState {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: Record<string, string[] | undefined>;
}

export async function updateContentPageAction(
  _previousState: ContentPageActionState,
  formData: FormData
): Promise<ContentPageActionState> {
  const admin = await requireAdmin();
  const parsed = parseContentPageForm(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await writeContentPage(parsed.data, admin.id);
    updateTag(CONTENT_PAGES_CACHE_TAG);
    updateTag(`content-page-${parsed.data.key}`);
    revalidatePath(parsed.data.key === "home-info" ? "/" : `/${parsed.data.key}`);
    revalidatePath(`/admin/pages/${parsed.data.key}`);

    return {
      status: "success",
      message: "Content page published.",
    };
  } catch {
    return {
      status: "error",
      message: "Could not publish this page. Try again.",
    };
  }
}
