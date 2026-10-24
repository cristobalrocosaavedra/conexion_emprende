import Svg, { Path } from "react-native-svg";
import { regionFeatures } from "@territorio-vivo/core";
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
const paths = regionFeatures.map((f, i) => ({
  id: f.properties.id,
  index: i,
  path: f.geometry.coordinates
    .map(
      (poly) =>
        poly[0]
          .map(
            (p, j) =>
              `${j ? "L" : "M"}${(12 + (p[0] - minX) * scale).toFixed(1)},${(5 + (maxY - mercator(p[1])) * scale).toFixed(1)}`,
          )
          .join(" ") + "Z",
    )
    .join(" "),
}));
export function RegionMap({
  selected,
  onSelect,
}: {
  selected: RegionId;
  onSelect: (id: RegionId) => void;
}) {
  return (
    <Svg
      width={115}
      height={610}
      viewBox="0 0 125 615"
      accessibilityLabel={t.geographicMap}
    >
      {paths.map((f) => (
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
