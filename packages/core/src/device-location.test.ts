import { describe, it, expect, vi } from "vitest";
import {
  readDeviceLocation,
  regionAtPoint,
  communeFromAddress,
} from "./device-location";
import type { LocationAdapter, DevicePermission } from "./device-location";
// Coordenadas públicas de ejemplo en La Ligua; no corresponden a un dispositivo.
const point = { latitude: -32.452, longitude: -71.231 };
const names = { "la-ligua": "La Ligua", petorca: "Petorca" };
const now = 1800000000000;
function adapter(
  status: DevicePermission["status"] = "granted",
): LocationAdapter {
  return {
    getPermission: vi.fn(async () => ({ status, canAskAgain: true })),
    requestPermission: vi.fn(async () => ({
      status: "granted" as const,
      canAskAgain: true,
    })),
    servicesEnabled: vi.fn(async () => true),
    getPosition: vi.fn(async () => ({
      coords: { ...point, accuracy: 10 },
      timestamp: now,
    })),
    reverseGeocode: vi.fn(async () => [
      {
        region: "Región de Valparaíso",
        city: "La Ligua",
        subregion: "Petorca",
        isoCountryCode: "CL",
      },
    ]),
  };
}
describe("ubicación consentida, reciente y sin persistir coordenadas", () => {
  it("solicita permiso la primera vez y devuelve región/comuna, no GPS", async () => {
    const a = adapter("undetermined");
    const r = await readDeviceLocation(a, "startup", names, () => now);
    expect(a.requestPermission).toHaveBeenCalledOnce();
    expect(r.status).toBe("ready");
    if (r.status === "ready") {
      expect(r.area.region).toBe("valparaiso");
      expect(r.area.commune).toBe("la-ligua");
      expect(JSON.stringify(r)).not.toContain("latitude");
    }
  });
  it("reutiliza permiso vigente sin volver a pedirlo", async () => {
    const a = adapter();
    await readDeviceLocation(a, "startup", names, () => now);
    expect(a.requestPermission).not.toHaveBeenCalled();
  });
  it("no insiste al abrir o regresar si el usuario denegó", async () => {
    const a = adapter("denied");
    for (const mode of ["startup", "automatic"] as const)
      expect((await readDeviceLocation(a, mode, names, () => now)).status).toBe(
        "denied",
      );
    expect(a.requestPermission).not.toHaveBeenCalled();
    expect(a.getPosition).not.toHaveBeenCalled();
  });
  it("permite volver a solicitar por acción explícita", async () => {
    const a = adapter("denied");
    await readDeviceLocation(a, "manual", names, () => now);
    expect(a.requestPermission).toHaveBeenCalledOnce();
  });
  it("distingue GPS apagado y no lee posición", async () => {
    const a = adapter();
    a.servicesEnabled = async () => false;
    expect(
      (await readDeviceLocation(a, "startup", names, () => now)).status,
    ).toBe("servicesOff");
    expect(a.getPosition).not.toHaveBeenCalled();
  });
  it("rechaza posiciones antiguas", async () => {
    const a = adapter();
    a.getPosition = async () => ({
      coords: { ...point, accuracy: 10 },
      timestamp: now - 180000,
    });
    expect(
      (await readDeviceLocation(a, "startup", names, () => now)).status,
    ).toBe("stale");
  });
  it("no confunde provincia Petorca con comuna La Ligua", () => {
    expect(communeFromAddress({ subregion: "Petorca" }, names)).toBeNull();
    expect(
      communeFromAddress({ city: "La Ligua", subregion: "Petorca" }, names),
    ).toBe("la-ligua");
  });
  it("la geometría impide asignar Metropolitana a una posición en La Ligua", async () => {
    const a = adapter();
    a.reverseGeocode = async () => [
      { region: "Metropolitana de Santiago", city: "Santiago" },
    ];
    const r = await readDeviceLocation(a, "startup", names, () => now);
    expect(r.status).toBe("ready");
    if (r.status === "ready") {
      expect(r.area.region).toBe("valparaiso");
      expect(r.area.commune).toBeNull();
    }
  });
  it("resuelve región aunque falle el geocodificador", async () => {
    const a = adapter();
    a.reverseGeocode = async () => {
      throw Error("sin conexión");
    };
    const r = await readDeviceLocation(a, "startup", names, () => now);
    expect(r.status === "ready" && r.area.region).toBe("valparaiso");
  });
  it("no inventa región fuera del país o con coordenadas inválidas", () => {
    expect(regionAtPoint({ latitude: 0, longitude: 0 })).toBeNull();
    expect(regionAtPoint({ latitude: NaN, longitude: 0 })).toBeNull();
  });
});
