import "server-only";

import { z } from "zod";

const safeAdminRedirectSchema = z
  .string()
  .optional()
  .catch(undefined)
  .transform((value) => {
    if (!value || !value.startsWith("/") || value.startsWith("//")) {
      return "/admin";
    }

    if (!value.startsWith("/admin") || value.startsWith("/admin/login")) {
      return "/admin";
    }

    return value;
  });

export const adminLoginSchema = z.object({
  email: z.email().trim().toLowerCase().max(254),
  password: z.string().min(8).max(128),
  next: safeAdminRedirectSchema,
});

export function getSafeAdminRedirect(value: unknown) {
  return safeAdminRedirectSchema.parse(
    typeof value === "string" ? value : undefined
  );
}
