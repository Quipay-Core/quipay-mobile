import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { usePrivy, useEmbeddedEthereumWallet } from "@privy-io/expo";
import { useCreateWallet } from "@privy-io/expo/extended-chains";
import { apiFetch } from "../services/api";
import { MOCK_MODE } from "../services/mockData";

interface AuthUser {
  privyId:        string;
  email?:         string;
  name?:          string;
  profileImage?:  string;
  evmAddress:     string | null;   // Arc / Base (EVM) — one address serves any EVM chain
  stellarAddress: string | null;   // Stellar (Soroban)
}

interface AuthContextValue {
  user:          AuthUser | null;
  ready:         boolean;
  authenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user:          null,
  ready:         false,
  authenticated: false,
});

const MOCK_USER: AuthUser = {
  privyId:        "mock-user-001",
  email:          "tester@quipay.app",
  name:           "Test User",
  evmAddress:     "0x9f2a1B4c8e6D0a3F5b7C9e1D2a4B6c8E0f1A3C41",
  stellarAddress: "GBXMV5NIFCBKXPFPDUQLXAGJYERQXF7RT2LCIFSJQFKIZNIMJDKUJZ3",
};

/** Read an embedded wallet address for a chain from the Privy user's linked accounts. */
function findEmbedded(u: any, chain: "ethereum" | "stellar"): string | null {
  const accts = u?.linked_accounts as any[] | undefined;
  if (!accts) return null;
  const a = accts.find(
    (x) => x?.type === "wallet" && x?.connector_type === "embedded" && x?.chain_type === chain,
  );
  return a?.address ?? null;
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function RealAuthProvider({ children }: { children: ReactNode }) {
  const { user: privyUser, getAccessToken, ready: privyReady } = usePrivy() as any;
  const ethWallet = useEmbeddedEthereumWallet();
  const { createWallet } = useCreateWallet();

  const getTokenRef = useRef(getAccessToken);
  getTokenRef.current = getAccessToken; // always current, never a stale closure

  // Provisioning idempotency guards, keyed by Privy user id. Claimed synchronously
  // before the first await so a re-entry sees the claim and skips.
  const evmCreateGuard     = useRef<string | null>(null);
  const stellarCreateGuard = useRef<string | null>(null);
  const registerGuard      = useRef<string | null>(null); // last-POSTed uid|evm|stellar signature
  const provisionAbort     = useRef(false);
  const registerTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initTimer          = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [initialized, setInitialized] = useState(false);

  // Derived every render — linked_accounts is the single source of truth for both chains.
  const uid            = (privyUser?.id ?? null) as string | null;
  const evmAddress     = findEmbedded(privyUser, "ethereum");
  const stellarAddress = findEmbedded(privyUser, "stellar");

  // ── Effect A: ready gate ──────────────────────────────────────────────────
  useEffect(() => {
    if (initTimer.current) clearTimeout(initTimer.current);

    // Privy's own ready flag resolves as soon as the SDK has finished attempting
    // to restore a session, with or without a user.
    if (privyReady || privyUser) {
      setInitialized(true);
    } else {
      // Fallback: give Privy up to 5s on cold start in case ready is unavailable.
      initTimer.current = setTimeout(() => setInitialized(true), 5000);
    }

    return () => {
      if (initTimer.current) clearTimeout(initTimer.current);
    };
  }, [privyReady, privyUser]);

  // ── Effect B: provisioning (one-shot per login) ───────────────────────────
  // Keyed on [uid] only — the privyUser mutations that create()/createWallet()
  // cause do NOT re-fire this effect (uid is unchanged), so both wallets must be
  // provisioned sequentially within this single run.
  useEffect(() => {
    if (!uid) return;

    // Fresh identity → reset guards from any prior user.
    if (evmCreateGuard.current && evmCreateGuard.current !== uid) evmCreateGuard.current = null;
    if (stellarCreateGuard.current && stellarCreateGuard.current !== uid) stellarCreateGuard.current = null;

    provisionAbort.current = false;

    async function provision() {
      // EVM — config auto-create normally handles this; imperative create() is the fallback.
      if (!findEmbedded(privyUser, "ethereum") && evmCreateGuard.current !== uid) {
        evmCreateGuard.current = uid; // claim before await
        try {
          await ethWallet.create();
        } catch (err) {
          console.warn("[AuthContext] EVM wallet create failed, retrying once:", err);
          evmCreateGuard.current = null;
          await delay(800);
          if (provisionAbort.current) return;
          if (!findEmbedded(privyUser, "ethereum")) {
            evmCreateGuard.current = uid;
            try {
              await ethWallet.create();
            } catch (err2) {
              console.warn("[AuthContext] EVM wallet create failed again:", err2);
            }
          }
        }
      }

      if (provisionAbort.current) return;

      // Stellar — must be created imperatively (no createOnLogin for extended chains).
      if (!findEmbedded(privyUser, "stellar") && stellarCreateGuard.current !== uid) {
        stellarCreateGuard.current = uid; // claim before await
        try {
          await createWallet({ chainType: "stellar" });
        } catch (err) {
          console.warn("[AuthContext] Stellar wallet create failed, retrying once:", err);
          stellarCreateGuard.current = null;
          await delay(800);
          if (provisionAbort.current) return;
          if (!findEmbedded(privyUser, "stellar")) {
            stellarCreateGuard.current = uid;
            try {
              await createWallet({ chainType: "stellar" });
            } catch (err2) {
              console.warn("[AuthContext] Stellar wallet create failed again:", err2);
            }
          }
        }
      }
    }

    void provision().catch((err) => console.warn("[AuthContext] provision() error:", err));

    return () => {
      provisionAbort.current = true;
      if (registerTimer.current) clearTimeout(registerTimer.current);
      // Do NOT clear create guards here — they must survive the re-renders the wallet
      // creations trigger. They reset only when uid changes (above) or on explicit failure.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // ── Effect C: register with backend once addresses are known ──────────────
  useEffect(() => {
    if (!uid) return;

    const email =
      privyUser?.email?.address ??
      (privyUser as any)?.google?.email ??
      (privyUser as any)?.apple?.email ??
      null;

    const sig = `${uid}|${evmAddress ?? ""}|${stellarAddress ?? ""}`;
    if (registerGuard.current === sig) return;

    function post(signature: string) {
      registerGuard.current = signature;
      apiFetch("/workers/me/register", () => getTokenRef.current(), {
        method: "POST",
        body: JSON.stringify({
          walletBase:    evmAddress ?? null,
          walletStellar: stellarAddress ?? null,
          email,
        }),
      }).catch((err) => {
        // Allow a later retry (address change or remount) after a network failure.
        if (registerGuard.current === signature) registerGuard.current = null;
        console.warn("[AuthContext] worker register failed:", err);
      });
    }

    if (registerTimer.current) clearTimeout(registerTimer.current);

    if (evmAddress && stellarAddress) {
      // Fast path: both provisioned → register immediately.
      post(sig);
    } else {
      // Bounded wait: provisioning may still be in flight. Fire once with whatever
      // exists (backend COALESCE-safe). Re-arming on each address change means the
      // last timer closes over the freshest values; the both-present branch pre-empts.
      registerTimer.current = setTimeout(() => post(sig), 8000);
    }

    return () => {
      if (registerTimer.current) clearTimeout(registerTimer.current);
    };
  }, [uid, evmAddress, stellarAddress]);

  const user: AuthUser | null = privyUser
    ? {
        privyId:      privyUser.id,
        email:        privyUser.email?.address ?? (privyUser as any).google?.email ?? (privyUser as any).apple?.email,
        name:         (privyUser as any).google?.name ?? (privyUser as any).apple?.name,
        profileImage: (privyUser as any).google?.profilePictureUrl,
        evmAddress,
        stellarAddress,
      }
    : null;

  return (
    <AuthContext.Provider value={{ user, ready: initialized, authenticated: !!privyUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (MOCK_MODE) {
    return (
      <AuthContext.Provider value={{ user: MOCK_USER, ready: true, authenticated: true }}>
        {children}
      </AuthContext.Provider>
    );
  }
  return <RealAuthProvider>{children}</RealAuthProvider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
