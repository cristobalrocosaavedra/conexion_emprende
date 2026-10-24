import { expect, it } from "vitest";
import { regionIds } from "../../core/src/index";
import { messages } from "./index";
it("cada región navegable tiene un nombre y se explicita el estado de la maqueta", () => {
  expect(Object.keys(messages.regions).sort()).toEqual([...regionIds].sort());
  for (const value of Object.values(messages.regions))
    expect(value.trim().length).toBeGreaterThan(0);
  expect(messages.demo).toContain("CATÁLOGO DE REFERENCIA");
  expect(messages.noLocation).toContain("no guardamos");
});
