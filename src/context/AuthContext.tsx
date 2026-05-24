import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { usePrivy } from "@privy-io/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "../services/api";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: privyUser, getAccessToken } = usePrivy();
  const getTokenRef = useRef(getAccessToken);
  getTokenRef.current = getAccessToken; // always current, never a stale closure
  const [stellarAddress, setStellarAddressState] = useState<string | null>(null);
  const [initialized, setInitialized]            = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    if (privyUser) {
      setInitialized(true);
    } else {
      // Give Privy up to 5s to restore tokens from secure storage on cold start.
      timer.current = setTimeout(() => setInitialized(true), 5000);
    }

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [privyUser]);

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
        }).catch(() => {}); // non-critical
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
    }).catch(() => {}); // non-critical
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

export function useAuth() {
  return useContext(AuthContext);
}
