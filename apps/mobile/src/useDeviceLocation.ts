import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import * as Location from "expo-location";
import {
  communeNames,
  createBrowserLocationAdapter,
  readDeviceLocation,
} from "@territorio-vivo/core";
import type {
  BrowserGeolocation,
  LocationAdapter,
} from "@territorio-vivo/core";
import type {
  LocatedArea,
  LocationMode,
  LocationResult,
} from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
interface Options {
  enabled: boolean;
  selectionVersion: () => number;
  onReady: (area: LocatedArea, mode: LocationMode, version: number) => void;
}
const nativeAdapter: LocationAdapter = {
  getPermission: () => Location.getForegroundPermissionsAsync(),
  requestPermission: () => Location.requestForegroundPermissionsAsync(),
  servicesEnabled: () => Location.hasServicesEnabledAsync(),
  getPosition: () =>
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
  reverseGeocode: (point) => Location.reverseGeocodeAsync(point),
};

/** En la web se usa la geolocalización del navegador, sin servicios externos. */
function webAdapter(): LocationAdapter {
  const nav = (
    globalThis as {
      navigator?: {
        geolocation?: BrowserGeolocation;
        permissions?: Parameters<typeof createBrowserLocationAdapter>[1];
      };
    }
  ).navigator;
  return createBrowserLocationAdapter(nav?.geolocation, nav?.permissions);
}

export function useDeviceLocation(options: Options) {
  const adapter = useRef<LocationAdapter | null>(null);
  adapter.current ??= Platform.OS === "web" ? webAdapter() : nativeAdapter;
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const mounted = useRef(false),
    pending = useRef(false),
    epoch = useRef(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LocationResult | null>(null);
  const refresh = useCallback(async (mode: LocationMode = "manual") => {
    if (!optionsRef.current.enabled || pending.current || !adapter.current)
      return;
    pending.current = true;
    const ticket = ++epoch.current,
      version = optionsRef.current.selectionVersion();
    setBusy(true);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const operation = readDeviceLocation(adapter.current, mode, communeNames);
    try {
      const next = await Promise.race([
        operation,
        new Promise<LocationResult>((resolve) => {
          timer = setTimeout(() => resolve({ status: "unavailable" }), 20000);
        }),
      ]);
      if (!mounted.current || ticket !== epoch.current) return;
      setResult(next);
      if (next.status === "ready")
        optionsRef.current.onReady(next.area, mode, version);
    } finally {
      clearTimeout(timer);
      if (ticket === epoch.current) {
        pending.current = false;
        if (mounted.current) setBusy(false);
      }
    }
  }, []);
  useEffect(() => {
    if (!options.enabled) return;
    mounted.current = true;
    void refresh("startup");
    let previous = AppState.currentState;
    const sub = AppState.addEventListener("change", (state) => {
      const returned = previous !== "active" && state === "active";
      previous = state;
      if (returned) void refresh("automatic");
    });
    return () => {
      mounted.current = false;
      epoch.current++;
      pending.current = false;
      sub.remove();
    };
  }, [options.enabled, refresh]);
  const message = busy
    ? t.locationBusy
    : result?.status === "ready"
      ? result.area.approximate
        ? t.locatedApproximate
        : t.located
      : result?.status === "denied"
        ? t.locationDenied
        : result?.status === "servicesOff"
          ? t.locationServicesOff
          : result?.status === "stale"
            ? t.locationStale
            : result?.status === "unresolved"
              ? t.locationUnresolved
              : result?.status === "unavailable"
                ? t.locationUnavailable
                : "";
  return { busy, result, message, refresh };
}
