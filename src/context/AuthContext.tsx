import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { usePrivy } from "@privy-io/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const { user: privyUser } = usePrivy();
  const [stellarAddress, setStellarAddressState] = useState<string | null>(null);
  const [initialized, setInitialized]            = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);

    if (privyUser) {
      // Session found — ready immediately
      setInitialized(true);
    } else {
      // No session yet — wait 2.5s for Privy to restore stored tokens
      // before declaring the user as logged out
      timer.current = setTimeout(() => setInitialized(true), 2500);
    }

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [privyUser]);

  useEffect(() => {
    if (!privyUser?.id) return;
    AsyncStorage.getItem(`${STELLAR_KEY}:${privyUser.id}`)
      .then(addr => setStellarAddressState(addr))
      .catch(console.error);
  }, [privyUser?.id]);

  async function setStellarAddress(address: string) {
    if (!privyUser?.id) return;
    await AsyncStorage.setItem(`${STELLAR_KEY}:${privyUser.id}`, address);
    setStellarAddressState(address);
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
