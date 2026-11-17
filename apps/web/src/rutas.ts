import type { Metadata } from "next";
import { messages as t } from "@territorio-vivo/i18n";
import {
  communeById,
  communes,
  provinceById,
  provinces,
  regionName,
  regions,
  territory,
} from "./territorio";
import type { Level } from "./territorio";

const s = t.sitio;
export function pageParams(level: Level) {
  if (level === "region") return regions.map((region) => ({ region }));
  if (level === "province") return provinces.map((p) => ({ provincia: p.id }));
  return communes.map((c) => ({ comuna: c.id }));
}
export function pageMeta(
  level: Level,
  id: string,
  tab: "todo" | "explore" | "business",
): Metadata {
  const ref = territory(level, id);
  const tabName = s.tabs[tab];
  return {
    title: tab === "todo" ? ref.title : `${tabName} · ${ref.title}`,
    description: `${tabName}: ${ref.title}. ${s.metaDescription}`,
  };
}
/** Texto de «Estás en…» para el territorio que se está viendo. */
export function hereLabel(level: Level, id: string): string {
  if (level === "region") return regionName(territory(level, id).region);
  if (level === "province") return s.provinceTitle(provinceById(id)!.name);
  const c = communeById(id)!;
  return `${c.name} · ${regionName(c.region)}`;
}
