import { it, expect } from "vitest";
import {
  durationParts,
  nationalSuggestions,
  travelHeading,
} from "./travel-display";
it("sugiere Matichoc desde Coquimbo sin depender de la comuna", () => {
  expect(
    nationalSuggestions("matichoc", "coquimbo").map((p) => p.id),
  ).toContain("chocolateria-matichoc");
  expect(nationalSuggestions("MATICHÓC", "coquimbo").length).toBeGreaterThan(0);
  expect(nationalSuggestions("matichoc", "valparaiso")).toEqual([]);
  expect(
    nationalSuggestions("matichock", "coquimbo").map((p) => p.id),
  ).toContain("chocolateria-matichoc");
  expect(nationalSuggestions(" ", "coquimbo")).toEqual([]);
});
it("convierte minutos largos a horas sin perder minutos restantes", () => {
  expect(durationParts(300 * 60)).toEqual({ hours: 5, minutes: 0 });
  expect(durationParts(301 * 60)).toEqual({ hours: 5, minutes: 1 });
  expect(durationParts(3599)).toEqual({ hours: 1, minutes: 0 });
  expect(durationParts(40 * 60)).toEqual({ hours: 0, minutes: 40 });
});
it("usa curso del vehículo y conserva orientación detenido sin seguir ruido", () => {
  expect(travelHeading(null, { latitude: 0, longitude: 0 }, 90, 15, null)).toBe(
    90,
  );
  expect(
    travelHeading(
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 0.000001 },
      240,
      0,
      90,
    ),
  ).toBe(90);
  expect(
    travelHeading(
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 0.001 },
      -1,
      null,
      null,
    ),
  ).toBeCloseTo(90);
});
