/* eslint-disable @typescript-eslint/no-require-imports -- Metro requiere rutas estáticas para empaquetar imágenes. */
import { messages as t } from "@territorio-vivo/i18n";
import type { ImageSourcePropType } from "react-native";
import { visualScene } from "@territorio-vivo/core";
import type { Place, RegionId, VisualSceneId } from "@territorio-vivo/core";
const scenes: Record<VisualSceneId, ImageSourcePropType> = {
  "arica-parinacota": require("../assets/territorio/coleccion/arica-parinacota.webp"),
  tarapaca: require("../assets/territorio/coleccion/tarapaca.webp"),
  antofagasta: require("../assets/territorio/coleccion/antofagasta.webp"),
  atacama: require("../assets/territorio/coleccion/atacama.webp"),
  coquimbo: require("../assets/territorio/coleccion/coquimbo.webp"),
  valparaiso: require("../assets/territorio/coleccion/valparaiso.webp"),
  metropolitana: require("../assets/territorio/coleccion/metropolitana.webp"),
  ohiggins: require("../assets/territorio/coleccion/ohiggins.webp"),
  maule: require("../assets/territorio/coleccion/maule.webp"),
  nuble: require("../assets/territorio/coleccion/nuble.webp"),
  biobio: require("../assets/territorio/coleccion/biobio.webp"),
  araucania: require("../assets/territorio/coleccion/araucania.webp"),
  "los-rios": require("../assets/territorio/coleccion/los-rios.webp"),
  "los-lagos": require("../assets/territorio/coleccion/los-lagos.webp"),
  aysen: require("../assets/territorio/coleccion/aysen.webp"),
  magallanes: require("../assets/territorio/coleccion/magallanes.webp"),
  "petorca-interior": require("../assets/territorio/coleccion/petorca-interior.webp"),
  "litoral-central": require("../assets/territorio/coleccion/litoral-central.webp"),
  "choapa-costa": require("../assets/territorio/coleccion/choapa-costa.webp"),
  chiloe: require("../assets/territorio/coleccion/chiloe.webp"),
  altiplano: require("../assets/territorio/coleccion/altiplano.webp"),
  "valparaiso-interior": require("../assets/territorio/coleccion/valparaiso-interior.webp"),
  "coquimbo-costa": require("../assets/territorio/coleccion/coquimbo-costa.webp"),
  "rapa-nui": require("../assets/territorio/coleccion/rapa-nui.webp"),
};
const focus: Partial<Record<VisualSceneId, number>> = {
  "arica-parinacota": 0.65,
  tarapaca: 0.73,
  antofagasta: 0.65,
  atacama: 0.45,
  valparaiso: 0.4,
  metropolitana: 0.53,
  ohiggins: 0.45,
  araucania: 0.48,
  magallanes: 0.48,
  "litoral-central": 0.56,
  "choapa-costa": 0.55,
  "coquimbo-costa": 0.46,
};
export function regionArt(
  region: RegionId,
  commune?: string | null,
): ImageSourcePropType {
  return scenes[visualScene(region, commune)];
}
export function regionArtFocus(
  region: RegionId,
  commune?: string | null,
): number {
  return focus[visualScene(region, commune)] ?? 0.5;
}
export function regionArtLabel(
  region: RegionId,
  commune?: string | null,
): string {
  return `${t.artLabel} · ${t.visualScenes[visualScene(region, commune)]}`;
}
export function placeArt(place: Place): ImageSourcePropType {
  if (place.id === "chocolateria-matichoc")
    return require("../assets/territorio/matichoc-logo.webp");
  return scenes[
    visualScene(place.region, place.commune, place.category === "playa")
  ];
}
export function routeArt(id: string): ImageSourcePropType {
  return scenes[
    id === "ruta-costera-papudo-zapallar"
      ? "litoral-central"
      : "petorca-interior"
  ];
}
export function eventArt(
  region: RegionId,
  commune?: string | null,
): ImageSourcePropType {
  return regionArt(region, commune);
}
export function placeArtLabel(place: Place): string {
  return place.id === "chocolateria-matichoc"
    ? t.matichocLogo
    : `${t.artLabel} · ${t.visualScenes[visualScene(place.region, place.commune, place.category === "playa")]}`;
}
export function placeArtFit(place: Place): "contain" | "cover" {
  return place.id === "chocolateria-matichoc" ? "contain" : "cover";
}
