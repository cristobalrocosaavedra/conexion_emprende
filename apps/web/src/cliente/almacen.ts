"use client";
// Preferencias en el navegador. Mi ruta comparte la clave de la app (/explorar),
// así las paradas sumadas en el sitio aparecen al iniciar la ruta. Nunca coordenadas.
import { useSyncExternalStore } from "react";

const PREFS = "territorio-vivo.preferences.v2";
const FAVS = "turismo-en-tu-mano.favoritos.v1";
const EVENT = "turismo-en-tu-mano:almacen";
const regionPattern = /^[a-z-]{3,30}$/;
const idPattern = /^[\w:.-]{1,120}$/;

interface Prefs {
  region?: string;
  commune?: string;
  theme?: string;
  stopIds?: string[];
  roundTrip?: boolean;
  [key: string]: unknown;
}
function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Sin almacenamiento (modo privado): el sitio sigue funcionando. */
  }
  window.dispatchEvent(new Event(EVENT));
}
function cleanIds(value: unknown): string[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (v): v is string => typeof v === "string" && idPattern.test(v),
          ),
        ),
      ].slice(0, 60)
    : [];
}
function readPrefs(): Prefs {
  const value = read<Prefs>(PREFS, {});
  return value && typeof value === "object" ? value : {};
}
function updatePrefs(change: Partial<Prefs>) {
  const current = readPrefs();
  write(PREFS, {
    region: "valparaiso",
    commune: "all",
    theme: "system",
    roundTrip: false,
    ...current,
    stopIds: cleanIds(current.stopIds),
    ...change,
  });
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}
// Instantáneas como texto para que React compare por valor.
const snapRegion = () => {
  const r = readPrefs().region;
  return typeof r === "string" && regionPattern.test(r) ? r : "";
};
const snapStops = () => cleanIds(readPrefs().stopIds).join("|");
const snapFavs = () => cleanIds(read(FAVS, [])).join("|");
const empty = () => "";

/** Región elegida ("" si nunca se eligió o antes de hidratar). */
export function useRegion(): [string, (region: string) => void] {
  const region = useSyncExternalStore(subscribe, snapRegion, empty);
  return [region, (r: string) => updatePrefs({ region: r, commune: "all" })];
}
const split = (s: string) => (s ? s.split("|") : []);
export function useStops() {
  const stops = split(useSyncExternalStore(subscribe, snapStops, empty));
  return {
    stops,
    toggle: (id: string) =>
      updatePrefs({
        stopIds: stops.includes(id)
          ? stops.filter((s) => s !== id)
          : [...stops, id],
      }),
    addAll: (ids: string[]) =>
      updatePrefs({ stopIds: [...new Set([...stops, ...ids])] }),
    set: (ids: string[]) => updatePrefs({ stopIds: ids }),
    startIn: (region: string) => updatePrefs({ region, commune: "all" }),
  };
}
export function useFavorites() {
  const favs = split(useSyncExternalStore(subscribe, snapFavs, empty));
  return {
    favs,
    toggle: (id: string) =>
      write(
        FAVS,
        favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id],
      ),
  };
}
