export interface RoutingServer {
  baseUrl: string;
  name: string;
  maxWaypoints: number;
  coverage: string;
}
export function routingServerUrl(input: string): string {
  const u = new URL(input.trim());
  if (
    u.protocol !== "https:" ||
    u.username ||
    u.password ||
    u.search ||
    u.hash ||
    ["router.project-osrm.org", "routing.openstreetmap.de"].includes(u.hostname)
  )
    throw new Error("Se necesita una dirección HTTPS del servidor propio.");
  return u.toString().replace(/\/?$/, "/");
}
export async function checkRoutingServer(
  input: string,
  fetcher: typeof fetch = fetch,
): Promise<RoutingServer> {
  const base = routingServerUrl(input);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetcher(base + "capabilities", {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) throw new Error("El servidor no respondió.");
    const raw = await response.text();
    if (raw.length > 16000)
      throw new Error("Respuesta de configuración no válida.");
    const v: unknown = JSON.parse(raw);
    if (!v || typeof v !== "object")
      throw new Error("Configuración no válida.");
    const c = v as Record<string, unknown>;
    if (
      c.service !== "territorio-vivo-routing" ||
      c.schema !== 1 ||
      c.coordinateLogs !== false ||
      c.profile !== "driving" ||
      typeof c.maxWaypoints !== "number" ||
      c.maxWaypoints < 2 ||
      c.maxWaypoints > 40
    )
      throw new Error("No se reconoce la configuración privada del servidor.");
    const health = await fetcher(base + "healthz", {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!health.ok) throw new Error("El motor de rutas aún no está listo.");
    return {
      baseUrl: base,
      name: "Territorio Vivo",
      maxWaypoints: c.maxWaypoints,
      coverage:
        typeof c.coverage === "string" ? c.coverage.slice(0, 100) : "Chile",
    };
  } finally {
    clearTimeout(timer);
  }
}
