import { messages as t } from "@territorio-vivo/i18n";
import {
  communeById,
  communes,
  href,
  places,
  provinceById,
  provinces,
  regionName,
  regions,
} from "../../src/territorio";

export const dynamic = "force-static";
/** Índice del buscador: solo nombres y direcciones públicas. */
export function GET() {
  const data = [
    ...regions.map((r) => ({
      k: "region",
      n: t.regions[r],
      d: t.sitio.regionTitle(t.regions[r], r),
      h: href.region(r),
    })),
    ...provinces.map((p) => ({
      k: "province",
      n: p.name,
      d: regionName(p.region),
      h: href.province(p.id),
    })),
    ...communes.map((c) => ({
      k: "commune",
      n: c.name,
      d: `${provinceById(c.province)?.name ?? ""} · ${regionName(c.region)}`,
      h: href.commune(c.id),
    })),
    ...places.map((p) => ({
      k: "place",
      n: p.name,
      d: `${communeById(p.commune)?.name ?? p.commune} · ${regionName(p.region)}`,
      h: href.place(p),
      a: (p.aliases ?? []).join(" "),
    })),
  ];
  return Response.json(data);
}
