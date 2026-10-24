import { describe, expect, it } from "vitest";
import {
  curatedRoutes,
  decodeMapSelection,
  filterPlaces,
  haversineDistanceKm,
  findRegionName,
  isLocated,
  moveStop,
  normalizePreferences,
  places,
  regionFeatures,
  regionIds,
  serializeForHtml,
  swipeDirection,
  toggleStop,
} from "./index";
describe("catálogo heredado con procedencia", () => {
  it("conserva 37 referencias sin verificarlas automáticamente", () => {
    expect(places.filter((p) => p.origin !== "osm")).toHaveLength(37);
    expect(new Set(places.map((p) => p.id)).size).toBe(places.length);
    for (const p of places) {
      expect(p.verification).toBe("pending");
      if (p.source)
        expect(["http:", "https:"]).toContain(new URL(p.source.url).protocol);
      else expect(isLocated(p)).toBe(false);
    }
  });
  it("clasifica Las Palmas fuera de Petorca y no inventa el pin de una referencia oral", () => {
    expect(
      places.find((p) => p.id === "petorca-tunel-las-palmas")?.region,
    ).toBe("coquimbo");
    expect(
      isLocated(places.find((p) => p.id === "cabildo-castillo-del-diablo")!),
    ).toBe(false);
  });
  it("filtra sin confundir región, comuna, categoría o acentos", () => {
    const result = filterPlaces(
      "valparaiso",
      "la-ligua",
      "gastronomia",
      "chocolateria",
    );
    expect(result.map((p) => p.id)).toContain("chocolateria-matichoc");
    expect(filterPlaces("atacama", "papudo")).toEqual([]);
    expect(
      filterPlaces("valparaiso", "papudo").every((p) => p.commune === "papudo"),
    ).toBe(true);
  });
  it("cada recorrido conserva paradas que existen en el catálogo", () => {
    expect(curatedRoutes).toHaveLength(3);
    for (const route of curatedRoutes) {
      expect(route.stopIds.length).toBeGreaterThan(1);
      for (const id of route.stopIds)
        expect(places.some((p) => p.id === id)).toBe(true);
    }
  });
  it("las 16 regiones tienen geometría y extensiones válidas", () => {
    expect(regionFeatures.map((f) => f.properties.id).sort()).toEqual(
      [...regionIds].sort(),
    );
    for (const f of regionFeatures) {
      expect(f.geometry.coordinates.length).toBeGreaterThan(0);
      expect(f.properties.bounds[0][0]).toBeLessThan(f.properties.bounds[1][0]);
      expect(f.properties.bounds[0][1]).toBeLessThan(f.properties.bounds[1][1]);
    }
  });
});
describe("gestos y selección del viaje", () => {
  it("reconoce norte/sur y descarta deslizamientos horizontales y toques", () => {
    expect(swipeDirection(2, -80)).toBe("south");
    expect(swipeDirection(2, 80)).toBe("north");
    expect(swipeDirection(80, 10)).toBeNull();
    expect(swipeDirection(1, 6)).toBeNull();
    expect(swipeDirection(2, -24, -0.8)).toBe("south");
  });
  it("agrega/quita sin duplicados y reordena sin perder una parada", () => {
    expect(toggleStop(["a"], "a")).toEqual([]);
    expect(toggleStop(["a"], "b")).toEqual(["a", "b"]);
    expect(moveStop(["a", "b", "c"], "b", -1)).toEqual(["b", "a", "c"]);
    expect(moveStop(["a", "b"], "a", -1)).toEqual(["a", "b"]);
  });
  it("restaura solo campos válidos, sin conservar coordenadas del usuario", () => {
    const p = normalizePreferences({
      region: "inventada",
      theme: "desconocido",
      stopIds: ["playa-papudo", "playa-papudo", "no-existe"],
      latitude: -32,
      longitude: -71,
      roundTrip: true,
    });
    expect(p).toEqual({
      region: "valparaiso",
      commune: "all",
      theme: "system",
      stopIds: ["playa-papudo"],
      roundTrip: true,
    });
    expect(normalizePreferences(null)).toBeNull();
    expect(
      normalizePreferences({
        region: "valparaiso",
        theme: "dark",
        stopIds: ["playa-papudo"],
        roundTrip: true,
      }),
    ).toEqual({
      region: "valparaiso",
      commune: "all",
      theme: "dark",
      stopIds: ["playa-papudo"],
      roundTrip: true,
    });
  });
  it("interpreta nombres de regiones del geocodificador", () => {
    expect(findRegionName("Región de Valparaíso")).toBe("valparaiso");
    expect(findRegionName("Región del Biobío")).toBe("biobio");
    expect(findRegionName("unknown")).toBeNull();
  });
});
describe("puente del mapa", () => {
  it("solo acepta IDs propios y no interpreta instrucciones arbitrarias", () => {
    expect(decodeMapSelection('{"type":"place","id":"playa-papudo"}')).toEqual({
      type: "place",
      id: "playa-papudo",
    });
    expect(
      decodeMapSelection('{"type":"place","id":"inexistente"}'),
    ).toBeNull();
    expect(decodeMapSelection('{"type":"eval","id":"alert(1)"}')).toBeNull();
    expect(decodeMapSelection("bad")).toBeNull();
  });
  it("evita cerrar el script HTML a través de un nombre de lugar", () => {
    const payload = serializeForHtml({
      name: "</script><script>alert(1)</script>",
    });
    expect(payload).not.toContain("<");
    expect(JSON.parse(payload).name).toBe("</script><script>alert(1)</script>");
  });
});

it("la distancia reutilizada es estable, simétrica y no inventa tiempos por carretera", () => {
  const a = { latitude: -32.45, longitude: -71.23 },
    b = { latitude: -32.5, longitude: -71.44 };
  expect(haversineDistanceKm(a, a)).toBe(0);
  expect(haversineDistanceKm(a, b)).toBeCloseTo(haversineDistanceKm(b, a), 8);
  expect(haversineDistanceKm(a, b)).toBeGreaterThan(0);
});

describe("base comunitaria nacional", () => {
  it("separa 27 referencias OSM pendientes y cubre las 16 regiones", () => {
    const open = places.filter((p) => p.origin === "osm");
    expect(open).toHaveLength(27);
    expect([...new Set(open.map((p) => p.region))].sort()).toEqual(
      [...regionIds].sort(),
    );
    for (const p of open) {
      expect(p.source?.url).toMatch(
        /^https:\/\/www\.openstreetmap\.org\/(node|way)\/\d+$/,
      );
      expect(isLocated(p)).toBe(true);
      expect(p.verification).toBe("pending");
    }
  });
});
