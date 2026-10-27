import type { GeoPoint } from "./geo";
export type RoadArea = "mainland" | "rapa-nui" | "juan-fernandez";
/** Ámbitos técnicos disjuntos para evitar rutas por océano; no son límites CUT. */
export function roadAreaAtPoint(p: GeoPoint): RoadArea {
  if (
    p.longitude > -110 &&
    p.longitude < -108 &&
    p.latitude > -28 &&
    p.latitude < -26
  )
    return "rapa-nui";
  if (
    p.longitude > -82 &&
    p.longitude < -78 &&
    p.latitude > -35 &&
    p.latitude < -32
  )
    return "juan-fernandez";
  return "mainland";
}
export function roadAreaForPlace(p: {
  commune: string;
  latitude: number | null;
  longitude: number | null;
}): RoadArea {
  if (p.commune === "isla-de-pascua") return "rapa-nui";
  if (p.commune === "juan-fernandez") return "juan-fernandez";
  return p.latitude !== null && p.longitude !== null
    ? roadAreaAtPoint({ latitude: p.latitude, longitude: p.longitude })
    : "mainland";
}
export function singleRoadArea(points: GeoPoint[]): boolean {
  return new Set(points.map(roadAreaAtPoint)).size <= 1;
}
/** Reordena solo las paradas de un recorrido; conserva los destinos de otros viajes. */
export function moveAreaStop(
  ids: string[],
  areaIds: string[],
  id: string,
  direction: -1 | 1,
): string[] {
  const from = areaIds.indexOf(id),
    other = areaIds[from + direction];
  if (!other || from < 0) return ids;
  const a = ids.indexOf(id),
    b = ids.indexOf(other);
  if (a < 0 || b < 0) return ids;
  const result = [...ids];
  [result[a], result[b]] = [result[b], result[a]];
  return result;
}
export function schematicSegments<
  T extends {
    commune: string;
    latitude: number | null;
    longitude: number | null;
  },
>(points: T[], roundTrip: boolean): T[][] {
  const groups = new Map<RoadArea, T[]>();
  for (const p of points) {
    const key = roadAreaForPlace(p);
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  return [...groups.values()].map((group) =>
    roundTrip && group.length > 1 ? [...group, group[0]] : group,
  );
}
