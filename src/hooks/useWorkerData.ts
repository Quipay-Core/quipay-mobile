import { useState, useEffect, useRef, useCallback, MutableRefObject } from "react";
import { usePrivy } from "@privy-io/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch, publicFetch } from "../services/api";
import { MOCK_MODE, MOCK_BALANCE, MOCK_STREAMS, MOCK_HISTORY, MOCK_NOTIFICATIONS } from "../services/mockData";

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
    if (MOCK_MODE) {
      const safe = (s: string) => { const n = parseFloat(s); return isNaN(n) ? 0 : n; };
      setAvailable(safe(MOCK_BALANCE.available));
      setStreamingPerSec(safe(MOCK_BALANCE.streamingPerSec));
      setWithdrawn(safe(MOCK_BALANCE.withdrawn));
      setError(null);
      setLoading(false);
      return;
    }
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
    if (MOCK_MODE) {
      setStreams(MOCK_STREAMS as WorkerStream[]);
      setTotalAvailable(MOCK_STREAMS.reduce((sum, s) => sum + s.available, 0));
      setError(null);
      setLoading(false);
      return;
    }
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
    if (MOCK_MODE) {
      setRecords(MOCK_HISTORY as WithdrawalRecord[]);
      setLoading(false);
      return;
    }
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

/**
 * In-app notifications. Read/unread state is tracked locally (AsyncStorage) so
 * it survives restarts. Mock data feeds the list in MOCK_MODE; the real backend
 * endpoint isn't built yet, so live mode returns an empty list for now.
 */
export type NotificationType = "payout" | "stream" | "vault";

export interface AppNotification {
  id:        string;
  type:      NotificationType;
  title:     string;
  body:      string;
  createdAt: string;
  read:      boolean;
}

const READ_NOTIFS_KEY = "@quipay_read_notifs";

export function useNotifications() {
  const [items, setItems]     = useState<Omit<AppNotification, "read">[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Restore which notifications have already been read.
  useEffect(() => {
    AsyncStorage.getItem(READ_NOTIFS_KEY)
      .then(raw => {
        if (!raw) return;
        try { setReadIds(new Set(JSON.parse(raw) as string[])); } catch { /* ignore */ }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (MOCK_MODE) {
      setItems(MOCK_NOTIFICATIONS);
    } else {
      // TODO: wire to backend notifications endpoint once it exists.
      setItems([]);
    }
    setLoading(false);
  }, []);

  const persist = useCallback((ids: Set<string>) => {
    AsyncStorage.setItem(READ_NOTIFS_KEY, JSON.stringify([...ids])).catch(() => {});
  }, []);

  const markRead = useCallback((id: string) => {
    setReadIds(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      persist(next);
      return next;
    });
  }, [persist]);

  const markAllRead = useCallback(() => {
    setReadIds(prev => {
      const next = new Set(prev);
      items.forEach(n => next.add(n.id));
      persist(next);
      return next;
    });
  }, [items, persist]);

  const notifications: AppNotification[] = items.map(n => ({ ...n, read: readIds.has(n.id) }));
  const unreadCount = notifications.reduce((sum, n) => sum + (n.read ? 0 : 1), 0);

  return { notifications, unreadCount, loading, markRead, markAllRead };
}
