import { useState } from "react";
import { Text, View, Linking } from "react-native";
import { messages as t } from "@territorio-vivo/i18n";
import { durationParts } from "@territorio-vivo/core";
import type { RoadStep, TravelMode } from "@territorio-vivo/core";
import { palettes } from "@territorio-vivo/design-tokens";
import { Action } from "./ui";
import type { useLiveTrip } from "./useLiveTrip";
import type { useRoutingServer } from "./useRoutingServer";
const n = t.navigation;
export function maneuverText(step: RoadStep | undefined): string {
  if (!step) return n.maneuvers.continue;
  const m = n.maneuvers;
  let text =
    step.type === "arrive"
      ? m.arrive
      : step.type === "depart"
        ? m.depart
        : step.type.includes("roundabout") || step.type === "rotary"
          ? m.roundabout
          : step.type === "off ramp"
            ? m.exit
            : step.modifier === "uturn"
              ? m.uturn
              : step.modifier.includes("left")
                ? `${m.turn} ${m.left}`
                : step.modifier.includes("right")
                  ? `${m.turn} ${m.right}`
                  : m.straight;
  if (step.exit && text === m.roundabout) text += ` · ${m.exit} ${step.exit}`;
  return step.roadName ? `${text} · ${step.roadName}` : text;
}
export const distanceText = (meters: number) =>
  meters < 1000
    ? `${Math.round(meters)} ${n.maneuvers.meters}`
    : `${(meters / 1000).toFixed(1)} ${n.maneuvers.kilometers}`;
export function durationText(seconds: number) {
  const { hours, minutes } = durationParts(seconds);
  return hours
    ? `${hours} ${n.maneuvers.hours}${minutes ? ` ${minutes} ${n.maneuvers.minutes}` : ""}`
    : `${minutes} ${n.maneuvers.minutes}`;
}
export function NavigationPanel({
  nav,
  server,
  dark,
  compact = false,
  onMap,
  mode = "car",
  onMode,
}: {
  nav: ReturnType<typeof useLiveTrip>;
  server: ReturnType<typeof useRoutingServer>;
  dark: boolean;
  compact?: boolean;
  onMap?: () => void;
  mode?: TravelMode;
  onMode?: (mode: TravelMode) => void;
}) {
  const [more, setMore] = useState(false);
  const fg = dark ? "#f4f0e5" : "#123247",
    muted = dark ? "#c1cbd0" : "#46616c";
  const busy = nav.status === "locating" || nav.status === "calculating";
  const action = (
    label: string,
    onPress: () => void,
    disabled = false,
    primary = false,
  ) => (
    <Action
      key={label}
      label={label}
      onPress={onPress}
      disabled={disabled}
      primary={primary}
      colors={palettes[dark ? "dark" : "light"]}
    />
  );
  return (
    <View
      style={{
        padding: 14,
        gap: 10,
        borderRadius: 16,
        backgroundColor: dark ? "#123345" : "#edf4ee",
      }}
    >
      <Text style={{ color: fg, fontSize: 18, fontWeight: "700" }}>
        {n.title}
      </Text>
      <Text
        accessibilityLiveRegion="polite"
        style={{ color: fg, fontWeight: "600" }}
      >
        {nav.error === "requiresFlight" ? n.transferRequired : n[nav.status]}
      </Text>
      {nav.error && <Text style={{ color: fg }}>{n.errors[nav.error]}</Text>}
      {nav.route && (
        <>
          <Text style={{ color: fg, fontSize: 20, fontWeight: "700" }}>
            {distanceText(
              nav.update?.remainingMeters ?? nav.route.distanceMeters,
            )}{" "}
            ·{" "}
            {durationText(
              nav.update?.remainingSeconds ?? nav.route.durationSeconds,
            )}
          </Text>
          {!compact && <Text style={{ color: muted }}>{n.road}</Text>}
          {nav.active && (
            <Text style={{ color: fg, fontSize: 18 }}>
              {distanceText(nav.update?.distanceToManeuver ?? 0)} ·{" "}
              {maneuverText(nav.route.steps[nav.update?.nextStepIndex ?? 0])}
            </Text>
          )}
        </>
      )}
      {nav.update && !nav.update.reliable && (
        <Text style={{ color: fg }}>{n.poorSignal}</Text>
      )}
      {nav.update?.offRoute && <Text style={{ color: fg }}>{n.offRoute}</Text>}
      {!server.url ? (
        <>
          <Text style={{ color: fg }}>{n.serverMissing}</Text>
          {action(n.enable, () => void server.enable(), server.busy)}
        </>
      ) : (
        <>
          {onMode && server.publicService && !nav.active && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {action(n.modeFoot, () => onMode("foot"), busy, mode === "foot")}
              {action(n.modeCar, () => onMode("car"), busy, mode === "car")}
            </View>
          )}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {!nav.active && action(n.start, () => void nav.start(), busy)}
            {nav.active &&
              action(n.recalculate, () => void nav.recalculate(), busy)}
            {(nav.active || busy || nav.route) && action(n.stop, nav.stop)}
            {onMap && action(n.openMap, onMap)}
          </View>
          {server.publicService && (
            <Text style={{ color: muted, fontSize: 13 }}>
              {n.publicPrivacyShort}
            </Text>
          )}
          {!compact && action(more ? n.less : n.more, () => setMore((v) => !v))}
          {!compact && more && (
            <>
              <Text style={{ color: muted }}>
                {server.publicService ? n.publicService : n.connected}
              </Text>
              {server.publicService && (
                <Text style={{ color: muted }}>{n.publicPrivacy}</Text>
              )}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {!nav.active &&
                  action(n.calculate, () => void nav.preview(true), busy)}
                {!nav.active &&
                  action(n.preview, () => void nav.preview(false), busy)}
                {server.publicService &&
                  action(
                    n.conditions,
                    () =>
                      void Linking.openURL(
                        "https://routing.openstreetmap.de/about.html",
                      ),
                  )}
                {server.publicService &&
                  action(
                    n.fixMap,
                    () =>
                      void Linking.openURL(
                        "https://www.openstreetmap.org/fixthemap",
                      ),
                  )}
                {!nav.active &&
                  action(
                    n.disable,
                    () => {
                      nav.stop();
                      void server.disconnect();
                    },
                    busy,
                  )}
              </View>
              <Text style={{ color: muted }}>
                {n.foreground}
                {"\n"}
                {n.liveEdits}
              </Text>
            </>
          )}
        </>
      )}
      {server.storageFailed && (
        <Text style={{ color: muted }}>{t.storageUnavailable}</Text>
      )}
    </View>
  );
}
