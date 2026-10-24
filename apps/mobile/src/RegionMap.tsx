import { View } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { regionIds } from "@territorio-vivo/core";
import type { RegionId } from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
export function RegionMap({
  selected,
  onSelect,
}: {
  selected: RegionId;
  onSelect: (id: RegionId) => void;
}) {
  return (
    <View>
      <Svg
        width={68}
        height={560}
        viewBox="0 0 68 560"
        accessibilityLabel={t.schematic}
      >
        {regionIds.map((id, i) => {
          const x = 15 + Math.sin(i * 0.5) * 9,
            y = i * 34 + 4,
            w = i > 12 ? 25 : 20;
          return (
            <Polygon
              key={id}
              points={`${x},${y} ${x + w},${y + 3} ${x + w + 2},${y + 31} ${x + 2},${y + 34}`}
              fill={selected === id ? "#F4BA69" : i % 2 ? "#39ACAF" : "#77C8BE"}
              stroke="#102D42"
              strokeWidth="1"
              onPress={() => onSelect(id)}
              accessibilityLabel={t.regions[id]}
            />
          );
        })}
      </Svg>
    </View>
  );
}
