const API_BASE =
  (process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

/**
 * Authenticated fetch wrapper.
 * Calls getToken() to get the current Privy JWT and attaches it as a Bearer token.
 * Pass the `getAccessToken` function from `usePrivy()` as the second argument.
 */
export async function apiFetch(
  path: string,
  getToken: () => Promise<string | null>,
  options: RequestInit = {},
): Promise<Response> {
  const token = await getToken();
  const baseHeaders: Record<string, string> = { "Content-Type": "application/json" };
  if (token) baseHeaders["Authorization"] = `Bearer ${token}`;

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...baseHeaders, ...(options.headers as Record<string, string> | undefined) },
  });
}

/**
 * Unauthenticated fetch — for public endpoints that only need the worker's
 * Stellar address as a query param (e.g., /api/employers/withdrawal-events).
 */
export async function publicFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers as Record<string, string> | undefined) },
  });
}
