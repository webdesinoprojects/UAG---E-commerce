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

  // Cookies were set with `path=/admin`, so delete with the same path or the
  // browser keeps the stale cookie and the admin appears logged in.
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
