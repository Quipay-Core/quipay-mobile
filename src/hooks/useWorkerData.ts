import { useState, useEffect, useRef, useCallback, MutableRefObject } from "react";
import { usePrivy } from "@privy-io/expo";
import { apiFetch, publicFetch } from "../services/api";

type GetTokenFn = () => Promise<string | null>;

/** Wraps getAccessToken in a ref so callbacks stay stable across renders. */
function useGetTokenRef(): MutableRefObject<GetTokenFn> {
  const { getAccessToken } = usePrivy();
  const ref = useRef<GetTokenFn>(getAccessToken);
  ref.current = getAccessToken;
  return ref;
}

export interface WorkerStream {
  streamId: string;
  chain: string;
  employer: string;
  ratePerSecond: number;
  startTs: number;
  endTs: number;
  available: number;
  withdrawn: number;
  token: string;
  status: string;
}

export function useWorkerBalance() {
  const tokenRef = useGetTokenRef();
  const [available, setAvailable]             = useState(0);
  const [streamingPerSec, setStreamingPerSec] = useState(0);
  const [withdrawn, setWithdrawn]             = useState(0);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch("/workers/me/balance", () => tokenRef.current());
      if (!res.ok) {
        setError(`Failed to load balance (HTTP ${res.status})`);
        return;
      }
      const data = await res.json() as {
        available: string;
        streamingPerSec: string;
        withdrawn: string;
      };
      if (typeof data?.available !== "string" || typeof data?.streamingPerSec !== "string" || typeof data?.withdrawn !== "string") {
        setError("Unexpected response format from server.");
        return;
      }
      const safe = (s: string) => { const n = parseFloat(s); return isNaN(n) ? 0 : n; };
      setAvailable(safe(data.available));
      setStreamingPerSec(safe(data.streamingPerSec));
      setWithdrawn(safe(data.withdrawn));
      setError(null);
    } catch (err) {
      console.warn("[useWorkerBalance] fetch failed:", err);
      setError("Could not load balance. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch on mount, then every 30s
  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  return { available, streamingPerSec, withdrawn, loading, error, refetch: load };
}

/**
 * Fetches the worker's stream list. Refreshes when called or on mount.
 */
export function useWorkerStreams() {
  const tokenRef = useGetTokenRef();
  const [streams, setStreams]             = useState<WorkerStream[]>([]);
  const [loading, setLoading]             = useState(true);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [error, setError]                 = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch("/workers/me/streams", () => tokenRef.current());
      if (!res.ok) {
        setError(`Failed to load streams (HTTP ${res.status})`);
        return;
      }
      const data = await res.json() as {
        streams: WorkerStream[];
        totalAvailableUSDC: number;
      };
      if (!Array.isArray(data?.streams)) {
        setError("Unexpected response format from server.");
        return;
      }
      setStreams(data.streams);
      setTotalAvailable(typeof data.totalAvailableUSDC === "number" ? data.totalAvailableUSDC : 0);
      setError(null);
    } catch (err) {
      console.warn("[useWorkerStreams] fetch failed:", err);
      setError("Could not load streams. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  return { streams, totalAvailable, loading, error, refetch: load };
}

/**
 * Fetches withdrawal history from the backend (persistent, all-time).
 */
export interface WithdrawalRecord {
  id: number;
  amount: string;
  tokenSymbol: string;
  streamId: string;
  txHash: string;
  createdAt: string;
}

export function useWithdrawalHistory(stellarAddress: string | null) {
  const [records, setRecords] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!stellarAddress) return;
    setLoading(true);
    setError(null);
    publicFetch(
      `/api/employers/withdrawal-events?address=${encodeURIComponent(stellarAddress)}`
    )
      .then(r => r.json())
      .then((d: { withdrawals?: any[] }) => {
        setRecords(
          (d.withdrawals ?? []).map(w => ({
            id:          w.id,
            amount:      w.amount,
            tokenSymbol: w.token_symbol,
            streamId:    w.stream_id,
            txHash:      w.tx_hash,
            createdAt:   w.created_at,
          }))
        );
        setError(null);
      })
      .catch((err) => {
        console.warn("[useWithdrawalHistory] fetch failed:", err);
        setError("Could not load transaction history. Check your connection.");
        setRecords([]);
      })
      .finally(() => setLoading(false));
  }, [stellarAddress]);

  return { records, loading, error };
}
