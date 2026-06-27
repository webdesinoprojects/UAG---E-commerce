import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  createSupabaseAnonServerClient,
  createSupabaseUserServerClient,
} from "@/server/db/supabase";
import { CUSTOMER_ACCESS_TOKEN_COOKIE } from "@/lib/customer-auth-cookies";

export interface CustomerSession {
  id: string;
  email: string;
  displayName: string | null;
  role: "customer" | "admin" | "super_admin";
}

function toCustomerSession(profile: {
  id: string;
  email: string;
  display_name: string | null;
  role: "customer" | "admin" | "super_admin";
} | null): CustomerSession | null {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.display_name,
    role: profile.role,
  };
}

export async function getCustomerFromAccessToken(
  accessToken: string
): Promise<CustomerSession | null> {
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

  return toCustomerSession(profile);
}

export const getCurrentCustomer = cache(async () => {
  await connection();

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(CUSTOMER_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  return getCustomerFromAccessToken(accessToken);
});

export async function requireCustomer() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/auth/login?next=/account");
  }

  return customer;
}
