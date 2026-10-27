import { Animated, Text, View } from "react-native";
import Svg, { Circle, Path, Polyline } from "react-native-svg";
import type { RegionId } from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
import { countryDrawing } from "./RegionMap";
import { Action } from "./ui";
import type { Palette } from "./ui";
const MovingCircle = Animated.createAnimatedComponent(Circle);
const DrawingLine = Animated.createAnimatedComponent(Polyline);
export interface Journey {
  path: RegionId[];
  index: number;
}
export function RegionJourney({
  journey,
  progress,
  colors,
  height,
  onCancel,
}: {
  journey: Journey;
  progress: Animated.Value;
  colors: Palette;
  height: number;
  onCancel: () => void;
}) {
  const points = journey.path.map(
    (id) => countryDrawing.find((f) => f.id === id)!.center,
  );
  const ranges = points.map((_, i) => i);
  const distances = points.reduce<number[]>(
    (values, p, i) => [
      ...values,
      i
        ? values[i - 1] +
          Math.hypot(p[0] - points[i - 1][0], p[1] - points[i - 1][1])
        : 0,
    ],
    [],
  );
  const length = distances.at(-1)!;
  const current = journey.path[journey.index];
  return (
    <View
      testID="region-journey"
      accessibilityViewIsModal
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: colors.background + "F2",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        gap: 8,
      }}
    >
      <Text style={{ fontSize: 21, fontWeight: "800", color: colors.text }}>
        {t.travelCountry}
      </Text>
      <Text style={{ fontSize: 12, color: colors.muted, textAlign: "center" }}>
        {t.regionShortNames[journey.path[0]]} →{" "}
        {t.regionShortNames[journey.path.at(-1)!]}
      </Text>
      <Svg
        width={150}
        height={Math.min(300, Math.max(160, height - 210))}
        viewBox="0 0 125 615"
        accessible={false}
      >
        {countryDrawing.map((f) => (
          <Path
            key={f.id}
            d={f.path}
            fill={
              f.id === current
                ? "#F5BC70"
                : journey.path.includes(f.id)
                  ? "#2E9FA6"
                  : "#355268"
            }
            stroke={colors.background}
            strokeWidth={1}
          />
        ))}
        <Polyline
          points={points.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke="#DCECE7"
          strokeWidth={2}
          strokeDasharray="5 5"
          opacity={0.6}
        />
        <DrawingLine
          points={points.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke="#F5BC70"
          strokeWidth={4}
          strokeDasharray={`${length} ${length}`}
          strokeDashoffset={progress.interpolate({
            inputRange: ranges,
            outputRange: distances.map((d) => length - d),
          })}
        />
        <MovingCircle
          cx={progress.interpolate({
            inputRange: ranges,
            outputRange: points.map((p) => p[0]),
          })}
          cy={progress.interpolate({
            inputRange: ranges,
            outputRange: points.map((p) => p[1]),
          })}
          r={7}
          fill="#fff"
          stroke="#F5BC70"
          strokeWidth={3}
        />
      </Svg>
      <Text
        accessibilityLiveRegion="polite"
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: colors.accent,
          textAlign: "center",
        }}
      >
        {t.regions[current]}
      </Text>
      <Text style={{ fontSize: 11, color: colors.muted }}>
        {journey.index + 1} / {journey.path.length} · {t.regionsLabel}
      </Text>
      <Action
        label={t.cancelJourney}
        onPress={onCancel}
        colors={colors}
        small
      />
    </View>
  );
}
