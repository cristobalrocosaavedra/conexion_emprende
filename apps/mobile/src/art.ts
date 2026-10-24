/* eslint-disable @typescript-eslint/no-require-imports -- Metro requiere rutas estáticas para empaquetar imágenes. */
import { messages as t } from "@territorio-vivo/i18n";
import type { ImageSourcePropType } from "react-native";
import type { Place, RegionId } from "@territorio-vivo/core";
const covers = {
  norte: require("../assets/territorio/norte.webp"),
  centro: require("../assets/territorio/centro.webp"),
  sur: require("../assets/territorio/sur.webp"),
  austral: require("../assets/territorio/austral.webp"),
};
const regional: Record<RegionId, ImageSourcePropType> = {
  "arica-parinacota": covers.norte,
  tarapaca: covers.norte,
  antofagasta: covers.norte,
  atacama: covers.norte,
  coquimbo: covers.norte,
  valparaiso: covers.centro,
  metropolitana: covers.centro,
  ohiggins: covers.centro,
  maule: covers.centro,
  nuble: covers.centro,
  biobio: covers.sur,
  araucania: covers.sur,
  "los-rios": covers.sur,
  "los-lagos": covers.sur,
  aysen: covers.austral,
  magallanes: covers.austral,
};
const categories = {
  playa: require("../assets/territorio/playa.webp"),
  naturaleza: require("../assets/territorio/humedal.webp"),
  cultura: require("../assets/territorio/plaza.webp"),
  gastronomia: require("../assets/territorio/hostales.webp"),
};
const routeImages: Record<string, ImageSourcePropType> = {
  "ruta-del-diablo": require("../assets/territorio/ruta-del-diablo.webp"),
  "ruta-costera-papudo-zapallar": require("../assets/territorio/ruta-costera-papudo-zapallar.webp"),
  "ruta-patrimonial-la-ligua-cabildo": require("../assets/territorio/ruta-patrimonial-la-ligua-cabildo.webp"),
};
export function regionArt(region: RegionId): ImageSourcePropType {
  return regional[region];
}
export function placeArt(place: Place): ImageSourcePropType {
  if (place.id === "chocolateria-matichoc")
    return require("../assets/territorio/matichoc-tableta.jpg");
  return categories[place.category];
}
export function routeArt(id: string): ImageSourcePropType {
  return routeImages[id] ?? covers.centro;
}

export function eventArt(index: number): ImageSourcePropType {
  return [
    categories.cultura,
    require("../assets/territorio/paseo-costanera.webp"),
    categories.gastronomia,
  ][index % 3];
}

export function placeArtLabel(place: Place): string {
  return place.id === "chocolateria-matichoc" ? t.productPhoto : t.artLabel;
}
