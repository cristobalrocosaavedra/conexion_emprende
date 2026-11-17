import { describe, expect, it } from "vitest";
import {
  communeById,
  communes,
  href,
  placeBySlug,
  places,
  placeSlug,
  provinces,
  regions,
  reservedSegments,
  zoneRegions,
  zones,
} from "./territorio";

describe("sitio web: jerarquía territorial", () => {
  it("usa las 16 regiones, 56 provincias y 346 comunas del catálogo", () => {
    expect(regions).toHaveLength(16);
    expect(provinces).toHaveLength(56);
    expect(communes).toHaveLength(346);
    expect(zones.flatMap((z) => zoneRegions[z]).sort()).toEqual(
      [...regions].sort(),
    );
  });
  it("las direcciones de comuna y provincia son únicas y no chocan con páginas fijas", () => {
    const ids = communes.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(provinces.map((p) => p.id)).size).toBe(provinces.length);
    for (const id of ids) expect(reservedSegments).not.toContain(id);
  });
  it("cada lugar tiene comuna conocida y una dirección propia estable", () => {
    const urls = places.map(href.place);
    expect(new Set(urls).size).toBe(urls.length);
    for (const p of places) {
      expect(communeById(p.commune)).toBeDefined();
      expect(["explorar", "negocios"]).not.toContain(placeSlug(p));
      expect(placeBySlug(p.commune, placeSlug(p))?.id).toBe(p.id);
    }
    expect(
      href.place(places.find((p) => p.id === "chocolateria-matichoc")!),
    ).toBe("/la-ligua/chocolateria-matichoc");
  });
});
