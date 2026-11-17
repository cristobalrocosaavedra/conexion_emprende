// Módulo liviano (sin catálogo) para usar también en el navegador.
import type { RegionId } from "@territorio-vivo/core";

export type Zone = "norte" | "centro" | "sur" | "austral";
export const zones: Zone[] = ["norte", "centro", "sur", "austral"];
export const zoneRegions: Record<Zone, RegionId[]> = {
  norte: ["arica-parinacota", "tarapaca", "antofagasta", "atacama", "coquimbo"],
  centro: ["valparaiso", "metropolitana", "ohiggins", "maule"],
  sur: ["nuble", "biobio", "araucania", "los-rios", "los-lagos"],
  austral: ["aysen", "magallanes"],
};
/** Ilustración de portada de cada zona (colección 0.7). */
export const zoneArt: Record<Zone, string> = {
  norte: "atacama",
  centro: "valparaiso",
  sur: "araucania",
  austral: "magallanes",
};
export const regionOrder: RegionId[] = zones.flatMap((z) => zoneRegions[z]);
export function zoneOf(region: RegionId): Zone {
  return zones.find((z) => zoneRegions[z].includes(region))!;
}
