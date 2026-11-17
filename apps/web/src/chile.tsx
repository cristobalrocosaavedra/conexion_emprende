import { regionFeatures } from "@territorio-vivo/core";
import type { RegionId } from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
import { chileViewBox, isIsland, project } from "./proyeccion";
import { zoneOf } from "./zonas";

const paths = regionFeatures.map((f) => ({
  id: f.properties.id,
  d: f.geometry.coordinates
    .filter((polygon) => !isIsland(polygon[0][0][0]))
    .map((polygon) =>
      polygon
        .map(
          (ring) =>
            "M" +
            ring.map(([lon, lat]) => project(lon, lat).join(" ")).join("L") +
            "Z",
        )
        .join(""),
    )
    .join(""),
}));

/** Silueta esquemática de Chile continental coloreada por zona. */
export function ChileStrip({
  active,
  links = false,
  children,
  className,
}: {
  active?: RegionId | null;
  links?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox={chileViewBox}
      className={className ?? "chile"}
      role="img"
      aria-label={t.notOfficialMap}
    >
      {paths.map((p) => {
        const shape = (
          <path
            key={p.id}
            d={p.d}
            className={`zona-${zoneOf(p.id)}${active === p.id ? " activa" : ""}`}
          >
            <title>{t.regions[p.id]}</title>
          </path>
        );
        return links ? (
          <a key={p.id} href={`/region/${p.id}`}>
            {shape}
          </a>
        ) : (
          shape
        );
      })}
      {children}
    </svg>
  );
}
export function regionCenter(id: RegionId): [number, number] {
  const f = regionFeatures.find((x) => x.properties.id === id)!;
  const [[w, s], [e, n]] = f.properties.bounds;
  return project((w + e) / 2, (s + n) / 2);
}
