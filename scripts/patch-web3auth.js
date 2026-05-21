/**
 * Removes a React-Native-incompatible `require('url')` call from
 * @toruslabs/base-controllers that is nested inside @toruslabs/ethereum-controllers.
 *
 * The affected function (getEnvVariable) checks import.meta.env — a Vite/browser
 * concept that doesn't exist in React Native. The url import is dead code in RN
 * but Metro still tries to bundle it and fails. This script strips it out.
 *
 * Run automatically via postinstall.
 */

const fs   = require("fs");
const path = require("path");

const FILE = path.resolve(
  __dirname,
  "../node_modules/@toruslabs/ethereum-controllers/node_modules/@toruslabs/base-controllers/dist/lib.cjs/utils/utils.js"
);

if (!fs.existsSync(FILE)) {
  console.log("[patch-web3auth] File not found — skipping (may be a different package version).");
  process.exit(0);
}

const ORIGINAL = `const getEnvVariable = variable => {
  var _import$meta$env, _process$env;
  // Check for Vite/browser environment (import.meta.env)
  if (typeof ({ url: (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('utils/utils.js', document.baseURI).href)) }) !== "undefined" && (_import$meta$env = undefined) !== null && _import$meta$env !== void 0 && _import$meta$env[variable]) {
    var _import$meta$env2;
    return (_import$meta$env2 = undefined) === null || _import$meta$env2 === void 0 ? void 0 : _import$meta$env2[variable];
  }`;

const PATCHED = `const getEnvVariable = variable => {
  var _process$env;
  // Vite/import.meta.env check removed — not available in React Native.`;

let src = fs.readFileSync(FILE, "utf8");

if (src.includes(PATCHED.split("\n")[2])) {
  console.log("[patch-web3auth] Already patched — skipping.");
  process.exit(0);
}

if (!src.includes("require('u' + 'rl')")) {
  console.log("[patch-web3auth] Target string not found — may already be fixed upstream.");
  process.exit(0);
}

src = src.replace(ORIGINAL, PATCHED);
fs.writeFileSync(FILE, src, "utf8");
console.log("[patch-web3auth] Patched successfully.");
