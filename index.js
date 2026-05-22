// CommonJS requires run synchronously in order — polyfills are set up
// before expo-router (and therefore Privy) loads.

require("react-native-get-random-values");
require("fast-text-encoding");
require("@ethersproject/shims");

const { getRandomValues, randomUUID, digest } = require("expo-crypto");
if (!global.crypto) global.crypto = {};
Object.assign(global.crypto, { getRandomValues, randomUUID, digest });

require("expo-router/entry");
