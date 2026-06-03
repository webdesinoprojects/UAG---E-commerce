import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  createSupabaseAnonServerClient,
  createSupabaseUserServerClient,
} from "@/server/db/supabase";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "./cookies";

export interface AdminSession {
  id: string;
  email: string;
  displayName: string | null;
  role: "admin" | "super_admin";
}

function toAdminSession(profile: {
  id: string;
  email: string;
  display_name: string | null;
  role: "customer" | "admin" | "super_admin";
} | null): AdminSession | null {
  if (
    !profile ||
    (profile.role !== "admin" && profile.role !== "super_admin")
  ) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.display_name,
    role: profile.role,
  };
}

export async function getAdminFromAccessToken(
  accessToken: string
): Promise<AdminSession | null> {
  const authClient = createSupabaseAnonServerClient();

  if (!authClient) {
    return null;
  }

  const { data: userResult, error: userError } =
    await authClient.auth.getUser(accessToken);

  if (userError || !userResult.user) {
    return null;
  }

  const userClient = createSupabaseUserServerClient(accessToken);

  if (!userClient) {
    return null;
  }

  const { data: profile, error: profileError } = await userClient
    .from("profiles")
    .select("id,email,display_name,role")
    .eq("id", userResult.user.id)
    .maybeSingle();

  if (profileError) {
    return null;
  }

  return toAdminSession(profile);
}

export const getCurrentAdmin = cache(async () => {
  await connection();

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  return getAdminFromAccessToken(accessToken);
});

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
