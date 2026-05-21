import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Keypair } from "@stellar/stellar-base";
import {
  initWeb3Auth,
  isLoggedIn,
  getUserInfo,
  getStellarKeypair,
  logoutWeb3Auth,
} from "../services/web3auth";

interface AuthUser {
  email?:        string;
  name?:         string;
  profileImage?: string;
  stellarAddress: string;
  stellarKeypair: Keypair;
}

interface AuthContextValue {
  user:         AuthUser | null;
  ready:        boolean;
  logout:       () => Promise<void>;
  refreshAuth:  () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user:        null,
  ready:       false,
  logout:      async () => {},
  refreshAuth: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,  setUser]  = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  function refreshAuth() {
    if (!isLoggedIn()) { setUser(null); return; }
    const info    = getUserInfo();
    const keypair = getStellarKeypair();
    if (!keypair) { setUser(null); return; }
    setUser({
      email:          info?.email,
      name:           info?.name,
      profileImage:   info?.profileImage,
      stellarAddress: keypair.publicKey(),
      stellarKeypair: keypair,
    });
  }

  useEffect(() => {
    initWeb3Auth()
      .then(() => { refreshAuth(); })
      .catch(console.error)
      .finally(() => setReady(true));
  }, []);

  async function logout() {
    await logoutWeb3Auth();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
