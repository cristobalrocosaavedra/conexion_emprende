import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import * as Location from "expo-location";
import { readDeviceLocation } from "@territorio-vivo/core";
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
export function useDeviceLocation(options: Options) {
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const mounted = useRef(false),
    pending = useRef(false),
    epoch = useRef(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<LocationResult | null>(null);
  const refresh = useCallback(async (mode: LocationMode = "manual") => {
    if (!optionsRef.current.enabled || pending.current || Platform.OS === "web")
      return;
    pending.current = true;
    const ticket = ++epoch.current,
      version = optionsRef.current.selectionVersion();
    setBusy(true);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const operation = readDeviceLocation(
      {
        getPermission: () => Location.getForegroundPermissionsAsync(),
        requestPermission: () => Location.requestForegroundPermissionsAsync(),
        servicesEnabled: () => Location.hasServicesEnabledAsync(),
        getPosition: () =>
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          }),
        reverseGeocode: (point) => Location.reverseGeocodeAsync(point),
      },
      mode,
      t.communes,
    );
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
    if (!options.enabled || Platform.OS === "web") return;
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
    : Platform.OS === "web"
      ? t.locationWeb
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
