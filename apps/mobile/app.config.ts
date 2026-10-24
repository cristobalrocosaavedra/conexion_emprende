import type { ExpoConfig } from "expo/config";
const config: ExpoConfig = {
  name: "Territorio Vivo",
  slug: "territorio-vivo",
  version: "0.1.0",
  orientation: "portrait",
  scheme: "territoriovivo",
  userInterfaceStyle: "automatic",
  platforms: ["android", "ios", "web"],
  android: {
    package: "cl.territoriovivo.maqueta",
    versionCode: 1,
    permissions: [],
    blockedPermissions: [
      "android.permission.RECORD_AUDIO",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION",
    ],
  },
  ios: { bundleIdentifier: "cl.territoriovivo.maqueta", supportsTablet: true },
  plugins: ["expo-router"],
  experiments: { typedRoutes: false },
};
export default config;
