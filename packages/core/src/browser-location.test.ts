import { describe, expect, it } from "vitest";
import { createBrowserLocationAdapter } from "./browser-location";
import type { BrowserGeolocation } from "./browser-location";
import { readDeviceLocation } from "./device-location";
import { communeNames } from "./catalog";

// Punto sintético de prueba en la Región de Valparaíso; no es una ubicación real de usuario.
const point = { latitude: -32.4498524, longitude: -71.2320966 };

function fakeGeo(result: "ok" | "denied" | "timeout", calls = { n: 0 }) {
  const geo: BrowserGeolocation = {
    getCurrentPosition: (success, error) => {
      calls.n++;
      if (result === "ok")
        success({ coords: { ...point, accuracy: 20 }, timestamp: Date.now() });
      else error({ code: result === "denied" ? 1 : 3 });
    },
  };
  return geo;
}
const permissions = (state: string) => ({ query: async () => ({ state }) });

describe("ubicación en el navegador", () => {
  it("al iniciar pide permiso una sola vez y resuelve región y cercanía sin geocodificador", async () => {
    const calls = { n: 0 };
    const adapter = createBrowserLocationAdapter(
      fakeGeo("ok", calls),
      permissions("prompt"),
    );
    const result = await readDeviceLocation(adapter, "startup", communeNames);
    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.area.region).toBe("valparaiso");
    expect(result.area.nearbyIds.length).toBeGreaterThan(0);
    expect(calls.n).toBe(1);
    expect(await adapter.reverseGeocode(point)).toEqual([]);
  });

  it("si la persona rechaza, no vuelve a preguntar", async () => {
    const adapter = createBrowserLocationAdapter(
      fakeGeo("denied"),
      permissions("prompt"),
    );
    const first = await readDeviceLocation(adapter, "startup", communeNames);
    expect(first).toEqual({ status: "denied", canAskAgain: false });
    expect(await adapter.getPermission()).toEqual({
      status: "denied",
      canAskAgain: false,
    });
  });

  it("respeta un rechazo previo guardado por el navegador", async () => {
    const calls = { n: 0 };
    const adapter = createBrowserLocationAdapter(
      fakeGeo("ok", calls),
      permissions("denied"),
    );
    const result = await readDeviceLocation(adapter, "startup", communeNames);
    expect(result).toEqual({ status: "denied", canAskAgain: false });
    expect(calls.n).toBe(0);
  });

  it("un tiempo de espera agotado no se trata como rechazo", async () => {
    const adapter = createBrowserLocationAdapter(
      fakeGeo("timeout"),
      permissions("prompt"),
    );
    const result = await readDeviceLocation(adapter, "startup", communeNames);
    expect(result.status).toBe("unavailable");
  });

  it("sin geolocalización disponible queda denegado sin preguntar", async () => {
    const adapter = createBrowserLocationAdapter(undefined);
    const result = await readDeviceLocation(adapter, "startup", communeNames);
    expect(result).toEqual({ status: "denied", canAskAgain: false });
  });
});
