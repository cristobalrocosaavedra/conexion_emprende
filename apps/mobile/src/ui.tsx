import { useState } from "react";
import type { ReactNode } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import type { ImageSourcePropType } from "react-native";
import { palettes } from "@territorio-vivo/design-tokens";
import {
  communeName,
  roadAreaForPlace,
  coverFrame,
} from "@territorio-vivo/core";
import type { Place } from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
import { placeArt, placeArtLabel, placeArtFit } from "./art";
export type Palette = typeof palettes.dark | typeof palettes.light;
export function Action({
  label,
  onPress,
  colors,
  primary = false,
  small = false,
  disabled = false,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  colors: Palette;
  primary?: boolean;
  small?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: 48,
          borderRadius: 16,
          paddingHorizontal: small ? 12 : 18,
          paddingVertical: 12,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: primary ? colors.accent : colors.border,
          backgroundColor: primary ? colors.accent : colors.surface,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text
        style={{
          color: primary
            ? colors === palettes.dark
              ? "#072b30"
              : "#fff"
            : colors.text,
          fontSize: small ? 12 : 15,
          fontWeight: "700",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Pill({
  children,
  colors,
}: {
  children: ReactNode;
  colors: Palette;
}) {
  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: colors.badge,
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 10,
      }}
    >
      <Text style={{ color: colors.accent, fontSize: 11, fontWeight: "700" }}>
        {children}
      </Text>
    </View>
  );
}
export function Cover({
  source,
  focusX = 0.5,
  dark = true,
  children,
}: {
  source: ImageSourcePropType;
  focusX?: number;
  dark?: boolean;
  children?: ReactNode;
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  return (
    <View
      testID="territorial-cover"
      onLayout={(e) => setSize(e.nativeEvent.layout)}
      style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}
    >
      <Image
        source={source}
        resizeMode="cover"
        style={
          size.width
            ? {
                position: "absolute",
                ...coverFrame(size.width, size.height, focusX),
              }
            : StyleSheet.absoluteFill
        }
      />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="veil" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#031a2d" stopOpacity="0.65" />
              <Stop offset="0.33" stopColor="#031a2d" stopOpacity="0.02" />
              <Stop
                offset="0.62"
                stopColor={dark ? "#071e30" : "#fcf6eb"}
                stopOpacity="0.6"
              />
              <Stop
                offset="1"
                stopColor={dark ? "#071e30" : "#fcf6eb"}
                stopOpacity="1"
              />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#veil)" />
        </Svg>
      </View>
      {children}
    </View>
  );
}
export function PlaceCard({
  place,
  colors,
  onPress,
  onSave,
  saved = false,
  compact = false,
  dense = false,
}: {
  place: Place;
  colors: Palette;
  onPress: () => void;
  onSave: () => void;
  saved?: boolean;
  compact?: boolean;
  dense?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={place.name}
      onPress={onPress}
      style={{
        width: compact ? 235 : "100%",
        borderRadius: 22,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
    >
      <View>
        <Image
          source={placeArt(place)}
          style={{
            width: "100%",
            height: dense
              ? place.origin === "osm"
                ? 44
                : 60
              : compact
                ? 98
                : 155,
            backgroundColor:
              placeArtFit(place) === "contain" ? "#fff" : undefined,
          }}
          resizeMode={placeArtFit(place)}
        />
        <View
          style={{
            display: placeArtFit(place) === "contain" ? "none" : "flex",
            position: "absolute",
            bottom: 7,
            left: 9,
            backgroundColor: "#062635dc",
            borderRadius: 9,
            padding: 5,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 9 }}>
            {placeArtLabel(place)}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${saved ? t.saved : t.save}: ${place.name}`}
          onPress={(e) => {
            e.stopPropagation();
            onSave();
          }}
          style={{
            position: "absolute",
            right: 7,
            top: 7,
            minWidth: 48,
            minHeight: 48,
            borderRadius: 16,
            backgroundColor: "#092c43e8",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 24 }}>
            {saved ? "★" : "☆"}
          </Text>
        </Pressable>
      </View>
      <View style={{ padding: dense ? 9 : 13, gap: 5 }}>
        <Text style={{ color: colors.accent, fontSize: 11, fontWeight: "700" }}>
          {communeName(place.commune)} · {t.categories[place.category]}
        </Text>
        <Text
          numberOfLines={compact ? 1 : 2}
          style={{
            color: colors.text,
            fontWeight: "700",
            fontSize: compact ? 15 : 19,
          }}
        >
          {place.name}
        </Text>
        {!compact && (
          <Text
            numberOfLines={3}
            style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}
          >
            {place.origin === "osm"
              ? t.osmReference
              : place.origin === "master"
                ? t.masterReference
                : place.summary}
          </Text>
        )}
        <Text style={{ color: colors.muted, fontSize: 10 }}>{t.pending}</Text>
        {roadAreaForPlace(place) !== "mainland" && (
          <Text style={{ color: colors.accent, fontSize: 11 }}>
            {t.requiresFlight}
          </Text>
        )}
        {place.origin === "osm" && (
          <Text style={{ color: colors.muted, fontSize: 9, lineHeight: 11 }}>
            {t.osmCredit}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
