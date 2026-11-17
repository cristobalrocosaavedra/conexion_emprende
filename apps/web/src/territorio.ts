// Datos del sitio calculados al compilar desde el catálogo compartido.
// Solo se usa en componentes de servidor: el catálogo completo no viaja al navegador.
import {
  catalogTerritories,
  curatedRoutes,
  haversineDistanceKm,
  isBusinessPlace,
  places,
  regionIds,
  verificationRecords,
  visualScene,
} from "@territorio-vivo/core";
import type {
  Category,
  Place,
  RegionId,
  VerificationRecord,
} from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";

export { zones, zoneRegions, zoneArt, zoneOf } from "./zonas";
export type { Zone } from "./zonas";
export const regions = [...regionIds];
export const regionName = (id: RegionId) => t.regionShortNames[id];
export const regionTitle = (id: RegionId) =>
  t.sitio.regionTitle(t.regions[id], id);

export interface Province {
  id: string;
  name: string;
  region: RegionId;
}
export interface Commune {
  id: string;
  name: string;
  region: RegionId;
  province: string;
}
export const provinces: Province[] = catalogTerritories
  .filter((x) => x.level === "province")
  .map((x) => ({ id: x.province!, name: x.name, region: x.region }));
export const communes: Commune[] = catalogTerritories
  .filter((x) => x.level === "commune")
  .map((x) => ({
    id: x.commune!,
    name: x.name,
    region: x.region,
    province: x.province!,
  }));
const communeIndex = new Map(communes.map((c) => [c.id, c]));
const provinceIndex = new Map(provinces.map((p) => [p.id, p]));
export const communeById = (id: string) => communeIndex.get(id);
export const provinceById = (id: string) => provinceIndex.get(id);
export const provincesOf = (region: RegionId) =>
  provinces.filter((p) => p.region === region);
export const communesOf = (province: string) =>
  communes.filter((c) => c.province === province);
export const communesOfRegion = (region: RegionId) =>
  communes.filter((c) => c.region === region);

/** Direcciones fijas del sitio: ninguna comuna ni ficha puede usarlas. */
export const reservedSegments = [
  "region",
  "provincia",
  "mi-ruta",
  "favoritos",
  "destinos",
  "panoramas",
  "negocios",
  "negocios-locales",
  "explorar",
  "suma-tu-negocio",
  "planes",
  "municipios",
  "fuentes",
  "terminos",
  "privacidad",
  "buscar",
  "indice.json",
  "arte",
  "_next",
];

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

/** Dirección estable por comuna: nombre del lugar, con sufijo si se repite. */
const placeSlugs = new Map<string, string>();
const placeBySlugIndex = new Map<string, Place>();
for (const commune of new Set(places.map((p) => p.commune))) {
  const used = new Set(["explorar", "negocios"]);
  for (const place of places
    .filter((p) => p.commune === commune)
    .sort((a, b) => a.id.localeCompare(b.id))) {
    const base = slugify(place.name) || "lugar";
    let slug = base;
    for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`;
    used.add(slug);
    placeSlugs.set(place.id, slug);
    placeBySlugIndex.set(`${commune}/${slug}`, place);
  }
}
export const placeSlug = (p: Place) => placeSlugs.get(p.id)!;
export const placeBySlug = (commune: string, slug: string) =>
  placeBySlugIndex.get(`${commune}/${slug}`);
export const placeById = (id: string) => places.find((p) => p.id === id);

export const href = {
  region: (id: string) => `/region/${id}`,
  province: (id: string) => `/provincia/${id}`,
  commune: (id: string) => `/${id}`,
  place: (p: Place) => `/${p.commune}/${placeSlug(p)}`,
  explore: (commune?: string) =>
    commune ? `/explorar/${commune}` : "/explorar/",
};

export type Level = "region" | "province" | "commune";
export interface TerritoryRef {
  level: Level;
  id: string;
  name: string;
  title: string;
  region: RegionId;
  basePath: string;
}
export function territory(level: Level, id: string): TerritoryRef {
  if (level === "region") {
    const region = id as RegionId;
    return {
      level,
      id,
      name: regionName(region),
      title: regionTitle(region),
      region,
      basePath: href.region(id),
    };
  }
  if (level === "province") {
    const p = provinceById(id)!;
    return {
      level,
      id,
      name: p.name,
      title: t.sitio.provinceTitle(p.name),
      region: p.region,
      basePath: href.province(id),
    };
  }
  const c = communeById(id)!;
  return {
    level,
    id,
    name: c.name,
    title: c.name,
    region: c.region,
    basePath: href.commune(id),
  };
}

const byName = (a: Place, b: Place) => a.name.localeCompare(b.name, "es");
export function placesIn(ref: Pick<TerritoryRef, "level" | "id">): Place[] {
  return places
    .filter((p) =>
      ref.level === "region"
        ? p.region === ref.id
        : ref.level === "province"
          ? p.province === ref.id
          : p.commune === ref.id,
    )
    .sort(byName);
}
/** Comercio local: categorías sujetas a plan (definidas en core). */
export const isBusiness = (p: Place) => isBusinessPlace(p);
/** En mapa y rutas: atractivos siempre; negocios desde el plan Completo. */
export const onMap = (p: Place) => p.onMap !== false;
export const categoriesOrder: Category[] = [
  "playa",
  "naturaleza",
  "cultura",
  "gastronomia",
];
export const isLocated = (p: Place) =>
  p.latitude !== null && p.longitude !== null;

export function routesIn(list: Place[]) {
  const ids = new Set(list.filter(onMap).map((p) => p.id));
  return curatedRoutes.filter((r) => r.stopIds.some((id) => ids.has(id)));
}

export function nearby(place: Place, count = 3) {
  if (!isLocated(place)) return [];
  const origin = { latitude: place.latitude!, longitude: place.longitude! };
  return places
    .filter((p) => p.id !== place.id && isLocated(p))
    .map((p) => ({
      place: p,
      km: haversineDistanceKm(origin, {
        latitude: p.latitude!,
        longitude: p.longitude!,
      }),
    }))
    .filter((x) => x.km < 60)
    .sort((a, b) => a.km - b.km)
    .slice(0, count);
}

export const evidenceOf = (p: Place): VerificationRecord | undefined =>
  verificationRecords[p.id];

/** Arte de un lugar: logo completo del titular cuando existe; si no, ilustración de zona. */
export function placeArt(p: Place): {
  src: string;
  fit: "contain" | "cover";
  label: string;
} {
  if (p.id === "chocolateria-matichoc")
    return {
      src: "/arte/matichoc-logo.webp",
      fit: "contain",
      label: t.matichocLogo,
    };
  const scene = visualScene(p.region, p.commune, p.category === "playa");
  return {
    src: `/arte/${scene}.webp`,
    fit: "cover",
    label: `${t.sitio.illustration} · ${t.visualScenes[scene]}`,
  };
}
export function territoryArt(region: RegionId, commune?: string) {
  const scene = visualScene(region, commune);
  return {
    src: `/arte/${scene}.webp`,
    label: `${t.sitio.illustration} · ${t.visualScenes[scene]}`,
  };
}

/** Forma compacta para el navegador (Mi ruta, favoritos, mapas). */
export interface PlaceLite {
  id: string;
  name: string;
  category: Category;
  region: RegionId;
  commune: string;
  communeName: string;
  href: string;
  lat: number | null;
  lon: number | null;
  verification: Place["verification"];
  onMap: boolean;
}
export function lite(p: Place): PlaceLite {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    region: p.region,
    commune: p.commune,
    communeName: communeById(p.commune)?.name ?? p.commune,
    href: href.place(p),
    lat: p.latitude,
    lon: p.longitude,
    verification: p.verification,
    onMap: onMap(p),
  };
}
export const allLite = () =>
  places.map(lite).sort((a, b) => a.name.localeCompare(b.name, "es"));
export { places };
