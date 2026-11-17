import { describe, expect, it } from "vitest";
import { businessPlans, formatClp, teamContact, withIva } from "./commercial";

describe("planes para negocios", () => {
  it("muestran neto + IVA y su total", () => {
    expect(businessPlans.map((p) => withIva(p.netClp))).toEqual([
      11888, 29738, 47588,
    ]);
    expect(formatClp(11888)).toBe("$11.888");
  });

  it("solo hay un plan recomendado", () => {
    expect(businessPlans.filter((p) => p.recommended)).toHaveLength(1);
  });

  it("el contacto del equipo solo aparece si está bien configurado", () => {
    expect(teamContact({})).toEqual({ email: null, whatsapp: null });
    expect(
      teamContact({
        EXPO_PUBLIC_CONTACTO_CORREO: "hola@ejemplo.cl",
        EXPO_PUBLIC_CONTACTO_WHATSAPP: "+56 9 1234 5678",
      }),
    ).toEqual({ email: "hola@ejemplo.cl", whatsapp: "56912345678" });
    expect(
      teamContact({ EXPO_PUBLIC_CONTACTO_CORREO: "no-es-correo" }).email,
    ).toBeNull();
  });
});
