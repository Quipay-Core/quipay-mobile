import { Buffer } from "buffer";

// ── Buffer ────────────────────────────────────────────────────────────────────
if (typeof global.Buffer === "undefined") {
  (global as any).Buffer = Buffer;
}

// ── process ───────────────────────────────────────────────────────────────────
if (typeof global.process === "undefined") {
  (global as any).process = { env: {}, version: "", browser: true };
}

// ── window ────────────────────────────────────────────────────────────────────
// Web3Auth checks for window.addEventListener at module init time.
// React Native has a `window` global (= global) but without DOM APIs.
if (typeof (global as any).window === "undefined") {
  (global as any).window = global;
}
const win = (global as any).window;
if (typeof win.addEventListener !== "function") {
  win.addEventListener    = () => {};
  win.removeEventListener = () => {};
  win.dispatchEvent       = () => false;
}

// ── document ──────────────────────────────────────────────────────────────────
if (typeof (global as any).document === "undefined") {
  (global as any).document = {
    createElement:       () => ({ style: {} }),
    getElementById:      () => null,
    querySelector:       () => null,
    querySelectorAll:    () => [],
    addEventListener:    () => {},
    removeEventListener: () => {},
    createElementNS:     () => ({ style: {} }),
    body: { appendChild: () => {}, removeChild: () => {} },
  };
}

// ── location ──────────────────────────────────────────────────────────────────
if (typeof (global as any).location === "undefined") {
  (global as any).location = {
    href:     "https://quipay.app",
    origin:   "https://quipay.app",
    hostname: "quipay.app",
    protocol: "https:",
    search:   "",
    hash:     "",
  };
}
