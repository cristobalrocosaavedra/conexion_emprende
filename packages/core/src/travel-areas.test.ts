import { expect, it, vi } from "vitest";
import { filterPlaces, places } from "./catalog";
import {
  roadAreaAtPoint,
  roadAreaForPlace,
  singleRoadArea,
  moveAreaStop,
  schematicSegments,
} from "./travel-areas";
import { fetchRoadRoute, osrmRouteUrl } from "./road-routing";
import { readDeviceLocation } from "./device-location";
const rapa = places.filter((p) => p.commune === "isla-de-pascua");
const mainland = { latitude: -32.4498524, longitude: -71.2320966 };
it("conserva La Ligua y cuenta toda Valparaíso además de Rapa Nui", () => {
  expect(filterPlaces("valparaiso")).toHaveLength(90);
  expect(filterPlaces("valparaiso", "la-ligua")).toHaveLength(11);
  expect(rapa).toHaveLength(4);
  expect(filterPlaces("valparaiso", "all", "all", "Rapa Nui")).toHaveLength(4);
  expect(filterPlaces("valparaiso", "all", "all", "Tongariki")[0].id).toBe(
    "osm-way-221696391",
  );
  for (const p of rapa) {
    expect(p.verification).toBe("pending");
    expect(p.source?.url).toMatch(
      /^https:\/\/www.openstreetmap.org\/way\/\d+$/,
    );
    expect(roadAreaForPlace(p)).toBe("rapa-nui");
  }
});
it("bloquea el cruce del océano antes de enviar una consulta, y admite recorrido local", async () => {
  const point = { latitude: rapa[0].latitude!, longitude: rapa[0].longitude! };
  const fetcher = vi.fn<typeof fetch>();
  await expect(
    fetchRoadRoute(
      "https://example.org/",
      [mainland, point],
      undefined,
      fetcher,
    ),
  ).rejects.toMatchObject({ code: "requiresFlight" });
  expect(fetcher).not.toHaveBeenCalled();
  expect(() =>
    osrmRouteUrl(
      "https://example.org/",
      rapa
        .slice(0, 2)
        .map((p) => ({ latitude: p.latitude!, longitude: p.longitude! })),
    ),
  ).not.toThrow();
  expect(singleRoadArea([mainland, point])).toBe(false);
});
it("el esquema y el reordenamiento conservan destinos separados sin dibujar un puente", () => {
  const a = places.find((p) => p.id === "museo-de-la-ligua")!;
  const b = places.find((p) => p.id === "papudo-plaza")!;
  const segments = schematicSegments([a, rapa[0], b, rapa[1]], true);
  expect(segments).toHaveLength(2);
  expect(
    segments.every((group) => new Set(group.map(roadAreaForPlace)).size === 1),
  ).toBe(true);
  expect(
    moveAreaStop([a.id, rapa[0].id, b.id], [a.id, b.id], b.id, -1),
  ).toEqual([b.id, rapa[0].id, a.id]);
});
it("identifica Rapa Nui desde posición consentida incluso sin geocodificador", async () => {
  const now = 1800000000000;
  const point = { latitude: rapa[0].latitude!, longitude: rapa[0].longitude! };
  expect(roadAreaAtPoint(point)).toBe("rapa-nui");
  const result = await readDeviceLocation(
    {
      getPermission: async () => ({ status: "granted", canAskAgain: true }),
      requestPermission: vi.fn(),
      servicesEnabled: async () => true,
      getPosition: async () => ({
        coords: { ...point, accuracy: 10 },
        timestamp: now,
      }),
      reverseGeocode: async () => {
        throw Error("Sin conexión de ejemplo");
      },
    },
    "startup",
    {},
    () => now,
  );
  expect(result.status).toBe("ready");
  if (result.status === "ready") {
    expect(result.area.region).toBe("valparaiso");
    expect(result.area.commune).toBe("isla-de-pascua");
    expect(JSON.stringify(result)).not.toContain("longitude");
  }
});
