import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { normalizePreferences } from "@territorio-vivo/core";
import type { Preferences } from "@territorio-vivo/core";
const key = "territorio-vivo.preferences.v2";
const defaults: Preferences = {
  region: "valparaiso",
  commune: "all",
  theme: "system",
  stopIds: [],
  roundTrip: false,
};
export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(key)
      .then((value) => {
        if (!active) return;
        try {
          const restored = value
            ? normalizePreferences(JSON.parse(value))
            : null;
          if (restored) setPreferences(restored);
        } catch {
          /* Un formato anterior se descarta. */
        }
      })
      .catch(() => {
        if (active) setStorageError(true);
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(key, JSON.stringify(preferences)).catch(() =>
      setStorageError(true),
    );
  }, [preferences, hydrated]);
  return { preferences, setPreferences, hydrated, storageError };
}
