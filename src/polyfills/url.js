// Custom URL polyfill that also stubs Node-only APIs (pathToFileURL, fileURLToPath)
// needed by @toruslabs/base-controllers environment detection code.
const { URL, URLSearchParams } = require("react-native-url-polyfill");

module.exports = {
  URL,
  URLSearchParams,
  // Stub — only used for import.meta.env detection, never actually called at runtime
  pathToFileURL(path) {
    return { href: "file://" + path, toString() { return this.href; } };
  },
  fileURLToPath(url) {
    return String(url).replace(/^file:\/\//, "");
  },
};
