import {
  catalogTerritories,
  regionFeatures,
  places,
  findRegionName,
  isLocated,
} from "./catalog";
import { haversineDistanceKm } from "./geo";
import type { GeoPoint } from "./geo";
import type { RegionId } from "./index";
export interface DevicePermission {
  status: "granted" | "denied" | "undetermined";
  canAskAgain: boolean;
}
export interface DevicePosition {
  coords: GeoPoint & { accuracy: number | null };
  timestamp: number;
}
export interface DeviceAddress {
  region?: string | null;
  subregion?: string | null;
  city?: string | null;
  district?: string | null;
  isoCountryCode?: string | null;
}
export type LocationMode = "startup" | "automatic" | "manual";
export interface LocationAdapter {
  getPermission: () => Promise<DevicePermission>;
  requestPermission: () => Promise<DevicePermission>;
  servicesEnabled: () => Promise<boolean>;
  getPosition: () => Promise<DevicePosition>;
  reverseGeocode: (point: GeoPoint) => Promise<DeviceAddress[]>;
}
export interface LocatedArea {
  region: RegionId;
  commune: string | null;
  nearbyIds: string[];
  approximate: boolean;
}
export type LocationResult =
  | { status: "ready"; area: LocatedArea }
  | { status: "denied"; canAskAgain: boolean }
  | { status: "servicesOff" | "unresolved" | "stale" | "unavailable" };
function inRing(point: GeoPoint, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i],
      [xj, yj] = ring[j];
    if (
      yi > point.latitude !== yj > point.latitude &&
      point.longitude < ((xj - xi) * (point.latitude - yi)) / (yj - yi) + xi
    )
      inside = !inside;
  }
  return inside;
}
/** Resolución local de región: geometría referencial, sin enviar ni guardar posición. */
export function regionAtPoint(point: GeoPoint): RegionId | null {
  if (
    !Number.isFinite(point.latitude) ||
    !Number.isFinite(point.longitude) ||
    Math.abs(point.latitude) > 90 ||
    Math.abs(point.longitude) > 180
  )
    return null;
  return (
    regionFeatures.find((f) =>
      f.geometry.coordinates.some(
        (poly) =>
          inRing(point, poly[0]) &&
          !poly.slice(1).some((hole) => inRing(point, hole)),
      ),
    )?.properties.id ?? null
  );
}
const normalize = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/^(comuna|ciudad|municipalidad) de\s+/, "")
    .trim();
export function communeFromAddress(
  address: DeviceAddress,
  names: Record<string, string>,
): string | null {
  // subregion es provincia; no usarla como comuna (Petorca es ambos nombres).
  for (const name of [address.city, address.district]) {
    if (!name) continue;
    const n = normalize(name);
    const found = Object.entries(names).find(
      ([, label]) => normalize(label) === n,
    );
    if (found) return found[0];
  }
  return null;
}
export async function readDeviceLocation(
  adapter: LocationAdapter,
  mode: LocationMode,
  names: Record<string, string>,
  now = Date.now,
): Promise<LocationResult> {
  try {
    let permission = await adapter.getPermission();
    if (
      (mode === "startup" && permission.status === "undetermined") ||
      (mode === "manual" &&
        permission.status !== "granted" &&
        permission.canAskAgain)
    )
      permission = await adapter.requestPermission();
    if (permission.status !== "granted")
      return { status: "denied", canAskAgain: permission.canAskAgain };
    if (!(await adapter.servicesEnabled())) return { status: "servicesOff" };
    const position = await adapter.getPosition(),
      point = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    if (
      !Number.isFinite(position.timestamp) ||
      now() - position.timestamp > 120000 ||
      position.timestamp - now() > 30000
    )
      return { status: "stale" };
    if (
      !Number.isFinite(point.latitude) ||
      !Number.isFinite(point.longitude) ||
      Math.abs(point.latitude) > 90 ||
      Math.abs(point.longitude) > 180
    )
      return { status: "unresolved" };
    const geometric = regionAtPoint(point);
    let address: DeviceAddress | undefined;
    try {
      address = (await adapter.reverseGeocode(point))[0];
    } catch {
      /* La región puede resolverse localmente sin geocodificador. */
    }
    const geocoded = address
      ? (findRegionName(address.region ?? "") ??
        findRegionName(address.subregion ?? ""))
      : null;
    if (
      !geometric &&
      address?.isoCountryCode &&
      address.isoCountryCode !== "CL"
    )
      return { status: "unresolved" };
    const region = geometric ?? geocoded;
    if (!region) return { status: "unresolved" };
    const commune =
      address &&
      (!geocoded || geocoded === region) &&
      (!address.isoCountryCode || address.isoCountryCode === "CL")
        ? communeFromAddress(address, names)
        : null;
    const compatibleCommune =
      commune &&
      catalogTerritories.some(
        (p) =>
          p.level === "commune" && p.region === region && p.commune === commune,
      )
        ? commune
        : null;
    const nearbyIds = places
      .filter((p) => p.region === region)
      .filter(isLocated)
      .sort(
        (a, b) => haversineDistanceKm(point, a) - haversineDistanceKm(point, b),
      )
      .map((p) => p.id);
    return {
      status: "ready",
      area: {
        region,
        commune: compatibleCommune,
        nearbyIds,
        approximate:
          position.coords.accuracy === null || position.coords.accuracy > 5000,
      },
    };
  } catch {
    return { status: "unavailable" };
  }
}
