import type { GeoPoint } from "./geo";
export type RouteFailureCode =
  | "network"
  | "timeout"
  | "noRoute"
  | "invalidResponse"
  | "tooManyStops"
  | "invalidPoints";
export class RouteFailure extends Error {
  constructor(
    public code: RouteFailureCode,
    options?: ErrorOptions,
  ) {
    super(code, options);
    this.name = "RouteFailure";
  }
}
export interface RoadStep {
  atMeters: number;
  distanceMeters: number;
  durationSeconds: number;
  type: string;
  modifier: string;
  roadName: string;
  exit: number | null;
}
export interface RoadRoute {
  points: GeoPoint[];
  distanceMeters: number;
  durationSeconds: number;
  steps: RoadStep[];
  waypointMeters: number[];
  snappedWaypoints: GeoPoint[];
}
const MAX_POINTS = 40,
  MAX_GEOMETRY = 250000,
  MAX_RESPONSE = 32000000;
const validPoint = (p: GeoPoint) =>
  Number.isFinite(p.latitude) &&
  Number.isFinite(p.longitude) &&
  Math.abs(p.latitude) <= 90 &&
  Math.abs(p.longitude) <= 180;
export function osrmRouteUrl(base: string, points: GeoPoint[]): string {
  if (points.length < 2 || points.some((p) => !validPoint(p)))
    throw new RouteFailure("invalidPoints");
  if (points.length > MAX_POINTS) throw new RouteFailure("tooManyStops");
  const url = new URL(base.endsWith("/") ? base : base + "/");
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new RouteFailure("invalidPoints");
  url.pathname += `route/v1/driving/${points.map((p) => `${p.longitude.toFixed(6)},${p.latitude.toFixed(6)}`).join(";")}`;
  url.search = new URLSearchParams({
    overview: "full",
    radiuses: points.map(() => "1000").join(";"),
    geometries: "geojson",
    steps: "true",
    alternatives: "false",
    generate_hints: "false",
  }).toString();
  return url.toString();
}
const record = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};
const nonnegative = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= 0;
function point(v: unknown): GeoPoint {
  if (
    !Array.isArray(v) ||
    v.length !== 2 ||
    typeof v[0] !== "number" ||
    typeof v[1] !== "number"
  )
    throw new RouteFailure("invalidResponse");
  const p = { longitude: v[0], latitude: v[1] };
  if (!validPoint(p)) throw new RouteFailure("invalidResponse");
  return p;
}
/** Solo interpreta geometría/indicaciones del proveedor; no inventa un trazado alternativo. */
export function parseOsrmRoute(
  value: unknown,
  expectedWaypoints: number,
): RoadRoute {
  const data = record(value);
  if (data.code === "NoRoute" || data.code === "NoSegment")
    throw new RouteFailure("noRoute");
  if (data.code !== "Ok" || !Array.isArray(data.routes) || !data.routes.length)
    throw new RouteFailure("invalidResponse");
  const route = record(data.routes[0]),
    geometry = record(route.geometry);
  if (
    geometry.type !== "LineString" ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length < 2 ||
    geometry.coordinates.length > MAX_GEOMETRY ||
    !nonnegative(route.distance) ||
    !nonnegative(route.duration)
  )
    throw new RouteFailure("invalidResponse");
  if (
    !Array.isArray(data.waypoints) ||
    data.waypoints.length !== expectedWaypoints ||
    !Array.isArray(route.legs) ||
    route.legs.length !== expectedWaypoints - 1
  )
    throw new RouteFailure("invalidResponse");
  const points = geometry.coordinates.map(point),
    steps: RoadStep[] = [],
    waypointMeters = [0];
  let distance = 0;
  for (const rawLeg of route.legs) {
    const leg = record(rawLeg);
    if (
      !nonnegative(leg.distance) ||
      !Array.isArray(leg.steps) ||
      leg.steps.length > 10000
    )
      throw new RouteFailure("invalidResponse");
    let stepDistance = 0;
    for (const rawStep of leg.steps) {
      const s = record(rawStep),
        m = record(s.maneuver);
      if (
        !nonnegative(s.distance) ||
        !nonnegative(s.duration) ||
        typeof m.type !== "string"
      )
        throw new RouteFailure("invalidResponse");
      point(m.location);
      steps.push({
        atMeters: distance + stepDistance,
        distanceMeters: s.distance,
        durationSeconds: s.duration,
        type: m.type.slice(0, 40),
        modifier: typeof m.modifier === "string" ? m.modifier.slice(0, 30) : "",
        roadName: typeof s.name === "string" ? s.name.slice(0, 160) : "",
        exit:
          typeof m.exit === "number" && Number.isInteger(m.exit) && m.exit > 0
            ? m.exit
            : null,
      });
      stepDistance += s.distance;
    }
    distance += leg.distance;
    waypointMeters.push(distance);
  }
  if (
    Math.abs(distance - route.distance) > Math.max(100, route.distance * 0.02)
  )
    throw new RouteFailure("invalidResponse");
  return {
    points,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    steps,
    waypointMeters,
    snappedWaypoints: data.waypoints.map((w) => point(record(w).location)),
  };
}
export async function fetchRoadRoute(
  base: string,
  points: GeoPoint[],
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
): Promise<RoadRoute> {
  const url = osrmRouteUrl(base, points);
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) controller.abort();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 25000);
  try {
    const response = await fetcher(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-store",
        "User-Agent":
          "TerritorioVivo-Beta/0.4.1 (+https://github.com/cristobalrocosaavedra/conexion_emprende)",
      },
    });
    if (Number(response.headers.get("content-length")) > MAX_RESPONSE)
      throw new RouteFailure("invalidResponse");
    const text = await response.text();
    if (text.length > MAX_RESPONSE) throw new RouteFailure("invalidResponse");
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new RouteFailure("invalidResponse", { cause: error });
    }
    if (
      !response.ok &&
      record(data).code !== "NoRoute" &&
      record(data).code !== "NoSegment"
    )
      throw new RouteFailure("network");
    return parseOsrmRoute(data, points.length);
  } catch (error) {
    if (error instanceof RouteFailure) throw error;
    if (controller.signal.aborted && !timedOut) throw error;
    throw new RouteFailure(timedOut ? "timeout" : "network", { cause: error });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
