import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createSupabaseServiceRoleClient } from "@/server/db/supabase";

function fingerprint(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function enforceRateLimit(scope: string, limit: number, windowSeconds: number) {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const identity = forwarded || requestHeaders.get("x-real-ip") || "unknown";
  const key = `${scope}:${fingerprint(identity)}`;
  const client = createSupabaseServiceRoleClient();
  if (!client) throw new Error("Rate limiting is temporarily unavailable.");
  const { data, error } = await client.rpc("consume_api_rate_limit", {
    p_bucket_key: key, p_limit: limit, p_window_seconds: windowSeconds,
  });
  if (error) throw new Error("Rate limiting is temporarily unavailable.");
  if (data !== true) {
    throw new Error("Too many requests. Please wait and try again.");
  }
}
