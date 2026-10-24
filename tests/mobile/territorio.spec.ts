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
