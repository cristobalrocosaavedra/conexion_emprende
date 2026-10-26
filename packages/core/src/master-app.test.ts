import { expect, it } from "vitest";
import {
  catalogTerritories,
  communeName,
  filterPlaces,
  isLocated,
  localities,
  masterEvidence,
  masterRecords,
  normalizePreferences,
  places,
  searchTerritories,
} from "./catalog";
it("representa las 737 filas, todas las comunas y localidades sin borrar el catálogo anterior", () => {
  expect(masterRecords).toHaveLength(737);
  expect(new Set(masterRecords.map((r) => r.raw.id)).size).toBe(737);
  expect(catalogTerritories.filter((t) => t.level === "commune")).toHaveLength(
    346,
  );
  expect(places).toHaveLength(429);
  expect(localities).toHaveLength(67);
  expect(places.filter((p) => p.origin === "master")).toHaveLength(365);
  expect(masterEvidence["la-ligua-los-molles"].rowIds).toContain(
    "TV-ATR-00470",
  );
  expect(
    places.filter((p) => p.name === "Los Molles" && p.commune === "la-ligua"),
  ).toHaveLength(1);
});
it("encuentra atractivos de otras regiones con o sin coordenadas y no inventa puntos", () => {
  const cave = filterPlaces(
    "arica-parinacota",
    "arica",
    "all",
    "Cuevas de Anzota",
  )[0];
  expect(cave?.verification).toBe("pending");
  expect(isLocated(cave)).toBe(true);
  const park = filterPlaces(
    "metropolitana",
    "lo-espejo",
    "all",
    "Violeta Parra",
  )[0];
  expect(park).toBeDefined();
  expect(isLocated(park)).toBe(false);
  expect(park.latitude).toBeNull();
  expect(park.longitude).toBeNull();
});
it("distingue los parecidos por revisar y conserva las preferencias anteriores", () => {
  const c = places.find((p) => p.name === "Playa El Canelillo")!;
  expect(masterEvidence[c.id].possibleDuplicateIds).toHaveLength(1);
  expect(places.some((p) => p.name === "Playa El Canelo")).toBe(true);
  expect(
    normalizePreferences({
      region: "valparaiso",
      commune: "la-ligua",
      stopIds: ["chocolateria-matichoc"],
      theme: "dark",
    })?.stopIds,
  ).toEqual(["chocolateria-matichoc"]);
});
it("encuentra territorios sin atractivos y conserva su selección sin inventar CUT", () => {
  expect(
    searchTerritories("Camarones").some((t) => t.level === "commune"),
  ).toBe(true);
  expect(communeName("lo-espejo")).toBe("Lo Espejo");
  expect(
    normalizePreferences({
      region: "arica-parinacota",
      commune: "camarones",
      stopIds: [],
      theme: "dark",
    })?.commune,
  ).toBe("camarones");
  expect(
    catalogTerritories.every(
      (t) => t.cut === null && t.verification === "pending",
    ),
  ).toBe(true);
});
