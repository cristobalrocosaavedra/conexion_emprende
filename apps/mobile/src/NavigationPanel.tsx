import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { messages as t } from "@territorio-vivo/i18n";
import type { RoadStep } from "@territorio-vivo/core";
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
export function NavigationPanel({
  nav,
  server,
  dark,
  compact = false,
  onMap,
}: {
  nav: ReturnType<typeof useLiveTrip>;
  server: ReturnType<typeof useRoutingServer>;
  dark: boolean;
  compact?: boolean;
  onMap?: () => void;
}) {
  const [input, setInput] = useState("");
  const fg = dark ? "#f4f0e5" : "#123247",
    muted = dark ? "#c1cbd0" : "#46616c";
  const busy = nav.status === "locating" || nav.status === "calculating";
  const action = (label: string, onPress: () => void, disabled = false) => (
    <Action
      key={label}
      label={label}
      onPress={onPress}
      disabled={disabled}
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
        {n[nav.status]}
      </Text>
      {nav.error && <Text style={{ color: fg }}>{n.errors[nav.error]}</Text>}
      {nav.route && (
        <>
          <Text style={{ color: fg, fontSize: 20, fontWeight: "700" }}>
            {distanceText(
              nav.update?.remainingMeters ?? nav.route.distanceMeters,
            )}{" "}
            ·{" "}
            {Math.ceil(
              (nav.update?.remainingSeconds ?? nav.route.durationSeconds) / 60,
            )}{" "}
            {n.maneuvers.minutes}
          </Text>
          <Text style={{ color: muted }}>{n.road}</Text>
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
          {!compact && (
            <>
              <Text style={{ color: fg, fontWeight: "700" }}>
                {n.serverTitle}
              </Text>
              <Text style={{ color: muted }}>{n.serverHelp}</Text>
              <TextInput
                accessibilityLabel={n.serverTitle}
                placeholder={n.serverPlaceholder}
                placeholderTextColor={muted}
                value={input}
                onChangeText={setInput}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={{
                  color: fg,
                  backgroundColor: dark ? "#102d42" : "#fff",
                  padding: 12,
                  borderRadius: 8,
                  minHeight: 48,
                }}
              />
              {action(
                server.busy ? n.connecting : n.connect,
                () => void server.connect(input),
                server.busy || !input.trim(),
              )}
              {server.failed && (
                <Text style={{ color: fg }}>{n.serverError}</Text>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {!compact && <Text style={{ color: muted }}>{n.connected}</Text>}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {!nav.active && action(n.start, () => void nav.start(), busy)}
            {!nav.active &&
              !compact &&
              action(n.calculate, () => void nav.preview(true), busy)}
            {!nav.active &&
              !compact &&
              action(n.preview, () => void nav.preview(false), busy)}
            {nav.active &&
              action(n.recalculate, () => void nav.recalculate(), busy)}
            {(nav.active || busy || nav.route) && action(n.stop, nav.stop)}
            {onMap && action(n.openMap, onMap)}
          </View>
          {!compact &&
            !nav.active &&
            action(
              n.disconnect,
              () => {
                nav.stop();
                void server.disconnect();
              },
              busy,
            )}
        </>
      )}
      {!compact && (
        <Text style={{ color: muted }}>
          {n.foreground}
          {"\n"}
          {n.liveEdits}
        </Text>
      )}
      {server.storageFailed && (
        <Text style={{ color: muted }}>{t.storageUnavailable}</Text>
      )}
    </View>
  );
}
