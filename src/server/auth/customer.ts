import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  createSupabaseAnonServerClient,
  createSupabaseUserServerClient,
} from "@/server/db/supabase";
import {
  CUSTOMER_ACCESS_TOKEN_COOKIE,
  CUSTOMER_REFRESH_TOKEN_COOKIE,
} from "@/lib/customer-auth-cookies";
import { isJwtExpiredOrNearExpiry } from "@/lib/jwt";
import { getSupabasePublicEnv } from "@/server/db/env";
import { setCustomerSessionCookies } from "@/server/auth/customer-session-cookies";

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

async function refreshCustomerSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(CUSTOMER_REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return null;
  }

  const env = getSupabasePublicEnv();

  if (!env) {
    return null;
  }

  try {
    const response = await fetch(
      `${env.SUPABASE_URL.replace(/\/$/, "")}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          apikey: env.SUPABASE_ANON_KEY,
          authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };

    if (!json.access_token || !json.refresh_token) {
      return null;
    }

    await setCustomerSessionCookies({
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresIn: json.expires_in,
    });

    return json.access_token;
  } catch {
    return null;
  }
}

export async function getCurrentCustomer() {
  await connection();

  const cookieStore = await cookies();
  let accessToken = cookieStore.get(CUSTOMER_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  if (isJwtExpiredOrNearExpiry(accessToken, 60)) {
    const refreshed = await refreshCustomerSession();
    if (refreshed) {
      accessToken = refreshed;
    }
  }

  return getCustomerFromAccessToken(accessToken);
}

export async function requireCustomer() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/auth/login?next=/account");
  }

  return customer;
}
