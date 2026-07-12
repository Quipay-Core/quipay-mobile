import { useCallback, useEffect, useState } from "react";

const HORIZON =
  process.env.EXPO_PUBLIC_STELLAR_HORIZON_URL ??
  "https://horizon-testnet.stellar.org";
const USDC_ISSUER =
  process.env.EXPO_PUBLIC_USDC_ISSUER ??
  "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

/**
 * The worker's liquid on-chain balance (USDC + XLM) in their Stellar wallet —
 * i.e. what they actually hold, separate from streamed earnings still in the
 * vault. Read straight from Horizon so it matches the real wallet.
 */
export function useWalletBalance(stellarAddress: string | null) {
  const [usdc, setUsdc] = useState(0);
  const [xlm, setXlm] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!stellarAddress) return;
    setLoading(true);
    try {
      const res = await fetch(`${HORIZON}/accounts/${stellarAddress}`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        balances: Array<{
          asset_type: string;
          asset_code?: string;
          asset_issuer?: string;
          balance: string;
        }>;
      };
      let u = 0;
      let x = 0;
      for (const b of data.balances) {
        if (b.asset_type === "native") x = parseFloat(b.balance);
        if (b.asset_code === "USDC" && b.asset_issuer === USDC_ISSUER)
          u = parseFloat(b.balance);
      }
      setUsdc(u);
      setXlm(x);
    } catch {
      // non-fatal — leave last known values
    } finally {
      setLoading(false);
    }
  }, [stellarAddress]);

  useEffect(() => {
    void load();
  }, [load]);

  return { usdc, xlm, loading, refetch: load };
}
