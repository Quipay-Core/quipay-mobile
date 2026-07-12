import { useEffect, useRef, useState } from "react";

/**
 * A value that ticks upward in real time from a fetched base at a per-second
 * rate — e.g. streamed earnings that keep climbing between backend polls.
 * Re-anchors whenever the fetched `base` or `ratePerSec` changes, so a fresh
 * poll snaps to the authoritative amount and continues from there.
 */
export function useLiveValue(base: number, ratePerSec: number): number {
  const [value, setValue] = useState(base);
  const anchor = useRef({ base, at: Date.now() });

  // New fetch → re-anchor to the authoritative base and current time.
  useEffect(() => {
    anchor.current = { base, at: Date.now() };
    setValue(base);
  }, [base, ratePerSec]);

  useEffect(() => {
    if (!(ratePerSec > 0)) return;
    const id = setInterval(() => {
      const elapsed = (Date.now() - anchor.current.at) / 1000;
      setValue(anchor.current.base + ratePerSec * elapsed);
    }, 200);
    return () => clearInterval(id);
  }, [ratePerSec]);

  return value;
}
