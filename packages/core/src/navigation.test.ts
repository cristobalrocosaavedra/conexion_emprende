import { describe, it, expect } from "vitest";
import { neighbor, regionIds, transitionPath, resolveTheme } from "./index";
describe("viaje visual entre regiones", () => {
  it("no envuelve los extremos del país", () => {
    expect(neighbor("arica-parinacota", "north")).toBeNull();
    expect(neighbor("magallanes", "south")).toBeNull();
  });
  it("recorre el norte o el sur sin saltar regiones", () => {
    expect(transitionPath("coquimbo", "ohiggins")).toEqual([
      "valparaiso",
      "metropolitana",
      "ohiggins",
    ]);
    expect(transitionPath("ohiggins", "coquimbo")).toEqual([
      "metropolitana",
      "valparaiso",
      "coquimbo",
    ]);
    expect(transitionPath("valparaiso", "valparaiso")).toEqual([]);
  });
  it("cada vecino permite volver al origen y la lista no duplica territorios", () => {
    expect(new Set(regionIds).size).toBe(16);
    for (const region of regionIds) {
      const south = neighbor(region, "south");
      if (south) expect(neighbor(south, "north")).toBe(region);
    }
  });
});
describe("preferencias visuales", () => {
  it("respeta selección manual y sigue cambios del sistema sin selección", () => {
    expect(resolveTheme("dark", "light")).toBe("dark");
    expect(resolveTheme("light", "dark")).toBe("light");
    expect(resolveTheme("system", "dark")).toBe("dark");
    expect(resolveTheme("system", null)).toBe("light");
  });
});
