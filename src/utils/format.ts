export function formatXLM(amount: number, decimals = 2): string {
  if (amount === 0) return "0.00";
  if (amount < 0.01) return "< 0.01";
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

/** Compact relative time, e.g. "just now", "5m", "3h", "2d", or a date past a week. */
export function timeAgo(isoOrMs: string | number): string {
  const then = typeof isoOrMs === "number" ? isoOrMs : new Date(isoOrMs).getTime();
  if (isNaN(then)) return "";
  const diff = Math.max(0, Date.now() - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return new Date(then).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function streamProgress(startTs: number, endTs: number): number {
  const now = Date.now() / 1000;
  if (now <= startTs) return 0;
  if (now >= endTs) return 1;
  return (now - startTs) / (endTs - startTs);
}
