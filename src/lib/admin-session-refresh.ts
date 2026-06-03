import { z } from "zod";

// Edge-safe helper for hitting Supabase Auth's refresh endpoint from the
// proxy. We deliberately do not use `@supabase/supabase-js` here so the
// proxy stays light and free of `server-only` imports.

const supabaseRefreshResponseSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  expires_in: z.number().int().positive().optional(),
});

export type SupabaseRefreshResponse = z.infer<
  typeof supabaseRefreshResponseSchema
>;

const REFRESH_TIMEOUT_MS = 4_000;

export interface RefreshAdminSessionInput {
  supabaseUrl: string;
  anonKey: string;
  refreshToken: string;
}

export async function refreshAdminSession(
  input: RefreshAdminSessionInput
): Promise<SupabaseRefreshResponse | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${input.supabaseUrl.replace(/\/$/, "")}/auth/v1/token?grant_type=refresh_token`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          apikey: input.anonKey,
          authorization: `Bearer ${input.anonKey}`,
        },
        body: JSON.stringify({ refresh_token: input.refreshToken }),
        signal: controller.signal,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const json: unknown = await response.json();
    const parsed = supabaseRefreshResponseSchema.safeParse(json);

    if (!parsed.success) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
