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

export function streamProgress(startTs: number, endTs: number): number {
  const now = Date.now() / 1000;
  if (now <= startTs) return 0;
  if (now >= endTs) return 1;
  return (now - startTs) / (endTs - startTs);
}
