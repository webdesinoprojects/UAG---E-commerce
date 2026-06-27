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

const safeCustomerRedirectSchema = z
  .string()
  .optional()
  .catch(undefined)
  .transform((value) => {
    if (!value || !value.startsWith("/") || value.startsWith("//")) {
      return "/account";
    }

    if (
      value.startsWith("/admin") ||
      value.startsWith("/api") ||
      value.startsWith("/auth/login") ||
      value.startsWith("/auth/register")
    ) {
      return "/account";
    }

    return value;
  });

const customerPasswordSchema = z
  .string()
  .min(8, { error: "Password must be at least 8 characters." })
  .max(128, { error: "Password must be 128 characters or fewer." })
  .regex(/[A-Za-z]/, { error: "Password must include a letter." })
  .regex(/[0-9]/, { error: "Password must include a number." });

export const customerLoginSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }).trim().toLowerCase().max(254),
  password: z.string().min(8, { error: "Enter your password." }).max(128),
  next: safeCustomerRedirectSchema,
});

export const customerRegisterSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { error: "Name must be at least 2 characters." })
      .max(80, { error: "Name must be 80 characters or fewer." }),
    email: z.email({ error: "Enter a valid email address." }).trim().toLowerCase().max(254),
    password: customerPasswordSchema,
    confirmPassword: z.string().min(1, { error: "Confirm your password." }),
    next: safeCustomerRedirectSchema,
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    error: "Passwords do not match.",
  });

export function getSafeCustomerRedirect(value: unknown) {
  return safeCustomerRedirectSchema.parse(
    typeof value === "string" ? value : undefined
  );
}
