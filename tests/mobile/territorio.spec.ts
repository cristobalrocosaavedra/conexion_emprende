import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
async function swipe(page: Page, fromY: number, toY: number, x = 195) {
  const client = await page.context().newCDPSession(page);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y: fromY }],
  });
  for (let i = 1; i <= 8; i++)
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: fromY + ((toY - fromY) * i) / 8 }],
    });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await client.detach();
}
test.beforeEach(async ({ page }) => {
  await page.route("https://tile.openstreetmap.org/**", (r) => r.abort());
  await page.goto("/");
  await expect(
    page.getByText("Territorio Vivo", { exact: true }),
  ).toBeVisible();
});
test("cambia de región con un gesto sobre el contenido fuera de la ilustración", async ({
  page,
}) => {
  await expect(
    page.getByRole("button", { name: "Abrir selector de regiones" }),
  ).toContainText("Valparaíso");
  // Inicio en el sector inferior de tarjetas y acciones, no en la cabecera de la imagen.
  const rect = await page.getByTestId("regional-window").boundingBox();
  expect(rect).not.toBeNull();
  await swipe(page, rect!.y + rect!.height - 80, rect!.y + rect!.height - 240);
  await expect(
    page.getByRole("button", { name: "Abrir selector de regiones" }),
  ).toContainText("Metropolitana de Santiago");
  await swipe(page, rect!.y + rect!.height - 240, rect!.y + rect!.height - 80);
  await expect(
    page.getByRole("button", { name: "Abrir selector de regiones" }),
  ).toContainText("Valparaíso");
});
test("selector geográfico respeta extremos y reducir movimiento", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page
    .getByRole("button", { name: "Abrir selector de regiones" })
    .click();
  await page
    .getByRole("button", { name: "Arica y Parinacota", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "↑ Norte", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Abrir selector de regiones" })
    .click();
  await page
    .getByRole("button", {
      name: "Magallanes y de la Antártica Chilena",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "↓ Sur", exact: true }),
  ).toBeDisabled();
});
test("explora Petorca, filtra, abre fuente y guarda una parada persistente", async ({
  page,
}) => {
  await page.getByRole("tab", { name: /Explorar/ }).click();
  await page
    .getByRole("textbox", { name: "Buscar lugares" })
    .fill("chocolateria");
  await page
    .getByRole("button", { name: "Chocolatería Matichoc", exact: true })
    .click();
  await expect(
    page.getByText("Pendiente de verificación", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Fuente y procedencia", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Guardar en mi viaje", exact: true })
    .click();
  await page.getByRole("button", { name: "Cerrar", exact: true }).click();
  await page.getByRole("tab", { name: /Mi viaje/ }).click();
  await expect(
    page.getByText("1 lugares guardados", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("tab", { name: /Mi viaje/ }).click();
  await expect(
    page.getByText("1 lugares guardados", { exact: true }),
  ).toBeVisible();
});
test("mapa conserva puntos sin teselas y abre ficha desde el popup", async ({
  page,
}) => {
  await page.getByRole("tab", { name: /Explorar/ }).click();
  await page.getByRole("textbox", { name: "Buscar lugares" }).fill("museo");
  const map = page.frameLocator('iframe[title="Mapa interactivo"]');
  await expect(map.locator(".leaflet-overlay-pane svg")).toBeVisible();
  await map.locator(".leaflet-interactive").last().click();
  await map.getByRole("button", { name: "Ver ficha", exact: true }).click();
  await expect(
    page.getByText("Museo de La Ligua", { exact: true }).first(),
  ).toBeVisible();
});
test("las rutas cargan paradas, permiten ida/vuelta y reordenar", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Rutas", exact: true }).click();
  await page
    .getByRole("button", { name: "Añadir sus paradas a mi viaje", exact: true })
    .first()
    .click();
  await expect(
    page.getByText("6 lugares guardados", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Subir parada: Puente Pedegua", exact: true })
    .click();
  await expect(
    page.getByText("1. Puente Pedegua", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Ida y vuelta", exact: true }).click();
  await expect(
    page.getByText("Conexión esquemática · no es una ruta por calles", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Quitar parada", exact: true })
    .first()
    .click();
  await expect(
    page.getByText("5 lugares guardados", { exact: true }),
  ).toBeVisible();
});
test("otras regiones muestran referencias comunitarias y agenda de ejemplo sin fechas inventadas", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Abrir selector de regiones" })
    .click();
  await page.getByRole("button", { name: "Los Lagos", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Abrir selector de regiones" }),
  ).toContainText("Los Lagos");
  await expect(
    page.getByRole("button", {
      name: "Galería de arte La Caracola",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("tab", { name: /Eventos/ }).click();
  await page
    .getByRole("button", {
      name: "Feria de emprendimientos de ejemplo",
      exact: true,
    })
    .click();
  await expect(
    page
      .getByText("Evento de ejemplo · sin fecha real", { exact: true })
      .last(),
  ).toBeVisible();
});

test("muestra región, provincia y comuna y conserva la selección local", async ({
  page,
}) => {
  await page.getByRole("tab", { name: /Explorar/ }).click();
  await page
    .getByRole("button", { name: "La Ligua", exact: true })
    .first()
    .click();
  await page.getByRole("tab", { name: /Inicio/ }).click();
  await expect(
    page.getByText("Provincia de Petorca", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Comuna de La Ligua", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Comuna elegida manualmente", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Museo de La Ligua", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Comuna de La Ligua", { exact: true }),
  ).toBeVisible();
});

test("genera tres vistas principales de la candidata antes de ofrecer la APK", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.reload();
  mkdirSync("previews", { recursive: true });
  await page.getByRole("tab", { name: /Explorar/ }).click();
  await page
    .getByRole("button", { name: "La Ligua", exact: true })
    .first()
    .click();
  await page.getByRole("tab", { name: /Inicio/ }).click();
  await expect(
    page.getByText("Comuna de La Ligua", { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "previews/pantalla-inicio.png" });
  await page.unroute("https://tile.openstreetmap.org/**");
  await page.getByRole("tab", { name: /Explorar/ }).click();
  const map = page.frameLocator('iframe[title="Mapa interactivo"]');
  await map
    .locator(".leaflet-tile-loaded")
    .first()
    .waitFor({ timeout: 5000 })
    .catch(() => {});
  await page.screenshot({ path: "previews/pantalla-explorar.png" });
  await page
    .getByRole("textbox", { name: "Buscar lugares" })
    .fill("chocolateria");
  await page
    .getByRole("button", { name: "Chocolatería Matichoc", exact: true })
    .click();
  await expect(
    page.getByText("Logo de Matichoc", { exact: true }).last(),
  ).toBeVisible();
  await page.screenshot({
    path: "previews/pantalla-ficha.png",
    animations: "disabled",
  });
});

test("mantiene ficha y controles visibles en un teléfono de 360 por 640", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.getByRole("tab", { name: /Explorar/ }).click();
  await page
    .getByRole("button", { name: "La Ligua", exact: true })
    .first()
    .click();
  await page.getByRole("tab", { name: /Inicio/ }).click();
  await expect(
    page.getByRole("button", { name: "Museo de La Ligua", exact: true }),
  ).toBeInViewport({ ratio: 0.95 });
  await expect(
    page.getByRole("button", { name: "↓ Sur", exact: true }),
  ).toBeInViewport();
});

test("selector muestra las 16 regiones sin bajar la página en un teléfono pequeño", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page
    .getByRole("button", { name: "Abrir selector de regiones" })
    .click();
  const picker = page.getByTestId("compact-region-picker");
  const buttons = picker.getByRole("button");
  await expect(buttons).toHaveCount(16);
  for (const button of await buttons.all()) {
    await expect(button).toBeInViewport({ ratio: 0.95 });
    const box = await button.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
  await page.emulateMedia({ colorScheme: "dark" });
  await page.setViewportSize({ width: 393, height: 851 });
  await page.screenshot({ path: "previews/pantalla-selector.png" });
});
test("el selector recorre Chile con una línea y permite cancelar sin guardar regiones intermedias", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.reload();
  await page
    .getByRole("button", { name: "Abrir selector de regiones" })
    .click();
  await page
    .getByRole("button", { name: "Arica y Parinacota", exact: true })
    .click();
  await expect(page.getByTestId("region-journey")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  await page
    .getByRole("button", { name: "Abrir selector de regiones" })
    .click();
  await page
    .getByRole("button", {
      name: "Magallanes y de la Antártica Chilena",
      exact: true,
    })
    .click();
  const journey = page.getByTestId("region-journey");
  await expect(journey).toBeVisible();
  await expect(
    journey.getByText("Metropolitana de Santiago", { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "previews/pantalla-recorrido.png" });
  await expect(journey).toHaveCount(0, { timeout: 6000 });
  await expect(
    page.getByRole("button", { name: "Abrir selector de regiones" }),
  ).toContainText("Magallanes");
  await page
    .getByRole("button", { name: "Abrir selector de regiones" })
    .click();
  await page
    .getByRole("button", { name: "Arica y Parinacota", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Detener recorrido", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Abrir selector de regiones" }),
  ).toContainText("Magallanes");
  expect(errors).toEqual([]);
});
test("la ficha nacional identifica OSM, licencia y verificación pendiente", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page
    .getByRole("button", { name: "Abrir selector de regiones" })
    .click();
  await page.getByRole("button", { name: "Atacama", exact: true }).click();
  await page
    .getByRole("button", { name: "Museo Mineralógico", exact: true })
    .click();
  await expect(
    page.getByText("Fuente y procedencia", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "OpenStreetMap · ODbL 1.0" }),
  ).toBeVisible();
  await expect(
    page.getByText(/Datos © Colaboradores de OpenStreetMap/).last(),
  ).toBeVisible();
});

test("la portada de una región con nombre largo conserva sus controles en 360 por 640", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page
    .getByRole("button", { name: "Abrir selector de regiones" })
    .click();
  await page
    .getByRole("button", {
      name: "Magallanes y de la Antártica Chilena",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "↓ Sur", exact: true }),
  ).toBeInViewport();
  await expect(
    page.getByRole("button", {
      name: "Colección Paleontológica de Antártica y Patagonia",
      exact: true,
    }),
  ).toBeInViewport({ ratio: 0.95 });
});

test("ruta pública lista sin configurar VPS: trazado por calles, mapa estable y edición", async ({
  page,
}) => {
  // Servidor simulado con una respuesta REAL del motor local sobre calles públicas.
  // No simula un GPS ni representa un servidor contratado.
  const { readFileSync } = await import("node:fs");
  const response = JSON.parse(
    readFileSync("tests/routing/fixtures/museos-arica.json", "utf8"),
  );
  const requests: string[] = [];
  await page.route(
    "https://routing.openstreetmap.de/routed-car/**",
    async (r) => {
      requests.push(r.request().url());
      await r.fulfill({ json: response });
    },
  );
  await page.evaluate(() =>
    localStorage.setItem(
      "territorio-vivo.preferences.v2",
      JSON.stringify({
        region: "arica-parinacota",
        commune: "all",
        theme: "dark",
        stopIds: ["osm-node-12462068289", "osm-node-13305279880"],
        roundTrip: false,
      }),
    ),
  );
  await page.reload();
  await page.getByRole("tab", { name: /Mi viaje/ }).click();
  await expect(
    page.getByText("Servicio gratuito de pruebas · FOSSGIS / OSRM", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Conectar el servidor de esta prueba" }),
  ).toHaveCount(0);
  expect(requests).toEqual([]);
  await page
    .getByRole("button", { name: "Ver entre mis paradas", exact: true })
    .click();
  await expect(
    page.getByText("Ruta lista para revisar", { exact: true }),
  ).toBeVisible();
  expect(requests.filter((u) => u.includes("/route/")).length).toBe(1);
  mkdirSync("previews", { recursive: true });
  await page
    .getByText("Tu ruta por calles", { exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: "previews/pantalla-ruta-0.4.1.png" });
  await expect(
    page.getByText("Conexión esquemática · no es una ruta por calles", {
      exact: true,
    }),
  ).toHaveCount(0);
  const frame = page.frameLocator("iframe").first();
  await expect(frame.locator(".leaflet-overlay-pane path")).not.toHaveCount(0);
  const road = frame.locator('path[stroke="#168b82"]');
  await expect(road).toHaveCount(1);
  await frame.locator("#map").evaluate(() => {
    (window as unknown as { tvNavigation: (v: unknown) => void }).tvNavigation({
      fix: null,
      follow: false,
    });
  });
  await expect(road).toHaveCount(1);
  // Las áreas regionales dejaron de ser enlaces que cerraban el mapa.
  await page.unroute("https://tile.openstreetmap.org/**");
  await page
    .getByRole("button", { name: "Ver navegación en mapa", exact: true })
    .click();
  const map = page.frameLocator("iframe").last();
  await map.locator("#map").click({ position: { x: 150, y: 120 } });
  await page.unroute("https://tile.openstreetmap.org/**");
  await map
    .locator(".leaflet-tile-loaded")
    .first()
    .waitFor({ timeout: 5000 })
    .catch(() => {});
  await page.screenshot({ path: "previews/pantalla-mapa-0.4.1.png" });
  await expect(
    page.getByRole("button", { name: "Cerrar", exact: true }).last(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Cerrar", exact: true })
    .last()
    .click();
  // Cambiar el plan invalida el trazado; una parada sola necesita GPS u otro destino.
  await page
    .getByRole("button", { name: "Quitar parada", exact: true })
    .last()
    .click();
  await expect(
    page.getByText(
      "Agrega al menos dos paradas para ver el camino entre ellas, o calcula desde tu ubicación.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByText("Ruta lista para revisar", { exact: true }),
  ).toHaveCount(0);
  const prefs = await page.evaluate(() =>
    localStorage.getItem("territorio-vivo.preferences.v2"),
  );
  expect(prefs).not.toContain("latitude");
  expect(prefs).not.toContain("geometry");
});

test("desactivar rutas persiste y no consulta proveedor al abrir", async ({
  page,
}) => {
  const calls: string[] = [];
  await page.route("https://routing.openstreetmap.de/**", (r) => {
    calls.push(r.request().url());
    return r.abort();
  });
  await page.evaluate(() => {
    localStorage.setItem("territorio-vivo.routing-server.v1", "");
    localStorage.setItem(
      "territorio-vivo.preferences.v2",
      JSON.stringify({
        region: "valparaiso",
        commune: "all",
        theme: "light",
        stopIds: ["museo-de-la-ligua", "papudo-plaza"],
        roundTrip: false,
      }),
    );
  });
  await page.reload();
  await page.getByRole("tab", { name: /Mi viaje/ }).click();
  await expect(
    page.getByRole("button", { name: "Activar rutas de prueba", exact: true }),
  ).toBeVisible();
  expect(calls).toEqual([]);
  await page
    .getByRole("button", { name: "Activar rutas de prueba", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Iniciar ruta", exact: true }),
  ).toBeVisible();
  expect(calls).toEqual([]);
  await page
    .getByRole("button", { name: "Desactivar rutas", exact: true })
    .click();
  await page.reload();
  await page.getByRole("tab", { name: /Mi viaje/ }).click();
  await expect(
    page.getByRole("button", { name: "Activar rutas de prueba", exact: true }),
  ).toBeVisible();
  expect(calls).toEqual([]);
});
