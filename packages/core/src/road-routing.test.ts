import { describe, it, expect, vi } from "vitest";
import realResponse from "../../../tests/routing/fixtures/respuesta-arica.json";
import { fetchRoadRoute, osrmRouteUrl, parseOsrmRoute } from "./road-routing";
import {
  checkRoutingServer,
  routingServerUrl,
  PUBLIC_ROUTING_URL,
} from "./routing-server";
import { navigationUpdate, routeLengths } from "./live-navigation";
import type { RoadRoute } from "./road-routing";
// Geometría y maniobras artificiales, solo para pruebas, nunca catálogo turístico.
const points = [
  { latitude: 0, longitude: 0 },
  { latitude: 0, longitude: 0.01 },
  { latitude: 0.01, longitude: 0.01 },
];
const sample = {
  code: "Ok",
  waypoints: [{ location: [0, 0] }, { location: [0.01, 0.01] }],
  routes: [
    {
      distance: 2000,
      duration: 200,
      geometry: {
        type: "LineString",
        coordinates: [
          [0, 0],
          [0.01, 0],
          [0.01, 0.01],
        ],
      },
      legs: [
        {
          distance: 2000,
          steps: [
            {
              distance: 1000,
              duration: 100,
              name: "Calle de ejemplo",
              maneuver: { type: "depart", location: [0, 0] },
            },
            {
              distance: 1000,
              duration: 100,
              name: "Otra calle de ejemplo",
              maneuver: { type: "turn", modifier: "left", location: [0.01, 0] },
            },
            {
              distance: 0,
              duration: 0,
              maneuver: { type: "arrive", location: [0.01, 0.01] },
            },
          ],
        },
      ],
    },
  ],
};
const route = (): RoadRoute => parseOsrmRoute(sample, 2);
describe("ruta vial propia", () => {
  it("habilita solo el servicio público autorizado sin fingir capabilities privadas", async () => {
    const fake = vi.fn();
    const server = await checkRoutingServer(PUBLIC_ROUTING_URL, fake);
    expect(server.baseUrl).toBe(PUBLIC_ROUTING_URL);
    expect(server.maxWaypoints).toBe(40);
    expect(fake).not.toHaveBeenCalled();
  });

  it("interpreta una respuesta de OSRM real procesada con calles de Arica", () => {
    const r = parseOsrmRoute(realResponse, 2);
    expect(r.points).toHaveLength(26);
    expect(r.steps).toHaveLength(5);
    expect(r.distanceMeters).toBeGreaterThan(980);
  });
  it("interpreta NoSegment incluso cuando OSRM usa HTTP 400", async () => {
    await expect(
      fetchRoadRoute(
        "https://rutas.example",
        points.slice(0, 2),
        undefined,
        async () =>
          new Response(JSON.stringify({ code: "NoSegment" }), { status: 400 }),
      ),
    ).rejects.toThrow("noRoute");
  });

  it("ordena longitud/latitud, solicita geometría e indicaciones y limita paradas", () => {
    const u = new URL(osrmRouteUrl("https://rutas.example/", points));
    expect(u.pathname).toContain("0.010000,0.000000");
    expect(u.searchParams.get("steps")).toBe("true");
    expect(() => osrmRouteUrl("http://rutas.example", points)).toThrow();
    expect(() =>
      osrmRouteUrl("https://rutas.example", Array(41).fill(points[0])),
    ).toThrow();
  });
  it("conserva la curva de calles e indicaciones del proveedor", () => {
    const r = route();
    expect(r.points).toEqual(points);
    expect(r.steps[1].atMeters).toBe(1000);
    expect(r.steps[1].modifier).toBe("left");
    expect(r.waypointMeters).toEqual([0, 2000]);
  });
  it("rechaza errores sin inventar una línea como ruta", () => {
    expect(() => parseOsrmRoute({ code: "NoRoute" }, 2)).toThrow("noRoute");
    const invalid = structuredClone(sample);
    invalid.routes[0].geometry.coordinates[1] = [181, 0];
    expect(() => parseOsrmRoute(invalid, 2)).toThrow("invalidResponse");
    expect(() => parseOsrmRoute(sample, 3)).toThrow("invalidResponse");
  });
  it("solicita sin caché y respeta cancelación", async () => {
    const fake = vi.fn<typeof fetch>(
      async () => new Response(JSON.stringify(sample)),
    );
    await fetchRoadRoute(
      "https://rutas.example",
      points.slice(0, 2),
      undefined,
      fake,
    );
    expect(fake.mock.calls[0][1]).toMatchObject({ cache: "no-store" });
    const abort = new AbortController();
    abort.abort();
    const fail = vi.fn(async (_u: unknown, init?: RequestInit) => {
      expect(init?.signal?.aborted).toBe(true);
      throw new DOMException("cancelado", "AbortError");
    });
    await expect(
      fetchRoadRoute(
        "https://rutas.example",
        points.slice(0, 2),
        abort.signal,
        fail,
      ),
    ).rejects.toThrow();
  });
  it("no acepta servidor público ni URL con contraseña", () => {
    for (const u of [
      "http://rutas.example",
      "https://router.project-osrm.org",
      "https://routing.openstreetmap.de/routed-car/",
      "https://usuario:clave@rutas.example",
    ])
      expect(() => routingServerUrl(u)).toThrow();
  });
  it("comprueba salud y configuración sin enviar GPS", async () => {
    const urls: string[] = [];
    const fake = vi.fn(async (u: unknown) => {
      urls.push(String(u));
      return new Response(
        JSON.stringify(
          String(u).endsWith("healthz")
            ? { code: "Ok" }
            : {
                service: "territorio-vivo-routing",
                schema: 1,
                coordinateLogs: false,
                profile: "driving",
                maxWaypoints: 40,
                coverage: "Chile",
              },
        ),
      );
    });
    const r = await checkRoutingServer("https://rutas.example", fake);
    expect(r.baseUrl).toBe("https://rutas.example/");
    expect(urls).toEqual([
      "https://rutas.example/capabilities",
      "https://rutas.example/healthz",
    ]);
  });
  it("rechaza configuración que anuncia registros o motor caído", async () => {
    await expect(
      checkRoutingServer(
        "https://rutas.example",
        async () =>
          new Response(
            JSON.stringify({
              service: "territorio-vivo-routing",
              schema: 1,
              coordinateLogs: true,
              profile: "driving",
              maxWaypoints: 40,
            }),
          ),
      ),
    ).rejects.toThrow();
  });
});
describe("avance y recálculo en memoria", () => {
  const now = 1800000000000;
  const fix = (
    latitude: number,
    longitude: number,
    accuracy: number | null = 10,
  ) => ({ latitude, longitude, accuracy, timestamp: now });
  it("ajusta avance a una calle y estima distancia a la próxima maniobra", () => {
    const r = route(),
      next = navigationUpdate(
        r,
        routeLengths(r.points),
        fix(0, 0.004),
        0,
        1000,
        now,
      );
    expect(next.reliable).toBe(true);
    expect(next.offRoute).toBe(false);
    expect(next.projection.progressMeters).toBeCloseTo(400, 0);
    expect(next.distanceToManeuver).toBeCloseTo(600, 0);
  });
  it("no avanza ni anuncia llegada con señal imprecisa", () => {
    const r = route();
    const next = navigationUpdate(
      r,
      routeLengths(r.points),
      fix(0.01, 0.01, 400),
      1900,
      500,
      now,
    );
    expect(next.reliable).toBe(false);
    expect(next.arrived).toBe(false);
    expect(next.projection.progressMeters).toBe(1900);
  });
  it("detecta desvío y posición antigua", () => {
    const r = route();
    expect(
      navigationUpdate(
        r,
        routeLengths(r.points),
        fix(-0.005, 0.001),
        0,
        500,
        now,
      ).offRoute,
    ).toBe(true);
    expect(
      navigationUpdate(
        r,
        routeLengths(r.points),
        { ...fix(0, 0), timestamp: now - 60000 },
        0,
        500,
        now,
      ).reliable,
    ).toBe(false);
  });
  it("no salta al final en una ruta de ida y vuelta con cruce en el origen", () => {
    const r = route();
    r.points = [...points, { latitude: 0, longitude: 0 }];
    r.distanceMeters = 4000;
    r.snappedWaypoints = [points[0], points[0]];
    const next = navigationUpdate(
      r,
      routeLengths(r.points),
      fix(0, 0),
      0,
      500,
      now,
    );
    expect(next.projection.progressMeters).toBe(0);
    expect(next.arrived).toBe(false);
  });
  it("confirma llegada solo al final y cerca del destino", () => {
    const r = route();
    expect(
      navigationUpdate(
        r,
        routeLengths(r.points),
        fix(0.01, 0.01),
        1950,
        100,
        now,
      ).arrived,
    ).toBe(true);
  });
});
