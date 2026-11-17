// Propone coordenadas para lugares del catálogo sin ubicación, buscando el MISMO nombre
// en OpenStreetMap dentro de la MISMA comuna (Overpass). Coincidencia exacta → se aplica
// como ubicación de referencia (ODbL, con atribución). Parecidos o ambiguos → revisión humana.
// Uso: node scripts/catalogo/coordenadas-osm.mjs   (consulta pública, una comuna a la vez)
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (f) => JSON.parse(readFileSync(path.join(root, f), "utf8"));
const master = read("content/catalogo/maestro-app.json");
const legacy = read("content/catalogo/petorca.json");
const official = read("content/catalogo/oficiales.json");
const iso = {
  "arica-parinacota": "CL-AP",
  tarapaca: "CL-TA",
  antofagasta: "CL-AN",
  atacama: "CL-AT",
  coquimbo: "CL-CO",
  valparaiso: "CL-VS",
  metropolitana: "CL-RM",
  ohiggins: "CL-LI",
  maule: "CL-ML",
  nuble: "CL-NB",
  biobio: "CL-BI",
  araucania: "CL-AR",
  "los-rios": "CL-LR",
  "los-lagos": "CL-LL",
  aysen: "CL-AI",
  magallanes: "CL-MA",
};
const normalize = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const communeName = Object.fromEntries(
  master.territories
    .filter((t) => t.level === "commune")
    .map((t) => [t.commune, t.name]),
);
const missing = [...legacy.places, ...master.places, ...official.places].filter(
  (p) => p.latitude === null || p.longitude === null,
);
const byCommune = new Map();
for (const p of missing) {
  const key = `${p.region}|${p.commune}`;
  if (!byCommune.has(key)) byCommune.set(key, []);
  byCommune.get(key).push(p);
}
const tags =
  "leisure|tourism|natural|historic|boundary|amenity|place|heritage|man_made|building";
function query(region, commune) {
  const name = communeName[commune].replace(/"/g, '\\"');
  return `[out:json][timeout:90];
area["ISO3166-2"="${iso[region]}"]->.r;
rel(area.r)["boundary"="administrative"]["admin_level"="8"]["name"="${name}"];
map_to_area->.c;
nwr(area.c)["name"][~"^(${tags})$"~"."];
out center tags;`;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const endpoints = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
async function overpass(q) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const url = endpoints[attempt % endpoints.length];
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "turismo-en-tu-mano-catalogo/0.1",
        },
        body: "data=" + encodeURIComponent(q),
        signal: AbortSignal.timeout(120000),
      });
      if (res.ok) return (await res.json()).elements;
    } catch {
      /* Siguiente servidor. */
    }
    await sleep(5000 * (attempt + 1));
  }
  return null;
}
// Extracto por comuna (solo nombre, tipo, id y centro): permite reanudar y queda
// adjunto como extracto ODbL de los datos usados.
const cacheDir = path.join(root, "content/sources/osm-coordenadas");
mkdirSync(cacheDir, { recursive: true });
const km = (a, b) => {
  const r = Math.PI / 180,
    dLat = (b.lat - a.lat) * r,
    dLon = (b.lon - a.lon) * r;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};

const exact = {},
  doubtful = {},
  notFound = [],
  failed = [],
  communesWithoutArea = [];
let i = 0;
const limit = Number(process.argv[2] ?? Infinity);
for (const [key, list] of byCommune) {
  if (i >= limit) break;
  const [region, commune] = key.split("|");
  i++;
  process.stdout.write(`${i}/${byCommune.size} ${commune}… `);
  const cacheFile = path.join(cacheDir, `${commune}.json`);
  let features;
  if (existsSync(cacheFile))
    features = JSON.parse(readFileSync(cacheFile, "utf8"));
  else {
    const elements = await overpass(query(region, commune));
    if (elements === null) {
      failed.push(commune);
      console.log("sin respuesta, queda pendiente");
      for (const p of list)
        notFound.push({ id: p.id, name: p.name, commune, pendingQuery: true });
      continue;
    }
    features = elements
      .map((e) => ({
        osm: `${e.type}/${e.id}`,
        name: e.tags.name,
        lat: e.lat ?? e.center?.lat,
        lon: e.lon ?? e.center?.lon,
        kind: Object.entries(e.tags)
          .filter(([k]) => tags.split("|").includes(k))
          .map(([k, v]) => `${k}=${v}`)
          .join(";"),
      }))
      .filter((f) => Number.isFinite(f.lat) && Number.isFinite(f.lon))
      .map((f) => ({
        ...f,
        lat: Math.round(f.lat * 1e6) / 1e6,
        lon: Math.round(f.lon * 1e6) / 1e6,
      }));
    writeFileSync(cacheFile, JSON.stringify(features) + "\n");
    await sleep(2500);
  }
  if (!features.length) communesWithoutArea.push(commune);
  for (const p of list) {
    const names = [p.name, ...(p.aliases ?? [])].map(normalize);
    // Un estacionamiento o una cabaña con el mismo nombre no es el lugar: pasa a revisión.
    const weak = (f) => /^(amenity=parking|building=cabin)$/.test(f.kind);
    const same = features.filter(
      (f) => names.includes(normalize(f.name)) && !weak(f),
    );
    const close = same.length > 0 && same.every((f) => km(f, same[0]) <= 1.5);
    if (close) {
      // Preferir el polígono (área) o el primero: todos están a menos de 1,5 km.
      const pick = same.find((f) => !f.osm.startsWith("node")) ?? same[0];
      exact[p.id] = {
        latitude: Math.round(pick.lat * 1e6) / 1e6,
        longitude: Math.round(pick.lon * 1e6) / 1e6,
        osm: pick.osm,
        osmName: pick.name,
        kind: pick.kind,
        commune,
      };
    } else {
      const key2 = normalize(p.name)
        .replace(/^(playa|parque|mirador|museo|plaza|iglesia) /, "")
        .trim();
      const similar = (same.length ? same : features)
        .filter((f) => {
          const n = normalize(f.name);
          return key2.length >= 4 && (n.includes(key2) || key2.includes(n));
        })
        .slice(0, 5);
      if (similar.length)
        doubtful[p.id] = {
          name: p.name,
          commune,
          reason: same.length
            ? "varios con el mismo nombre"
            : "nombre parecido",
          candidates: similar,
        };
      else notFound.push({ id: p.id, name: p.name, commune });
    }
  }
  console.log(
    `${list.filter((p) => exact[p.id]).length}/${list.length} exactas`,
  );
}

const out = {
  license: "ODbL-1.0",
  attribution: "© Colaboradores de OpenStreetMap",
  licenseUrl: "https://www.openstreetmap.org/copyright",
  snapshotAt: new Date().toISOString().slice(0, 10),
  method:
    "Mismo nombre normalizado (sin tildes ni signos) o alias, dentro del área administrativa de la misma comuna en OSM (admin_level 8, región por ISO 3166-2). Si hay varios con el mismo nombre deben estar a menos de 1,5 km; si no, pasan a revisión. Ubicación de referencia, no acceso verificado.",
  exact,
  doubtful,
  notFound,
  communesWithoutArea,
  pendingQueries: failed,
};
mkdirSync(path.join(root, "content/catalogo"), { recursive: true });
writeFileSync(
  path.join(root, "content/catalogo/coordenadas-osm.json"),
  JSON.stringify(out, null, 2) + "\n",
);
console.log(
  `\nExactas ${Object.keys(exact).length} · dudosas ${Object.keys(doubtful).length} · sin coincidencia ${notFound.length} · comunas sin área ${communesWithoutArea.length}`,
);
