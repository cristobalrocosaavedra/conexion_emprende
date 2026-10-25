// Prueba de integración del servicio real, con puntos públicos del catálogo.
// Nunca leer GPS, preferencias ni coordenadas de viajeros en este proceso.
import assert from "node:assert/strict";
import { setTimeout as wait } from "node:timers/promises";
import { log } from "node:console";
import { readFileSync } from "node:fs";
import { fetchRoadRoute } from "../packages/core/src/road-routing.ts";
import { PUBLIC_ROUTING_URL } from "../packages/core/src/routing-server.ts";
const catalog = [
  ...JSON.parse(readFileSync("content/catalogo/petorca.json", "utf8")).places,
  ...JSON.parse(readFileSync("content/catalogo/osm-chile.json", "utf8")).places,
];
const point = (id) => {
  const p = catalog.find((p) => p.id === id);
  assert.ok(p && Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
  return { latitude: p.latitude, longitude: p.longitude };
};
const cases = [
  {
    name: "La Ligua–Papudo",
    ids: ["museo-de-la-ligua", "papudo-plaza"],
    minimum: 10000,
  },
  {
    name: "Santiago–La Serena",
    ids: ["osm-node-10963945038", "osm-way-557853143"],
    minimum: 300000,
  },
];
for (let i = 0; i < cases.length; i++) {
  if (i) await wait(1500);
  const c = cases[i];
  const route = await fetchRoadRoute(PUBLIC_ROUTING_URL, c.ids.map(point));
  assert.ok(
    route.distanceMeters > c.minimum &&
      route.points.length > 20 &&
      route.steps.length > 2,
  );
  log(
    `${c.name}: ${(route.distanceMeters / 1000).toFixed(1)} km calculados, ${route.points.length} vértices y ${route.steps.length} indicaciones. Servicio real, sin GPS de dispositivo.`,
  );
}
