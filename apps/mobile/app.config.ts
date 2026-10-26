import type { ExpoConfig } from "expo/config";
import identity from "./app-identity.json";
import permissions from "../../packages/i18n/src/permissions.json";
const versionCode = Number(
  process.env.TV_ANDROID_VERSION_CODE ?? identity.localVersionCode,
);
if (
  !Number.isSafeInteger(versionCode) ||
  versionCode <= 0 ||
  versionCode > 2147483647
)
  throw new Error("El número de compilación Android no es válido.");
const config: ExpoConfig = {
  name: "Territorio Vivo",
  slug: "territorio-vivo",
  version: "0.6.1",
  orientation: "portrait",
  scheme: "territoriovivo",
  userInterfaceStyle: "automatic",
  platforms: ["android", "ios", "web"],
  android: {
    package: identity.androidPackage,
    versionCode,
    permissions: [
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION",
    ],
    blockedPermissions: [
      "android.permission.RECORD_AUDIO",
      "android.permission.ACCESS_BACKGROUND_LOCATION",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.VIBRATE",
    ],
  },
  ios: {
    bundleIdentifier: identity.iosBundleIdentifier,
    supportsTablet: true,
    buildNumber: String(versionCode),
  },
  plugins: [
    "expo-router",
    ["expo-location", { locationWhenInUsePermission: permissions.es.location }],
  ],
  experiments: { typedRoutes: false },
};
export default config;
