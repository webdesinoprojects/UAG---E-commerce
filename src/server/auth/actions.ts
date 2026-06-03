"use server";

import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseAnonServerClient } from "@/server/db/supabase";
import { getAdminFromAccessToken } from "@/server/auth/admin";
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_AUTH_COOKIE_PATH,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_MAX_AGE,
  getAccessTokenMaxAge,
  getAdminAuthCookieOptions,
} from "@/server/auth/cookies";
import { adminLoginSchema } from "@/server/validators/auth";

export interface AdminLoginState {
  next: string;
  message: string | null;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
}

export async function signInAdminAction(
  previousState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") ?? previousState.next,
  });

  if (!parsed.success) {
    return {
      next: previousState.next,
      message: "Check the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = createSupabaseAnonServerClient();

  if (!supabase) {
    return {
      next: parsed.data.next,
      message: "Auth is not configured on this server.",
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.session) {
    return {
      next: parsed.data.next,
      message: "Invalid admin credentials.",
    };
  }

  const admin = await getAdminFromAccessToken(data.session.access_token);

  if (!admin) {
    return {
      next: parsed.data.next,
      message: "This account does not have admin access.",
    };
  }

  const cookieStore = await cookies();

  // Set the active session cookies at `path=/` so `/api/admin/*` receives them.
  // Any older `path=/admin` cookies cannot be deleted in this same response (the
  // cookie store is keyed by name and rewrites the whole Set-Cookie header, so a
  // same-name delete+set collapses); the proxy expires legacy `/admin` cookies
  // on the next admin request instead.
  cookieStore.set(
    ADMIN_ACCESS_TOKEN_COOKIE,
    data.session.access_token,
    getAdminAuthCookieOptions(getAccessTokenMaxAge(data.session.expires_in))
  );

  cookieStore.set(
    ADMIN_REFRESH_TOKEN_COOKIE,
    data.session.refresh_token,
    getAdminAuthCookieOptions(ADMIN_REFRESH_TOKEN_MAX_AGE)
  );

  redirect(parsed.data.next);
}

export async function signOutAdminAction() {
  const cookieStore = await cookies();

  // Delete the active `path=/` session cookies. We can only reliably expire one
  // path per cookie name in a single response (the store is name-keyed and
  // rewrites the whole Set-Cookie header), so we clear the active path here; the
  // proxy expires any leftover legacy `/admin` cookies on the next request.
  cookieStore.delete({
    name: ADMIN_ACCESS_TOKEN_COOKIE,
    path: ADMIN_AUTH_COOKIE_PATH,
  });
  cookieStore.delete({
    name: ADMIN_REFRESH_TOKEN_COOKIE,
    path: ADMIN_AUTH_COOKIE_PATH,
  });

  redirect("/admin/login");
}
