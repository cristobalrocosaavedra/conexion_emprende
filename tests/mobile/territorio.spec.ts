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
  ).toContainText("Coquimbo");
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
    page.getByText("Fuente del catálogo original", { exact: true }),
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
test("otras regiones tienen portada, mapa y agenda de ejemplo sin fingir catálogo", async ({
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
    page.getByText(
      "El catálogo de esta región está en preparación. Ya puedes explorar su mapa y seguir recorriendo Chile.",
      { exact: true },
    ),
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
    page
      .getByText("Foto de producto del catálogo original", { exact: true })
      .last(),
  ).toBeVisible();
  await page.screenshot({
    path: "previews/pantalla-ficha.png",
    animations: "disabled",
  });
});
