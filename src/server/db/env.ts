import "server-only";

import { z } from "zod";

const publicSupabaseEnvSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(20),
});

const serviceSupabaseEnvSchema = publicSupabaseEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
});

export function getSupabasePublicEnv() {
  const parsed = publicSupabaseEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

export function getSupabaseServiceEnv() {
  const parsed = serviceSupabaseEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}
