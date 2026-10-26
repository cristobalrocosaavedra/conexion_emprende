/** Orden territorial para navegar; no es cartografía ni cálculo de rutas. */
export const regionIds = [
  "arica-parinacota",
  "tarapaca",
  "antofagasta",
  "atacama",
  "coquimbo",
  "valparaiso",
  "metropolitana",
  "ohiggins",
  "maule",
  "nuble",
  "biobio",
  "araucania",
  "los-rios",
  "los-lagos",
  "aysen",
  "magallanes",
] as const;
export type RegionId = (typeof regionIds)[number];
export type Direction = "north" | "south";
export type ThemePreference = "system" | "light" | "dark";
export function neighbor(
  region: RegionId,
  direction: Direction,
): RegionId | null {
  const index = regionIds.indexOf(region) + (direction === "north" ? -1 : 1);
  return regionIds[index] ?? null;
}
export function transitionPath(from: RegionId, to: RegionId): RegionId[] {
  const start = regionIds.indexOf(from),
    end = regionIds.indexOf(to);
  if (start === end) return [];
  const step = end > start ? 1 : -1;
  return Array.from(
    { length: Math.abs(end - start) },
    (_, i) => regionIds[start + step * (i + 1)],
  );
}
export function resolveTheme(
  preference: ThemePreference,
  system: "light" | "dark" | null,
): "light" | "dark" {
  return preference === "system" ? (system ?? "light") : preference;
}
export * from "./catalog";
export * from "./geo";

export * from "./device-location";

export * from "./road-routing";
export * from "./live-navigation";

export * from "./routing-server";

export * from "./travel-display";

export * from "./travel-areas";
