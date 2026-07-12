import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/expo";
import { apiFetch } from "../services/api";

/**
 * The signed-in account's Quipay ID (e.g. "QP100000204") + email, from the
 * backend. Every account has one, minted on first login — it's the identity
 * an employer uses to add this worker to a stream.
 */
export function useQuipayId() {
  const { getAccessToken, user } = usePrivy();
  const [quipayId, setQuipayId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/accounts/me", () => getAccessToken());
        if (!res.ok) return;
        const data = (await res.json()) as {
          quipayId: string;
          email: string | null;
        };
        if (!cancelled) {
          setQuipayId(data.quipayId);
          setEmail(data.email);
        }
      } catch {
        // non-fatal
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, getAccessToken]);

  return { quipayId, email };
}
