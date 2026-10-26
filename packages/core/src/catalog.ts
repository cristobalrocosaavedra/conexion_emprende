import master from "../../../content/catalogo/maestro-app.json";
import national from "../../../content/catalogo/osm-chile.json";
import snapshot from "../../../content/catalogo/petorca.json";
import geography from "../../../content/catalogo/regiones.geo.json";
import type { RegionId } from "./index";
export type Category = "playa" | "naturaleza" | "cultura" | "gastronomia";
export interface Place {
  id: string;
  region: RegionId;
  province: string;
  commune: string;
  locality?: string | null;
  category: Category;
  name: string;
  aliases?: string[];
  summary: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  source: { url: string; label: string } | null;
  verification: "pending";
  origin?: "osm" | "master";
  importedAt: string;
}
export interface Locality {
  id: string;
  commune: string;
  name: string;
  region?: RegionId;
  latitude: number | null;
  longitude: number | null;
}
export interface CuratedRoute {
  id: string;
  name: string;
  description: string;
  stopIds: string[];
  source: { url: string; label: string };
  cover: string;
  verification: "pending";
}
export interface RegionFeature {
  type: "Feature";
  properties: { id: RegionId; name: string; bounds: number[][] };
  geometry: { type: "MultiPolygon"; coordinates: number[][][][] };
}
export const places = [
  ...snapshot.places,
  ...national.places,
  ...master.places,
] as Place[];
export const localities = [
  ...snapshot.localities,
  ...master.localities,
] as Locality[];
export const curatedRoutes = snapshot.routes as CuratedRoute[];
export const regionFeatures = geography.features as RegionFeature[];
export interface CatalogTerritory {
  id: string;
  level: "region" | "province" | "commune" | "locality";
  name: string;
  region: RegionId;
  province: string | null;
  commune: string | null;
  parentId: string | null;
  cut: null;
  verification: "pending";
}
export const catalogTerritories = master.territories as CatalogTerritory[];
export const masterRecords = master.records;
export const masterEvidence = master.evidence as Record<
  string,
  {
    rowIds: string[];
    sourceLabel: string;
    category: string;
    declaredAccess: string;
    possibleDuplicateIds: string[];
  }
>;
export const communeNames: Record<string, string> = Object.fromEntries(
  catalogTerritories
    .filter((t) => t.level === "commune")
    .map((t) => [t.commune!, t.name]),
);
export function communeName(id: string): string {
  return communeNames[id] ?? id;
}
export function provinceName(id: string): string {
  return (
    catalogTerritories.find((t) => t.level === "province" && t.province === id)
      ?.name ?? id
  );
}
export function searchTerritories(query: string): CatalogTerritory[] {
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("es");
  const q = normalize(query.trim());
  return q.length < 2
    ? []
    : catalogTerritories.filter(
        (t) =>
          (t.level === "commune" || t.level === "locality") &&
          normalize(
            t.name +
              (t.commune === "isla-de-pascua" ? " Rapa Nui Hanga Roa" : ""),
          ).includes(q),
      );
}
export function filterPlaces(
  region: RegionId,
  commune = "all",
  category = "all",
  query = "",
): Place[] {
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const q = normalize(query.trim());
  return places.filter(
    (p) =>
      p.region === region &&
      (commune === "all" || p.commune === commune) &&
      (category === "all" || p.category === category) &&
      (!q ||
        normalize(
          p.name + " " + p.summary + " " + (p.aliases ?? []).join(" "),
        ).includes(q)),
  );
}
export function regionBounds(id: RegionId): number[][] {
  return regionFeatures.find((f) => f.properties.id === id)!.properties.bounds;
}
export function toggleStop(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id];
}
export function moveStop(
  ids: string[],
  id: string,
  direction: -1 | 1,
): string[] {
  const index = ids.indexOf(id),
    next = index + direction;
  const result = [...ids];
  if (index < 0 || next < 0 || next >= ids.length) return result;
  [result[index], result[next]] = [result[next], result[index]];
  return result;
}
export function swipeDirection(
  dx: number,
  dy: number,
  velocityY = 0,
): "north" | "south" | null {
  if (Math.abs(dy) < Math.abs(dx) * 1.25) return null;
  if (Math.abs(dy) < 48 && !(Math.abs(dy) > 18 && Math.abs(velocityY) > 0.5))
    return null;
  return dy < 0 ? "south" : "north";
}
/** Serialización para scripts locales, sin permitir que datos cierren la etiqueta script. */
export function serializeForHtml(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
export function decodeMapSelection(
  data: unknown,
): { type: "place" | "region"; id: string } | null {
  if (typeof data !== "string" || data.length > 1000) return null;
  try {
    const value = JSON.parse(data);
    if (value?.type === "place" && places.some((p) => p.id === value.id))
      return { type: "place", id: value.id };
    if (
      value?.type === "region" &&
      regionFeatures.some((f) => f.properties.id === value.id)
    )
      return { type: "region", id: value.id };
  } catch {
    /* Mensajes ajenos se descartan. */
  }
  return null;
}
export function findRegionName(name: string): RegionId | null {
  const n = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const aliases: Record<string, RegionId> = {
    arica: "arica-parinacota",
    tarapaca: "tarapaca",
    antofagasta: "antofagasta",
    atacama: "atacama",
    coquimbo: "coquimbo",
    valparaiso: "valparaiso",
    metropolitana: "metropolitana",
    ohiggins: "ohiggins",
    "o'higgins": "ohiggins",
    "o’higgins": "ohiggins",
    maule: "maule",
    nuble: "nuble",
    biobio: "biobio",
    "bio-bio": "biobio",
    araucania: "araucania",
    "los rios": "los-rios",
    "los lagos": "los-lagos",
    aysen: "aysen",
    aisen: "aysen",
    magallanes: "magallanes",
  };
  return Object.entries(aliases).find(([key]) => n.includes(key))?.[1] ?? null;
}

export function isLocated(
  place: Place,
): place is Place & { latitude: number; longitude: number } {
  return (
    typeof place.latitude === "number" &&
    Number.isFinite(place.latitude) &&
    Math.abs(place.latitude) <= 90 &&
    typeof place.longitude === "number" &&
    Number.isFinite(place.longitude) &&
    Math.abs(place.longitude) <= 180
  );
}
export interface Preferences {
  region: RegionId;
  commune: string;
  theme: "system" | "light" | "dark";
  stopIds: string[];
  roundTrip: boolean;
}
export function normalizePreferences(value: unknown): Preferences | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const region = regionFeatures.some((f) => f.properties.id === v.region)
    ? (v.region as RegionId)
    : "valparaiso";
  const theme = v.theme === "dark" || v.theme === "light" ? v.theme : "system";
  const stopIds = Array.isArray(v.stopIds)
    ? [
        ...new Set(
          v.stopIds.filter(
            (id): id is string =>
              typeof id === "string" && places.some((p) => p.id === id),
          ),
        ),
      ].slice(0, 100)
    : [];
  const commune =
    typeof v.commune === "string" &&
    catalogTerritories.some(
      (p) =>
        p.level === "commune" && p.region === region && p.commune === v.commune,
    )
      ? v.commune
      : "all";
  return { region, commune, theme, stopIds, roundTrip: v.roundTrip === true };
}
