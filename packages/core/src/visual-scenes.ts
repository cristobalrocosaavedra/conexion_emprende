import type { RegionId } from "./index";

export type VisualSceneId =
  | RegionId
  | "petorca-interior"
  | "litoral-central"
  | "choapa-costa"
  | "chiloe"
  | "altiplano"
  | "valparaiso-interior"
  | "coquimbo-costa"
  | "rapa-nui";

/** Dirección artística, nunca clasificación territorial ni prueba del lugar. */
export function visualScene(
  region: RegionId,
  commune?: string | null,
  coastal = false,
): VisualSceneId {
  if (region === "valparaiso") {
    if (commune === "isla-de-pascua") return "rapa-nui";
    if (["petorca", "cabildo", "la-ligua"].includes(commune ?? ""))
      return coastal && commune === "la-ligua"
        ? "litoral-central"
        : "petorca-interior";
    if (
      [
        "papudo",
        "zapallar",
        "puchuncavi",
        "quintero",
        "concon",
        "vina-del-mar",
        "algarrobo",
        "el-quisco",
        "el-tabo",
        "cartagena",
        "san-antonio",
        "santo-domingo",
      ].includes(commune ?? "")
    )
      return "litoral-central";
    if (
      [
        "olmue",
        "hijuelas",
        "limache",
        "quillota",
        "la-cruz",
        "nogales",
        "calera",
        "los-andes",
        "san-esteban",
        "calle-larga",
        "rinconada",
        "san-felipe",
        "catemu",
        "llay-llay",
        "panquehue",
        "putaendo",
        "santa-maria",
        "quilpue",
        "villa-alemana",
        "casablanca",
      ].includes(commune ?? "")
    )
      return "valparaiso-interior";
  }
  if (region === "coquimbo") {
    if (commune === "los-vilos") return "choapa-costa";
    if (["la-serena", "coquimbo"].includes(commune ?? ""))
      return "coquimbo-costa";
  }
  if (
    region === "los-lagos" &&
    [
      "ancud",
      "castro",
      "chonchi",
      "curaco-de-velez",
      "dalcahue",
      "puqueldon",
      "queilen",
      "quellon",
      "quemchi",
      "quinchao",
    ].includes(commune ?? "")
  )
    return "chiloe";
  if (
    (region === "arica-parinacota" &&
      ["putre", "general-lagos"].includes(commune ?? "")) ||
    (region === "tarapaca" && commune === "colchane")
  )
    return "altiplano";
  return region;
}

/** Mantiene el motivo visible al pasar de paisaje a ventana vertical, sin deformar. */
export function coverFrame(width: number, height: number, focusX = 0.5) {
  const imageHeight = Math.max(height, width / 1.5);
  const imageWidth = imageHeight * 1.5;
  return {
    width: imageWidth,
    height: imageHeight,
    left: Math.max(
      width - imageWidth,
      Math.min(0, width / 2 - imageWidth * focusX),
    ),
    top: (height - imageHeight) / 2,
  };
}
