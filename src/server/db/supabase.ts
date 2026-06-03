import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabasePublicEnv, getSupabaseServiceEnv } from "./env";

const QUERY_TIMEOUT_MS = 4_000;

function fetchWithTimeout(timeoutMs: number): typeof fetch {
  return async (input, init) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(input, {
        ...init,
        signal: init?.signal ?? controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  };
}

const serverClientOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
  global: {
    fetch: fetchWithTimeout(QUERY_TIMEOUT_MS),
  },
};

export function createSupabaseAnonServerClient() {
  const env = getSupabasePublicEnv();

  if (!env) {
    return null;
  }

  return createClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    serverClientOptions
  );
}

export function createSupabaseUserServerClient(accessToken: string) {
  const env = getSupabasePublicEnv();

  if (!env) {
    return null;
  }

  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    ...serverClientOptions,
    global: {
      ...serverClientOptions.global,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

export function createSupabaseServiceRoleClient() {
  const env = getSupabaseServiceEnv();

  if (!env) {
    return null;
  }

  return createClient<Database>(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    serverClientOptions
  );
}
