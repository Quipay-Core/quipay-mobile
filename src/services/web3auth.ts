import "../polyfills/globals"; // must be first — sets global.Buffer before Web3Auth init
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
import Web3Auth, { WEB3AUTH_NETWORK, LOGIN_PROVIDER } from "@web3auth/react-native-sdk";
import { Keypair } from "@stellar/stellar-base";

/**
 * Replace with your Client ID from https://dashboard.web3auth.io
 * Project type: Plug and Play → Mobile
 * Whitelist URL: quipay://web3auth
 */
export const WEB3AUTH_CLIENT_ID = "YOUR_WEB3AUTH_CLIENT_ID";

const REDIRECT_URL = Linking.createURL("web3auth", { scheme: "quipay" });

export const web3auth = new Web3Auth(WebBrowser, SecureStore, {
  clientId: WEB3AUTH_CLIENT_ID,
  network:  WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  redirectUrl: REDIRECT_URL,
});

export async function initWeb3Auth() {
  await web3auth.init();
}

export async function loginWithGoogle() {
  await web3auth.login({
    loginProvider: LOGIN_PROVIDER.GOOGLE,
    redirectUrl:   REDIRECT_URL,
    mfaLevel:      "none",
    curve:         "ed25519",
  });
}

export async function loginWithApple() {
  await web3auth.login({
    loginProvider: LOGIN_PROVIDER.APPLE,
    redirectUrl:   REDIRECT_URL,
    mfaLevel:      "none",
    curve:         "ed25519",
  });
}

export async function loginWithEmail(email: string) {
  await web3auth.login({
    loginProvider: LOGIN_PROVIDER.EMAIL_PASSWORDLESS,
    redirectUrl:   REDIRECT_URL,
    mfaLevel:      "none",
    curve:         "ed25519",
    extraLoginOptions: { login_hint: email },
  });
}

export async function logoutWeb3Auth() {
  await web3auth.logout();
}

/** Derive a Stellar keypair from the Web3Auth ed25519 key */
export function getStellarKeypair(): Keypair | null {
  try {
    const hex = web3auth.ed25519Key();
    if (!hex) return null;
    const seed = Buffer.from(hex, "hex");
    return Keypair.fromRawEd25519Seed(seed);
  } catch {
    return null;
  }
}

export function getUserInfo() {
  return web3auth.userInfo();
}

export function isLoggedIn(): boolean {
  return !!web3auth.privKey();
}
