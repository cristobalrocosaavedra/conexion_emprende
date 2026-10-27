import Svg, { Path } from "react-native-svg";
import { regionFeatures, regionIds } from "@territorio-vivo/core";
import type { RegionId } from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
const mercator = (latitude: number) =>
  (Math.log(Math.tan(Math.PI / 4 + (latitude * Math.PI) / 360)) * 180) /
  Math.PI;
const allPoints = regionFeatures.flatMap((f) =>
  f.geometry.coordinates.flatMap((p) => p[0]),
);
const minX = Math.min(...allPoints.map((p) => p[0])),
  maxX = Math.max(...allPoints.map((p) => p[0]));
const minY = Math.min(...allPoints.map((p) => mercator(p[1]))),
  maxY = Math.max(...allPoints.map((p) => mercator(p[1])));
const scale = Math.min(105 / (maxX - minX), 600 / (maxY - minY));
const project = (p: number[]) => [
  12 + (p[0] - minX) * scale,
  5 + (maxY - mercator(p[1])) * scale,
];
export const countryDrawing = regionIds.map((id, index) => {
  const f = regionFeatures.find((f) => f.properties.id === id)!;
  const ring = [...f.geometry.coordinates].sort(
    (a, b) => b[0].length - a[0].length,
  )[0][0];
  const center = project([
    ring.reduce((s, p) => s + p[0], 0) / ring.length,
    ring.reduce((s, p) => s + p[1], 0) / ring.length,
  ]);
  return {
    id,
    index,
    center,
    path: f.geometry.coordinates
      .map(
        (poly) =>
          poly[0]
            .map(
              (p, j) =>
                `${j ? "L" : "M"}${project(p)
                  .map((v) => v.toFixed(1))
                  .join(",")}`,
            )
            .join(" ") + "Z",
      )
      .join(" "),
  };
});
export function RegionMap({
  selected,
  onSelect,
  height = 400,
}: {
  selected: RegionId;
  onSelect: (id: RegionId) => void;
  height?: number;
}) {
  return (
    <Svg
      width={90}
      height={height}
      viewBox="0 0 125 615"
      accessibilityLabel={t.geographicMap}
    >
      {countryDrawing.map((f) => (
        <Path
          key={f.id}
          d={f.path}
          fill={
            selected === f.id ? "#F5BC70" : f.index % 2 ? "#2E9FA6" : "#6BC5BF"
          }
          stroke="#102D42"
          strokeWidth={0.6}
          onPress={() => onSelect(f.id)}
          accessibilityLabel={t.regions[f.id]}
        />
      ))}
    </Svg>
  );
}
