import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

// Capturas de revisión: muestran el sitio funcionando con el catálogo de referencia.
const shots = "docs/web/capturas-0.1";
const shot = (page: Page, name: string, fullPage = false) =>
  page.screenshot({ path: `${shots}/${name}.png`, fullPage });
const prefsKey = "territorio-vivo.preferences.v2";

test("inicio: portada, cuatro zonas y negocio fundador verificado", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Chile, en la palma de tu mano",
  );
  await expect(page.locator(".zona-tarjeta")).toHaveCount(4);
  await expect(page.locator(".chile.franja a")).toHaveCount(16);
  const founder = page.locator(".tarjeta", {
    hasText: "Chocolatería Matichoc",
  });
  await expect(founder.locator(".sello-verified")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await shot(page, "escritorio-01-inicio");
});

test("región: provincias, pestañas fijas, Rapa Nui aparte y paso norte/sur", async ({
  page,
}) => {
  await page.goto("/region/valparaiso");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Región de Valparaíso",
  );
  await expect(page.locator(".fichas-territorio li")).toHaveCount(8);
  await expect(page.locator(".isla")).toContainText("traslado aéreo");
  await expect(page.locator(".paginador a[rel=prev]")).toHaveText(
    "↑ Norte: Coquimbo",
  );
  await expect(page.locator(".paginador a[rel=next]")).toHaveText(
    "Sur: Metropolitana ↓",
  );
  await shot(page, "escritorio-02-region");
  await page.mouse.wheel(0, 1600);
  await expect(page.locator(".pestanas")).toBeInViewport();
  await page.locator(".paginador a[rel=next]").click();
  await expect(page).toHaveURL(/\/region\/metropolitana$/);
  const prefs = await page.evaluate((k) => localStorage.getItem(k), prefsKey);
  expect(JSON.parse(prefs!).region).toBe("metropolitana");
});

test("provincia y comuna: migas con vecinos del mismo nivel", async ({
  page,
}) => {
  await page.goto("/provincia/petorca");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Provincia de Petorca",
  );
  await expect(page.locator(".fichas-territorio li")).toHaveCount(5);
  await page
    .locator(".fichas-territorio")
    .getByRole("link", { name: "La Ligua" })
    .click();
  await expect(page).toHaveURL(/\/la-ligua$/);
  await page
    .locator(".migas-selector summary", { hasText: "La Ligua" })
    .click();
  await expect(page.locator(".migas-selector[open] a")).toHaveCount(5);
  await shot(page, "escritorio-03-comuna");
});

test("explorar: mapa por categoría y «+ Mi ruta» sin coordenadas", async ({
  page,
}) => {
  await page.goto("/la-ligua/explorar");
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(8);
  // La zona de dulceras se trata como atractivo público: sigue en el mapa.
  await expect(
    page.locator(
      '.leaflet-marker-icon[title="Área de los Dulces de La Ligua"]',
    ),
  ).toHaveCount(1);
  await page
    .locator('.leaflet-marker-icon[title="Chocolatería Matichoc"]')
    .click();
  await page.locator(".globo button").click();
  await expect(page.locator(".cabecera-fila .contador")).toHaveText("1");
  const raw = await page.evaluate((k) => localStorage.getItem(k), prefsKey);
  expect(raw).not.toMatch(/latitude|longitude|-32\./);
  expect(JSON.parse(raw!).stopIds).toEqual(["chocolateria-matichoc"]);
  await shot(page, "escritorio-04-explorar");
  await page.locator(".filtro", { hasText: "Gastronomía" }).click();
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(6);
  await page.goto("/la-ligua/negocios");
  await expect(page.locator(".tarjeta")).toHaveCount(1);
  await expect(page.locator(".tarjeta")).toContainText("Chocolatería Matichoc");
});

test("ficha única: Matichoc verificado, logo completo y cómo llegar", async ({
  page,
}) => {
  await page.goto("/la-ligua/chocolateria-matichoc");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Chocolatería Matichoc",
  );
  await expect(page.locator(".ficha-texto .sello-verified")).toHaveText(
    "✓ Verificado",
  );
  await expect(page.locator(".ficha-arte.contener img")).toHaveAttribute(
    "src",
    "/arte/matichoc-logo.webp",
  );
  await expect(page.locator(".caja-llegar a").first()).toHaveAttribute(
    "href",
    "/explorar/la-ligua",
  );
  await expect(page.locator(".cerca li")).toHaveCount(3);
  await expect(page.locator(".ficha-texto .sello-destacado")).toHaveText(
    "★ Destacado",
  );
  await page.getByRole("button", { name: "♡ Guardar" }).click();
  await shot(page, "escritorio-05-ficha");
  await page.goto("/favoritos");
  await expect(page.locator(".tarjeta")).toContainText("Chocolatería Matichoc");
});

test("Mi ruta: paradas de varias regiones, orden editable", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate((k) => {
    localStorage.setItem(
      k,
      JSON.stringify({
        region: "valparaiso",
        stopIds: ["chocolateria-matichoc", "osm-way-194038195"],
      }),
    );
  }, prefsKey);
  await page.goto("/mi-ruta");
  await expect(page.locator(".ruta-resumen")).toHaveText(
    "Tu viaje · 2 regiones · 2 paradas",
  );
  await expect(page.locator(".ruta-region")).toHaveCount(2);
  await page
    .getByRole("button", { name: /Bajar: Chocolatería Matichoc/ })
    .click();
  await expect(page.locator(".parada strong").first()).toHaveText(
    "Centro Cultural Estación Antofagasta",
  );
  await expect(page.locator(".capa circle")).toHaveCount(2);
  await shot(page, "escritorio-06-mi-ruta");
});

test("buscador: encuentra comunas y lugares", async ({ page }) => {
  await page.goto("/destinos");
  await page.locator("#buscar").fill("ligua");
  await expect(page.locator(".resultados a").first()).toHaveAttribute(
    "href",
    "/la-ligua",
  );
  await page.locator("#buscar").fill("matichoc");
  await expect(page.locator(".resultados a").first()).toHaveAttribute(
    "href",
    "/la-ligua/chocolateria-matichoc",
  );
});

test("comercial, legales y 404", async ({ page }) => {
  await page.goto("/suma-tu-negocio");
  await expect(page.locator(".plan")).toHaveCount(3);
  await expect(page.locator(".plan.recomendado")).toContainText("$24.990");
  await shot(page, "escritorio-07-suma-tu-negocio");
  await page.goto("/terminos");
  await expect(page.locator(".aviso")).toContainText("Borrador");
  const missing = await page.goto("/no-existe-esta-pagina");
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "No encontramos esta página",
  );
});

test.describe("celular", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  test("barra inferior con Mi ruta y portada adaptada", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".nav-movil")).toBeVisible();
    await expect(page.locator(".menu")).toBeHidden();
    await shot(page, "movil-01-inicio");
    await page.goto("/la-ligua");
    await expect(page.locator(".estas-en strong")).toHaveText(
      "La Ligua · Valparaíso",
    );
    await shot(page, "movil-02-comuna");
    await page.goto("/la-ligua/chocolateria-matichoc");
    await shot(page, "movil-03-ficha");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  });
});
