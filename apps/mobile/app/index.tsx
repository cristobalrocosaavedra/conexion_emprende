import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  BackHandler,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  neighbor,
  regionIds,
  resolveTheme,
  transitionPath,
} from "@territorio-vivo/core";
import type { RegionId, ThemePreference } from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
import { palettes } from "@territorio-vivo/design-tokens";
import { Landscape } from "../src/Landscape";
import { RegionMap } from "../src/RegionMap";

type Tab = "home" | "explore" | "events" | "trip" | "businesses";
export default function Home() {
  const [region, setRegion] = useState<RegionId>("valparaiso");
  const [passing, setPassing] = useState<RegionId | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [theme, setTheme] = useState<ThemePreference>("system");
  const [reduceMotion, setReduceMotion] = useState(false);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const current = passing ?? region;
  const mode = resolveTheme(theme, useColorScheme());
  const colors = palettes[mode];
  const cancel = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  };
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active) setReduceMotion(value);
    });
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      active = false;
      subscription.remove();
      timeouts.current.forEach(clearTimeout);
    };
  }, []);
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (tab !== "home") {
          setTab("home");
          return true;
        }
        return false;
      },
    );
    return () => subscription.remove();
  }, [tab]);
  const selectRegion = (next: RegionId) => {
    cancel();
    setDrawer(false);
    const path = transitionPath(current, next);
    if (reduceMotion || path.length < 2) {
      setRegion(next);
      setPassing(null);
      return;
    }
    const interval = Math.min(140, 1200 / path.length);
    path.forEach((id, i) => {
      timeouts.current.push(
        setTimeout(
          () => {
            if (i === path.length - 1) {
              setRegion(id);
              setPassing(null);
            } else setPassing(id);
          },
          interval * (i + 1),
        ),
      );
    });
  };
  const pan = PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) =>
      Math.abs(g.dy) > 30 && Math.abs(g.dy) > Math.abs(g.dx) * 1.5,
    onPanResponderRelease: (_, g) => {
      if (Math.abs(g.dy) < 50) return;
      const next = neighbor(current, g.dy < 0 ? "north" : "south");
      if (next) selectRegion(next);
    },
  });
  const colorText = { color: colors.text };
  const muted = { color: colors.muted };
  const surface = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  };
  const button = (label: string, onPress: () => void, selected = false) => (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.button,
        surface,
        selected && { borderColor: colors.accent },
      ]}
    >
      <Text style={[styles.buttonText, colorText]}>{label}</Text>
    </Pressable>
  );
  const headings = {
    home: t.discover,
    explore: t.explore,
    events: t.events,
    trip: t.tripTitle,
    businesses: t.businesses,
  };
  const bodies = {
    home: t.discoverBody,
    explore: t.exploreBody,
    events: t.eventsBody,
    trip: t.tripBody,
    businesses: t.businessesBody,
  };
  return (
    <SafeAreaView style={[styles.page, { backgroundColor: colors.background }]}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <View style={styles.header}>
        <Text style={[styles.brand, colorText]}>{t.brand}</Text>
        <View style={styles.theme}>
          <Text style={[styles.caption, muted]}>{t.theme}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t.theme}: ${t[theme]}`}
            onPress={() =>
              setTheme(
                theme === "system"
                  ? "dark"
                  : theme === "dark"
                    ? "light"
                    : "system",
              )
            }
            style={[styles.themeButton, surface]}
          >
            <Text style={colorText}>{t[theme]}</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.regionHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.openRegions}
          onPress={() => setDrawer(true)}
          style={[styles.regionButton, surface]}
        >
          <Text style={[styles.regionName, colorText]}>
            {t.regions[current]} ▾
          </Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {tab === "home" ? (
          <>
            <View style={[styles.hero, surface]} {...pan.panHandlers}>
              <Landscape dark={mode === "dark"} />
              <Text style={[styles.illustration, muted]}>{t.illustration}</Text>
              <View style={styles.directions}>
                {neighbor(current, "north") ? (
                  button(
                    `↑ ${t.north}`,
                    () => selectRegion(neighbor(current, "north")!),
                    false,
                  )
                ) : (
                  <View />
                )}
                {neighbor(current, "south") ? (
                  button(
                    `↓ ${t.south}`,
                    () => selectRegion(neighbor(current, "south")!),
                    false,
                  )
                ) : (
                  <View />
                )}
              </View>
            </View>
            <Text style={[styles.title, colorText]}>{headings[tab]}</Text>
            <Text style={[styles.body, muted]}>{bodies[tab]}</Text>
            <View style={styles.cards}>
              {button(t.explore, () => setTab("explore"))}
              {button(t.events, () => setTab("events"))}
              {button(t.businesses, () => setTab("businesses"))}
            </View>
          </>
        ) : (
          <View style={[styles.empty, surface]}>
            <Text style={[styles.title, colorText]}>{headings[tab]}</Text>
            <Text style={[styles.body, muted]}>{bodies[tab]}</Text>
            {tab !== "trip" && (
              <>
                <Text style={[styles.emptyTitle, colorText]}>{t.empty}</Text>
                <Text style={[styles.body, muted]}>{t.emptyBody}</Text>
              </>
            )}
            {button(t.returnHome, () => setTab("home"))}
          </View>
        )}
        <Text style={[styles.notice, { color: colors.accent }]}>{t.demo}</Text>
        <Text style={[styles.caption, muted]}>{t.manual}</Text>
        <Text style={[styles.caption, muted]}>{t.noLocation}</Text>
      </ScrollView>
      <View style={[styles.tabs, { borderTopColor: colors.border }]}>
        {(["home", "explore", "events", "trip"] as const).map((id) => (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === id }}
            onPress={() => setTab(id)}
            style={[
              styles.tab,
              tab === id && { backgroundColor: colors.badge },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: tab === id ? colors.accent : colors.muted },
              ]}
            >
              {t[id]}
            </Text>
          </Pressable>
        ))}
      </View>
      <Modal
        visible={drawer}
        transparent
        animationType={reduceMotion ? "none" : "fade"}
        onRequestClose={() => setDrawer(false)}
      >
        <View style={styles.overlay}>
          <SafeAreaView
            accessibilityViewIsModal
            style={[styles.drawer, { backgroundColor: colors.background }]}
          >
            <View style={styles.drawerHeading}>
              <Text style={[styles.title, colorText]}>{t.chooseRegion}</Text>
              {button(t.close, () => setDrawer(false))}
            </View>
            <ScrollView contentContainerStyle={styles.drawerContent}>
              <View style={styles.mapLayout}>
                <RegionMap selected={current} onSelect={selectRegion} />
                <View style={styles.regionList}>
                  {regionIds.map((id) => (
                    <Pressable
                      key={id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: current === id }}
                      onPress={() => selectRegion(id)}
                      style={[
                        styles.regionItem,
                        surface,
                        current === id && { borderColor: colors.accent },
                      ]}
                    >
                      <Text style={[styles.regionLabel, colorText]}>
                        {t.regions[id]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <Text style={[styles.caption, muted]}>{t.schematic}</Text>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  brand: { fontSize: 25, fontWeight: "800", flexShrink: 1 },
  theme: { alignItems: "flex-end" },
  themeButton: {
    minHeight: 48,
    paddingHorizontal: 12,
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
  },
  regionHeader: { paddingHorizontal: 20, paddingVertical: 12 },
  regionButton: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    minHeight: 48,
  },
  regionName: { fontSize: 17, fontWeight: "600" },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
    maxWidth: 680,
    width: "100%",
    alignSelf: "center",
  },
  hero: { borderRadius: 24, borderWidth: 1, overflow: "hidden" },
  illustration: { fontSize: 11, padding: 10 },
  directions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 12,
  },
  button: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    justifyContent: "center",
  },
  buttonText: { fontWeight: "600", fontSize: 16 },
  title: { fontSize: 26, fontWeight: "700" },
  body: { fontSize: 16, lineHeight: 25 },
  cards: { gap: 10 },
  notice: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 10 },
  caption: { fontSize: 12, lineHeight: 19 },
  tabs: { flexDirection: "row", padding: 8, borderTopWidth: 1, gap: 3 },
  tab: {
    flex: 1,
    minHeight: 52,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  tabText: { fontSize: 13, fontWeight: "600" },
  empty: { borderWidth: 1, borderRadius: 20, padding: 20, gap: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  overlay: { flex: 1, backgroundColor: "#00000088", flexDirection: "row" },
  drawer: { width: "94%", maxWidth: 480, height: "100%" },
  drawerHeading: { padding: 16, gap: 12 },
  drawerContent: { paddingHorizontal: 16, paddingBottom: 24 },
  mapLayout: { flexDirection: "row", gap: 12 },
  regionList: { flex: 1, gap: 6 },
  regionItem: {
    minHeight: 48,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
  },
  regionLabel: { fontSize: 14 },
});
