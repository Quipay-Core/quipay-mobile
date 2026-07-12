import { useCallback, useState } from "react";
import { useSignRawHash } from "@privy-io/expo/extended-chains";
import {
  Account,
  Asset,
  BASE_FEE,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
  StrKey,
  xdr,
} from "@stellar/stellar-base";

const HORIZON =
  process.env.EXPO_PUBLIC_STELLAR_HORIZON_URL ??
  "https://horizon-testnet.stellar.org";
const USDC_ISSUER =
  process.env.EXPO_PUBLIC_USDC_ISSUER ??
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const PASSPHRASE =
  process.env.EXPO_PUBLIC_STELLAR_NETWORK_PASSPHRASE ?? Networks.TESTNET;

export type SendState = "idle" | "building" | "signing" | "sending" | "done";

/**
 * Sends USDC from the user's Privy embedded Stellar wallet to another Stellar
 * address — a classic payment, signed with the embedded key via signRawHash
 * (Stellar = ed25519 over the tx hash) and submitted straight to Horizon.
 * This is how a worker moves earned USDC out to another wallet or an exchange.
 */
export function useSendUsdc(sourceAddress: string | null) {
  const { signRawHash } = useSignRawHash();
  const [state, setState] = useState<SendState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const send = useCallback(
    async (destination: string, amount: string): Promise<boolean> => {
      setError(null);
      setTxHash(null);
      const dest = destination.trim().toUpperCase();
      const amt = parseFloat(amount);

      if (!sourceAddress) {
        setError("No wallet on this account yet.");
        return false;
      }
      if (!StrKey.isValidEd25519PublicKey(dest)) {
        setError("Enter a valid Stellar address (G…).");
        return false;
      }
      if (!(amt > 0)) {
        setError("Enter an amount greater than 0.");
        return false;
      }

      try {
        // 1. Load the source account (sequence) from Horizon.
        setState("building");
        const accRes = await fetch(`${HORIZON}/accounts/${sourceAddress}`);
        if (!accRes.ok) throw new Error("Your wallet isn't active on the network yet.");
        const acc = (await accRes.json()) as { sequence: string };

        // 2. Build the USDC payment.
        const asset = new Asset("USDC", USDC_ISSUER);
        const source = new Account(sourceAddress, acc.sequence);
        const tx = new TransactionBuilder(source, {
          fee: BASE_FEE,
          networkPassphrase: PASSPHRASE,
        })
          .addOperation(
            Operation.payment({ destination: dest, asset, amount: amt.toFixed(7) }),
          )
          .setTimeout(180)
          .build();

        // 3. Sign the 32-byte tx hash with the embedded wallet (ed25519).
        setState("signing");
        const hashHex = tx.hash().toString("hex");
        const { signature } = await signRawHash({
          address: sourceAddress,
          chainType: "stellar",
          hash: `0x${hashHex}`,
        });
        const sigBuf = Buffer.from(signature.replace(/^0x/, ""), "hex");
        const hint = Keypair.fromPublicKey(sourceAddress).signatureHint();
        tx.signatures.push(new xdr.DecoratedSignature({ hint, signature: sigBuf }));

        // 4. Submit the signed XDR to Horizon.
        setState("sending");
        const body = `tx=${encodeURIComponent(tx.toXDR())}`;
        const subRes = await fetch(`${HORIZON}/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });
        const result = (await subRes.json()) as {
          hash?: string;
          extras?: { result_codes?: unknown };
          detail?: string;
        };
        if (!subRes.ok || !result.hash) {
          const codes = result.extras?.result_codes;
          throw new Error(
            codes
              ? `Payment rejected: ${JSON.stringify(codes)}`
              : (result.detail ?? "Payment failed."),
          );
        }
        setTxHash(result.hash);
        setState("done");
        return true;
      } catch (err) {
        setState("idle");
        setError(err instanceof Error ? err.message : "Send failed.");
        return false;
      }
    },
    [sourceAddress, signRawHash],
  );

  return { send, state, error, txHash };
}
