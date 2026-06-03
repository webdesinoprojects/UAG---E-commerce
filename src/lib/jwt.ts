// Edge-safe JWT helper.
//
// Used only to peek at the `exp` claim of a JWT so the proxy can decide
// whether to attempt a Supabase refresh before the access token rotates.
// This is NOT authorization. Real validation happens server-side via
// `supabase.auth.getUser(accessToken)` in `requireAdmin()`.

export function getJwtExpiryMs(token: string): number | null {
  if (typeof token !== "string" || token.length === 0) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = decodeBase64UrlJson(parts[1]);
    const exp = payload?.exp;

    if (typeof exp !== "number" || !Number.isFinite(exp)) {
      return null;
    }

    return exp * 1000;
  } catch {
    return null;
  }
}

export function isJwtExpiredOrNearExpiry(
  token: string | undefined,
  skewSeconds = 60
): boolean {
  if (!token) {
    return true;
  }

  const expMs = getJwtExpiryMs(token);

  // Malformed token is treated as expired so the proxy attempts refresh
  // (or redirects to login if no refresh token is present).
  if (expMs === null) {
    return true;
  }

  return Date.now() >= expMs - skewSeconds * 1000;
}

function decodeBase64UrlJson(input: string): { exp?: unknown } | null {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "===".slice((base64.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  const parsed: unknown = JSON.parse(json);

  if (parsed === null || typeof parsed !== "object") {
    return null;
  }

  return parsed as { exp?: unknown };
}
