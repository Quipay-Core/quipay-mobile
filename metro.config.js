const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Required for Privy — enables package exports and fixes isows compatibility
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ["require", "default", "browser"];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "isows") {
    return context.resolveRequest(
      { ...context, unstable_enablePackageExports: false },
      moduleName,
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
