import { haversineDistanceKm } from "./geo";
import type { GeoPoint } from "./geo";
import type { RoadRoute } from "./road-routing";
export interface NavigationFix extends GeoPoint {
  accuracy: number | null;
  timestamp: number;
  heading?: number | null;
  speed?: number | null;
}
export interface RouteProjection {
  point: GeoPoint;
  distanceFromRoute: number;
  progressMeters: number;
}
export interface NavigationUpdate {
  projection: RouteProjection;
  reliable: boolean;
  offRoute: boolean;
  arrived: boolean;
  nextStepIndex: number;
  distanceToManeuver: number;
  remainingMeters: number;
  remainingSeconds: number;
}
export function routeLengths(points: GeoPoint[]): number[] {
  const out: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    if (i) total += haversineDistanceKm(points[i - 1], points[i]) * 1000;
    out.push(total);
  }
  return out;
}
/** Ajuste en memoria; no acumula un historial de posiciones. Limita saltos en rutas que se cruzan. */
export function projectOnRoad(
  points: GeoPoint[],
  lengths: number[],
  position: GeoPoint,
  routeMeters: number,
  previousMeters = 0,
  maxAdvance = 500,
): RouteProjection {
  let best: RouteProjection | null = null;
  const total = lengths.at(-1) ?? 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i],
      cos = Math.cos((position.latitude * Math.PI) / 180),
      ax = (a.longitude - position.longitude) * cos,
      ay = a.latitude - position.latitude,
      bx = (b.longitude - position.longitude) * cos,
      by = b.latitude - position.latitude,
      dx = bx - ax,
      dy = by - ay;
    const amount = Math.max(
      0,
      Math.min(1, -(ax * dx + ay * dy) / (dx * dx + dy * dy || 1)),
    );
    const projected = {
      latitude: a.latitude + (b.latitude - a.latitude) * amount,
      longitude: a.longitude + (b.longitude - a.longitude) * amount,
    };
    const progress =
      total > 0
        ? ((lengths[i - 1] + (lengths[i] - lengths[i - 1]) * amount) / total) *
          routeMeters
        : 0;
    if (
      progress < previousMeters - 80 ||
      progress > previousMeters + maxAdvance
    )
      continue;
    const distance = haversineDistanceKm(position, projected) * 1000;
    if (!best || distance < best.distanceFromRoute)
      best = {
        point: projected,
        distanceFromRoute: distance,
        progressMeters: progress,
      };
  }
  if (best) return best;
  const fallback = points[0] ?? position;
  return {
    point: fallback,
    distanceFromRoute: haversineDistanceKm(position, fallback) * 1000,
    progressMeters: previousMeters,
  };
}
export function navigationUpdate(
  route: RoadRoute,
  lengths: number[],
  fix: NavigationFix,
  previousMeters: number,
  maxAdvance: number,
  now = Date.now(),
): NavigationUpdate {
  const reliable =
    fix.accuracy !== null &&
    fix.accuracy <= 100 &&
    fix.accuracy >= 0 &&
    now - fix.timestamp <= 30000 &&
    fix.timestamp - now <= 5000;
  const projection = projectOnRoad(
    route.points,
    lengths,
    fix,
    route.distanceMeters,
    previousMeters,
    maxAdvance,
  );
  const progress = reliable
    ? Math.max(previousMeters, projection.progressMeters)
    : previousMeters;
  const remainingMeters = Math.max(0, route.distanceMeters - progress);
  const nextIndex = route.steps.findIndex((s) => s.atMeters > progress + 8);
  const nextStepIndex =
    nextIndex < 0 ? Math.max(0, route.steps.length - 1) : nextIndex;
  const destination = route.snappedWaypoints.at(-1) ?? route.points.at(-1)!;
  const arrived =
    reliable &&
    fix.accuracy! <= 50 &&
    remainingMeters <= 40 &&
    haversineDistanceKm(fix, destination) * 1000 <= 40;
  return {
    projection: { ...projection, progressMeters: progress },
    reliable,
    offRoute:
      reliable &&
      projection.distanceFromRoute > Math.max(60, (fix.accuracy ?? 0) * 2),
    arrived,
    nextStepIndex,
    distanceToManeuver: Math.max(
      0,
      (route.steps[nextStepIndex]?.atMeters ?? route.distanceMeters) - progress,
    ),
    remainingMeters,
    remainingSeconds:
      route.distanceMeters > 0
        ? (route.durationSeconds * remainingMeters) / route.distanceMeters
        : 0,
  };
}
