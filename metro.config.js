const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const EMPTY  = path.resolve(__dirname, "src/polyfills/empty.js");
const URL_P  = path.resolve(__dirname, "src/polyfills/url.js");
const BUFFER = path.resolve(__dirname, "node_modules/buffer/index.js");
const STREAM = path.resolve(__dirname, "node_modules/readable-stream/lib/ours/index.js");
const EVENTS = path.resolve(__dirname, "node_modules/events/events.js");

const NODE_POLYFILLS = {
  url:    URL_P,
  buffer: BUFFER,
  stream: STREAM,
  events: EVENTS,
  http:   EMPTY,
  https:  EMPTY,
  net:    EMPTY,
  tls:    EMPTY,
  fs:     EMPTY,
  path:   EMPTY,
  os:     EMPTY,
  zlib:   EMPTY,
  crypto: EMPTY,
  assert: EMPTY,
  util:   EMPTY,
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (NODE_POLYFILLS[moduleName]) {
    return { filePath: NODE_POLYFILLS[moduleName], type: "sourceFile" };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
