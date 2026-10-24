import { useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import Svg, { G, Line, Path } from "react-native-svg";
import type { RegionId } from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
import type { Palette } from "./ui";
import { countryDrawing } from "./RegionMap";
export function RegionPicker({
  selected,
  onSelect,
  colors,
  height,
}: {
  selected: RegionId;
  onSelect: (id: RegionId) => void;
  colors: Palette;
  height: number;
}) {
  const [width, setWidth] = useState(320);
  const { fontScale } = useWindowDimensions();
  const targetHeight = Math.max(44, Math.ceil(28 * fontScale));
  const h = Math.max(52 + 7.5 * targetHeight, Math.min(height, 500));
  const mapScale = Math.min(80 / 125, (h - 24) / 615),
    offsetX = (width - 125 * mapScale) / 2,
    offsetY = (h - 615 * mapScale) / 2;
  const labelWidth = (width - 80) / 2 - 8;
  const y = (index: number) => 26 + (index * (h - 52)) / 15;
  return (
    <View
      testID="compact-region-picker"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ height: h, width: "100%" }}
    >
      <Svg
        width="100%"
        height={h}
        viewBox={`0 0 ${width} ${h}`}
        accessible={false}
      >
        {countryDrawing.map((f) => (
          <Line
            key={f.id}
            x1={f.index % 2 ? width - labelWidth : labelWidth}
            y1={y(f.index)}
            x2={offsetX + f.center[0] * mapScale}
            y2={offsetY + f.center[1] * mapScale}
            stroke={selected === f.id ? colors.accent : colors.border}
            strokeWidth={selected === f.id ? 2 : 1}
          />
        ))}
        <G transform={`translate(${offsetX},${offsetY}) scale(${mapScale})`}>
          {countryDrawing.map((f) => (
            <Path
              key={f.id}
              d={f.path}
              fill={
                selected === f.id
                  ? "#F5BC70"
                  : f.index % 2
                    ? "#2E9FA6"
                    : "#6BC5BF"
              }
              stroke={colors.background}
              strokeWidth={0.7}
              onPress={() => onSelect(f.id)}
            />
          ))}
        </G>
      </Svg>
      {countryDrawing.map((f) => (
        <Pressable
          key={f.id}
          accessibilityRole="button"
          accessibilityLabel={t.regions[f.id]}
          accessibilityState={{ selected: selected === f.id }}
          onPress={() => onSelect(f.id)}
          style={{
            position: "absolute",
            top: y(f.index) - targetHeight / 2,
            ...(f.index % 2 ? { right: 0 } : { left: 0 }),
            width: labelWidth,
            minHeight: targetHeight,
            justifyContent: "center",
            paddingHorizontal: 5,
            borderRadius: 8,
            backgroundColor: selected === f.id ? colors.badge : "transparent",
          }}
        >
          <Text
            numberOfLines={2}
            style={{
              fontSize: 11,
              lineHeight: 14,
              color: selected === f.id ? colors.accent : colors.text,
              fontWeight: selected === f.id ? "800" : "500",
              textAlign: f.index % 2 ? "right" : "left",
            }}
          >
            {t.regionShortNames[f.id]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
