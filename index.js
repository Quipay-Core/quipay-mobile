// CommonJS requires run synchronously in order — polyfills are set up
// before expo-router (and therefore Privy) loads.

require("react-native-get-random-values");
require("fast-text-encoding");
require("@ethersproject/shims");

const { getRandomValues, randomUUID, digest } = require("expo-crypto");
if (!global.crypto) global.crypto = {};
Object.assign(global.crypto, { getRandomValues, randomUUID, digest });

// ── TEMP network diagnostic ───────────────────────────────────────────────
// Records any request that comes back as HTML or an error, so a "JSON parse
// error: <" can be traced to the exact URL/status. Read via global.__netlog.
(() => {
  const _fetch = global.fetch;
  global.__netlog = [];
  global.fetch = async (...args) => {
    const url =
      typeof args[0] === "string" ? args[0] : (args[0] && args[0].url) || "?";
    try {
      const res = await _fetch(...args);
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("text/html") || res.status >= 400) {
        global.__netlog.push(`${res.status} ${ct.split(";")[0]} ${url}`);
        if (global.__netlog.length > 6) global.__netlog.shift();
      }
      return res;
    } catch (e) {
      global.__netlog.push(`ERR ${e && e.message} ${url}`);
      if (global.__netlog.length > 6) global.__netlog.shift();
      throw e;
    }
  };
})();

require("expo-router/entry");
