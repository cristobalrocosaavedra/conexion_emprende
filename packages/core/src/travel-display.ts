import { places } from "./catalog";
import type { Place } from "./catalog";
import { haversineDistanceKm } from "./geo";
import type { GeoPoint } from "./geo";
import type { RegionId } from "./index";
export function durationParts(seconds: number) {
  const total = Math.max(
    0,
    Math.ceil(Number.isFinite(seconds) ? seconds / 60 : 0),
  );
  return { hours: Math.floor(total / 60), minutes: total % 60 };
}
const normalized = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
function similar(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0,
    j = 0,
    edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length <= b.length) j++;
    if (a.length >= b.length) i++;
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}
export function nationalSuggestions(query: string, region: RegionId): Place[] {
  const q = normalized(query);
  if (q.length < 2) return [];
  const tokens = q.split(/\s+/);
  return places
    .filter(
      (p) =>
        p.region !== region &&
        tokens.every(
          (word) =>
            normalized(p.name + " " + p.summary).includes(word) ||
            (word.length >= 5 &&
              normalized(p.name)
                .split(/\s+/)
                .some((name) => similar(word, name))),
        ),
    )
    .sort(
      (a, b) =>
        Number(normalized(b.name).includes(q)) -
          Number(normalized(a.name).includes(q)) ||
        a.name.localeCompare(b.name, "es"),
    );
}
/** Rumbo del vehículo: prioriza curso GPS al moverse; deriva del desplazamiento si falta. Sin brújula al detenerse. */
export function travelHeading(
  previous: GeoPoint | null,
  current: GeoPoint,
  course: number | null,
  speed: number | null,
  previousHeading: number | null,
): number | null {
  if (
    course !== null &&
    Number.isFinite(course) &&
    course >= 0 &&
    course < 360 &&
    speed !== null &&
    speed >= 2
  )
    return course;
  if (speed !== null && Number.isFinite(speed) && speed >= 0 && speed < 2)
    return previousHeading;
  if (!previous || haversineDistanceKm(previous, current) * 1000 < 12)
    return previousHeading;
  const r = Math.PI / 180,
    a = previous.latitude * r,
    b = current.latitude * r,
    d = (current.longitude - previous.longitude) * r;
  return (
    (Math.atan2(
      Math.sin(d) * Math.cos(b),
      Math.cos(a) * Math.sin(b) - Math.sin(a) * Math.cos(b) * Math.cos(d),
    ) /
      r +
      360) %
    360
  );
}
