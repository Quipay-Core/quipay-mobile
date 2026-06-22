import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { usePrivy } from "@privy-io/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "../services/api";
import { MOCK_MODE } from "../services/mockData";

const STELLAR_KEY = "@quipay_stellar_address";

interface AuthUser {
  privyId:        string;
  email?:         string;
  name?:          string;
  profileImage?:  string;
  stellarAddress: string | null;
}

interface AuthContextValue {
  user:              AuthUser | null;
  ready:             boolean;
  authenticated:     boolean;
  setStellarAddress: (address: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user:              null,
  ready:             false,
  authenticated:     false,
  setStellarAddress: async () => {},
});

const MOCK_USER: AuthUser = {
  privyId:        "mock-user-001",
  email:          "tester@quipay.app",
  name:           "Test User",
  stellarAddress: "GBXMV5NIFCBKXPFPDUQLXAGJYERQXF7RT2LCIFSJQFKIZNIMJDKUJZ3",
};

function RealAuthProvider({ children }: { children: ReactNode }) {
  const { user: privyUser, getAccessToken, ready: privyReady } = usePrivy() as any;
  const getTokenRef = useRef(getAccessToken);
  getTokenRef.current = getAccessToken; // always current, never a stale closure
  const [stellarAddress, setStellarAddressState] = useState<string | null>(null);
  const [initialized, setInitialized]            = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    // Prefer Privy's own ready flag — resolves as soon as the SDK has finished
    // attempting to restore a session, with or without a user.
    if (privyReady || privyUser) {
      setInitialized(true);
    } else {
      // Fallback: give Privy up to 5s on cold start in case ready is unavailable.
      timer.current = setTimeout(() => setInitialized(true), 5000);
    }

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [privyReady, privyUser]);

  // Load stored stellar address and sync worker record with backend on login.
  useEffect(() => {
    if (!privyUser?.id) return;

    AsyncStorage.getItem(`${STELLAR_KEY}:${privyUser.id}`)
      .then(addr => {
        setStellarAddressState(addr);
        // Register/upsert worker in DB — safe to call every login; backend uses ON CONFLICT DO UPDATE.
        // Calling with null walletStellar won't overwrite an existing address (COALESCE).
        const email =
          privyUser.email?.address ??
          (privyUser as any).google?.email ??
          (privyUser as any).apple?.email;
        apiFetch("/workers/me/register", () => getTokenRef.current(), {
          method: "POST",
          body: JSON.stringify({ walletStellar: addr ?? null, email: email ?? null }),
        }).catch((err) => console.warn("[AuthContext] worker register failed:", err));
      })
      .catch(console.error);
  }, [privyUser?.id]);

  async function setStellarAddress(address: string) {
    if (!privyUser?.id) return;
    await AsyncStorage.setItem(`${STELLAR_KEY}:${privyUser.id}`, address);
    setStellarAddressState(address);
    // Update worker record with the newly linked stellar address.
    apiFetch("/workers/me/register", () => getTokenRef.current(), {
      method: "POST",
      body: JSON.stringify({ walletStellar: address }),
    }).catch((err) => console.warn("[AuthContext] stellar address sync failed:", err));
  }

  const authenticated = !!privyUser;

  const user: AuthUser | null = privyUser
    ? {
        privyId:        privyUser.id,
        email:          privyUser.email?.address ?? (privyUser as any).google?.email ?? (privyUser as any).apple?.email,
        name:           (privyUser as any).google?.name ?? (privyUser as any).apple?.name,
        profileImage:   (privyUser as any).google?.profilePictureUrl,
        stellarAddress,
      }
    : null;

  return (
    <AuthContext.Provider value={{ user, ready: initialized, authenticated, setStellarAddress }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (MOCK_MODE) {
    return (
      <AuthContext.Provider value={{
        user:              MOCK_USER,
        ready:             true,
        authenticated:     true,
        setStellarAddress: async () => {},
      }}>
        {children}
      </AuthContext.Provider>
    );
  }
  return <RealAuthProvider>{children}</RealAuthProvider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
