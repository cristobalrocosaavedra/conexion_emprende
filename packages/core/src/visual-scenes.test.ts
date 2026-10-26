import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { coverFrame, visualScene } from "./visual-scenes";
import { regionIds } from "./index";

describe("paisajes territoriales", () => {
  it("cada región tiene portada propia y la selección local respeta la región", () => {
    expect(new Set(regionIds.map((id) => visualScene(id))).size).toBe(16);
    expect(visualScene("valparaiso", "la-ligua")).toBe("petorca-interior");
    expect(visualScene("valparaiso", "la-ligua", true)).toBe("litoral-central");
    expect(visualScene("valparaiso", "isla-de-pascua")).toBe("rapa-nui");
    expect(visualScene("valparaiso", "olmue")).toBe("valparaiso-interior");
    expect(visualScene("coquimbo", "los-vilos")).toBe("choapa-costa");
    expect(visualScene("coquimbo", "vicuna")).toBe("coquimbo");
    expect(visualScene("los-lagos", "castro")).toBe("chiloe");
    expect(visualScene("arica-parinacota", "putre")).toBe("altiplano");
    expect(visualScene("tarapaca", "pica")).toBe("tarapaca");
    // Durante el viaje animado, una comuna de origen no arrastra su imagen a otra región.
    expect(visualScene("metropolitana", "la-ligua")).toBe("metropolitana");
    expect(visualScene("magallanes", "isla-de-pascua")).toBe("magallanes");
  });

  it("el encuadre llena ventanas verticales y apaisadas sin deformar ni dejar bordes", () => {
    for (const [width, height] of [
      [390, 650],
      [800, 200],
      [320, 480],
    ]) {
      for (const focus of [0, 0.5, 0.73, 1]) {
        const frame = coverFrame(width, height, focus);
        expect(frame.width / frame.height).toBeCloseTo(1.5);
        expect(frame.left).toBeLessThanOrEqual(0);
        expect(frame.top).toBeLessThanOrEqual(0);
        expect(frame.left + frame.width).toBeGreaterThanOrEqual(width);
        expect(frame.top + frame.height).toBeGreaterThanOrEqual(height);
        const focalPoint = frame.left + frame.width * focus;
        expect(focalPoint).toBeGreaterThanOrEqual(0);
        expect(focalPoint).toBeLessThanOrEqual(width);
      }
    }
  });

  it("las 24 ilustraciones se entregan íntegras, distintas y con un presupuesto acotado", () => {
    const root = new URL("../../../", import.meta.url);
    const manifest = JSON.parse(
      readFileSync(
        new URL("docs/diseno/coleccion-0.7/manifest.json", root),
        "utf8",
      ),
    );
    expect(manifest.items).toHaveLength(24);
    expect(
      new Set(manifest.items.map((item: { sha256: string }) => item.sha256))
        .size,
    ).toBe(24);
    let bytes = 0;
    for (const item of manifest.items) {
      const data = readFileSync(
        new URL(`apps/mobile/assets/territorio/coleccion/${item.file}`, root),
      );
      expect(data.subarray(0, 4).toString()).toBe("RIFF");
      expect(data.subarray(8, 12).toString()).toBe("WEBP");
      expect(createHash("sha256").update(data).digest("hex")).toBe(item.sha256);
      expect(data.length).toBe(item.bytes);
      expect(data.length).toBeLessThan(280000);
      bytes += data.length;
    }
    expect(bytes).toBeLessThan(5000000);
  });
});
