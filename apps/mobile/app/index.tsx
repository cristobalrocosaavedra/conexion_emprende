import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  BackHandler,
  Image,
  Linking,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import {
  catalogTerritories,
  communeName,
  provinceName,
  searchTerritories,
  masterEvidence,
  curatedRoutes,
  nationalSuggestions,
  filterPlaces,
  haversineDistanceKm,
  isLocated,
  localities,
  moveStop,
  neighbor,
  places,
  regionIds,
  resolveTheme,
  swipeDirection,
  toggleStop,
  transitionPath,
} from "@territorio-vivo/core";
import type { Category, Place, RegionId } from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
import { palettes } from "@territorio-vivo/design-tokens";
import { RegionPicker } from "../src/RegionPicker";
import { RegionJourney } from "../src/RegionJourney";
import type { Journey } from "../src/RegionJourney";
import { PlaceMap } from "../src/PlaceMap";
import { Action, Cover, Pill, PlaceCard } from "../src/ui";
import {
  placeArt,
  regionArt,
  routeArt,
  eventArt,
  placeArtLabel,
  placeArtFit,
} from "../src/art";
import { usePreferences } from "../src/usePreferences";
import { NavigationPanel } from "../src/NavigationPanel";
import { useLiveTrip } from "../src/useLiveTrip";
import { useRoutingServer } from "../src/useRoutingServer";
import { useDeviceLocation } from "../src/useDeviceLocation";

type Tab = "home" | "explore" | "events" | "trip" | "businesses" | "routes";
type MapMode = "region" | "trip" | "place" | null;
export default function Home() {
  const { preferences, setPreferences, hydrated, storageError } =
    usePreferences();
  const { region, commune, theme, stopIds, roundTrip } = preferences;
  const setCommune = (commune: string) =>
    setPreferences((p) => ({ ...p, commune }));
  const [passing, setPassing] = useState<RegionId | null>(null);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [pickerHeight, setPickerHeight] = useState(400);
  const journeyProgress = useRef(new Animated.Value(0)).current;
  const [drawer, setDrawer] = useState(false),
    [tab, setTab] = useState<Tab>("home");
  const tabRef = useRef(tab);
  tabRef.current = tab;
  const [category, setCategory] = useState("all"),
    [query, setQuery] = useState("");
  const [detail, setDetail] = useState<Place | null>(null),
    [eventDetail, setEventDetail] = useState<number | null>(null);
  const [mapMode, setMapMode] = useState<MapMode>(null),
    [mapPlace, setMapPlace] = useState<Place | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false),
    [pageHeight, setPageHeight] = useState(650);
  const manualRegionSelection = useRef(false);
  const [physicalRegion, setPhysicalRegion] = useState<RegionId | null>(null);
  const [nearbyOrder, setNearbyOrder] = useState<string[]>([]);
  const [locatedCommune, setLocatedCommune] = useState<string | null>(null);
  const motion = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const generation = useRef(0),
    timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const current = passing ?? region;
  const compactHome = pageHeight < 600;
  const regionRef = useRef(current);
  regionRef.current = current;
  const mode = resolveTheme(theme, useColorScheme()),
    colors = palettes[mode];
  const text = { color: colors.text },
    muted = { color: colors.muted };
  const activeCommune =
    commune !== "all"
      ? commune
      : physicalRegion === current
        ? locatedCommune
        : null;
  const activeProvince = activeCommune
    ? catalogTerritories.find(
        (p) =>
          p.level === "commune" &&
          p.region === current &&
          p.commune === activeCommune,
      )?.province
    : null;
  const regionalPlaces = useMemo(
    () => places.filter((p) => p.region === current),
    [current],
  );
  const regionalTerritories = catalogTerritories.filter(
    (p) => p.region === current,
  );
  const provinceIds = regionalTerritories
    .filter((p) => p.level === "province")
    .map((p) => p.province);
  const territoryMatches = useMemo(() => searchTerritories(query), [query]);
  const localCommuneCount = activeProvince
    ? new Set(
        regionalTerritories
          .filter((p) => p.level === "commune" && p.province === activeProvince)
          .map((p) => p.commune),
      ).size
    : regionalTerritories.filter((p) => p.level === "commune").length;
  const filtered = useMemo(
    () =>
      filterPlaces(current, commune, category, query).filter(
        (p) => tab !== "businesses" || p.category === "gastronomia",
      ),
    [current, commune, category, query, tab],
  );
  const nationalMatches = useMemo(
    () => nationalSuggestions(query, current),
    [query, current],
  );
  const tripPlaces = useMemo(
    () =>
      stopIds
        .map((id) => places.find((p) => p.id === id))
        .filter((p): p is Place => Boolean(p)),
    [stopIds],
  );
  const routingServer = useRoutingServer();
  const liveTrip = useLiveTrip(tripPlaces, roundTrip, routingServer.url);
  const tripLocated = useMemo(() => tripPlaces.filter(isLocated), [tripPlaces]);
  const tripDistance = useMemo(() => {
    const points =
      roundTrip && tripLocated.length > 1
        ? [...tripLocated, tripLocated[0]]
        : tripLocated;
    return points.reduce(
      (sum, p, i) => (i ? sum + haversineDistanceKm(points[i - 1], p) : sum),
      0,
    );
  }, [tripLocated, roundTrip]);
  const communeIds = useMemo(
    () =>
      catalogTerritories
        .filter((p) => p.level === "commune" && p.region === current)
        .map((p) => p.commune!),
    [current],
  );
  const regionalLocalities = useMemo(
    () =>
      localities.filter(
        (p) =>
          communeIds.includes(p.commune) &&
          (!p.region ? current === "valparaiso" : p.region === current),
      ),
    [communeIds, current],
  );
  const featured = useMemo(
    () =>
      [...regionalPlaces]
        .sort((a, b) => {
          const localDifference =
            Number(b.commune === activeCommune) -
            Number(a.commune === activeCommune);
          if (localDifference) return localDifference;
          const ai = nearbyOrder.indexOf(a.id),
            bi = nearbyOrder.indexOf(b.id);
          if (ai >= 0 || bi >= 0)
            return (ai >= 0 ? ai : Infinity) - (bi >= 0 ? bi : Infinity);
          return (
            Number(b.commune === locatedCommune) -
            Number(a.commune === locatedCommune)
          );
        })
        .slice(0, 5),
    [regionalPlaces, locatedCommune, nearbyOrder, activeCommune],
  );
  const mapPoints =
    mapMode === "trip"
      ? tripPlaces
      : mapMode === "place" && mapPlace
        ? [mapPlace]
        : filtered;
  const mapRegion =
    mapMode === "place" && mapPlace
      ? mapPlace.region
      : mapMode === "trip" && tripPlaces.length
        ? tripPlaces[0].region
        : current;
  const setStops = (next: string[]) =>
    setPreferences((p) => ({ ...p, stopIds: next }));
  const save = (id: string) =>
    setPreferences((p) => ({ ...p, stopIds: toggleStop(p.stopIds, id) }));
  const clearAnimation = () => {
    setJourney(null);
    journeyProgress.stopAnimation();
    generation.current++;
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    motion.stopAnimation();
    opacity.stopAnimation();
  };
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (active) setReduceMotion(v);
    });
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => {
      active = false;
      sub.remove();
      generation.current++;
      timeouts.current.forEach(clearTimeout);
      motion.stopAnimation();
      opacity.stopAnimation();
      journeyProgress.stopAnimation();
    };
  }, [motion, opacity, journeyProgress]);
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (journey) {
        clearAnimation();
        setPassing(null);
        motion.setValue(0);
        opacity.setValue(1);
        return true;
      }
      if (detail) {
        setDetail(null);
        return true;
      }
      if (eventDetail !== null) {
        setEventDetail(null);
        return true;
      }
      if (mapMode) {
        setMapMode(null);
        return true;
      }
      if (tab !== "home") {
        setTab("home");
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [detail, eventDetail, mapMode, tab, journey]);
  const finishRegion = (id: RegionId, nextCommune?: string) => {
    setPreferences((p) => ({
      ...p,
      region: id,
      commune: nextCommune ?? (p.region === id ? p.commune : "all"),
    }));
    setCategory("all");
    setQuery("");
    setPassing(null);
    setJourney(null);
  };
  const selectRegion = (
    next: RegionId,
    gesture = false,
    nextCommune?: string,
    animate = true,
    source: "user" | "location" = "user",
  ) => {
    manualRegionSelection.current = source === "user";
    clearAnimation();
    setDrawer(false);
    setTab("home");
    const origin = regionRef.current,
      path = transitionPath(origin, next),
      ticket = generation.current;
    if (!animate || !path.length || reduceMotion) {
      finishRegion(next, nextCommune);
      motion.setValue(0);
      opacity.setValue(1);
      return;
    }
    if (gesture) {
      const sign = regionIds.indexOf(next) < regionIds.indexOf(origin) ? 1 : -1;
      Animated.timing(motion, {
        toValue: sign * pageHeight * 0.18,
        duration: 100,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || generation.current !== ticket) return;
        finishRegion(next, nextCommune);
        motion.setValue(-sign * pageHeight * 0.16);
        Animated.timing(motion, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }).start();
      });
      return;
    }
    motion.setValue(0);
    opacity.setValue(1);
    const steps = [origin, ...path];
    const interval =
      Math.min(3600, Math.max(1100, steps.length * 240)) / steps.length;
    setJourney({ path: steps, index: 0 });
    journeyProgress.setValue(0);
    Animated.timing(journeyProgress, {
      toValue: path.length,
      duration: interval * path.length,
      useNativeDriver: false,
    }).start();
    path.forEach((id, i) =>
      timeouts.current.push(
        setTimeout(
          () => {
            if (generation.current !== ticket) return;
            setPassing(id);
            setJourney({ path: steps, index: i + 1 });
          },
          interval * (i + 1),
        ),
      ),
    );
    timeouts.current.push(
      setTimeout(() => {
        if (generation.current === ticket) finishRegion(next, nextCommune);
      }, interval * steps.length),
    );
  };
  const pan = PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, g) =>
      tab === "home" &&
      !drawer &&
      !journey &&
      Math.abs(g.dy) > 18 &&
      Math.abs(g.dy) > Math.abs(g.dx) * 1.25,
    onPanResponderMove: (_, g) => motion.setValue(g.dy * 0.25),
    onPanResponderRelease: (_, g) => {
      const direction = swipeDirection(g.dx, g.dy, g.vy);
      const next = direction ? neighbor(regionRef.current, direction) : null;
      if (next) selectRegion(next, true);
      else
        Animated.spring(motion, { toValue: 0, useNativeDriver: true }).start();
    },
    onPanResponderTerminate: () =>
      Animated.spring(motion, { toValue: 0, useNativeDriver: true }).start(),
  });
  const deviceLocation = useDeviceLocation({
    enabled: hydrated,
    selectionVersion: () => generation.current,
    onReady: (area, mode, version) => {
      setPhysicalRegion(area.region);
      setNearbyOrder(area.nearbyIds);
      setLocatedCommune(area.commune);
      if (
        mode === "manual" ||
        (tabRef.current === "home" &&
          !manualRegionSelection.current &&
          generation.current === version)
      ) {
        selectRegion(
          area.region,
          false,
          area.commune ?? "all",
          false,
          "location",
        );
      }
    },
  });
  const locationBusy = deviceLocation.busy,
    locationMessage = deviceLocation.message;
  useEffect(() => {
    if (deviceLocation.result && deviceLocation.result.status !== "ready") {
      setPhysicalRegion(null);
      setLocatedCommune(null);
      setNearbyOrder([]);
    }
  }, [deviceLocation.result]);
  const locate = async () => {
    try {
      if (
        deviceLocation.result?.status === "denied" &&
        !deviceLocation.result.canAskAgain
      ) {
        await Linking.openSettings();
        return;
      }
      if (deviceLocation.result?.status === "servicesOff") {
        if (Platform.OS === "android")
          await Linking.sendIntent("android.settings.LOCATION_SOURCE_SETTINGS");
        else await Linking.openSettings();
        return;
      }
      await deviceLocation.refresh("manual");
    } catch {
      await deviceLocation.refresh("manual");
    }
  };
  const openPlace = (id: string) => {
    const place = places.find((p) => p.id === id);
    if (place) {
      setMapMode(null);
      setDetail(place);
    }
  };
  const openSource = (url: string) => {
    try {
      if (["https:", "http:"].includes(new URL(url).protocol))
        void Linking.openURL(url).catch(() => {});
    } catch {
      /* Fuentes inválidas no se abren. */
    }
  };
  const title = (value: string) => (
    <Text style={[styles.title, text]}>{value}</Text>
  );
  const body = (value: string) => (
    <Text style={[styles.body, muted]}>{value}</Text>
  );
  const button = (
    label: string,
    onPress: () => void,
    primary = false,
    small = false,
    disabled = false,
    accessibilityLabel?: string,
  ) => (
    <Action
      label={label}
      onPress={onPress}
      colors={colors}
      primary={primary}
      small={small}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
    />
  );
  const tag = (value: string) => <Pill colors={colors}>{value}</Pill>;
  const card = (place: Place, compact = false) => (
    <PlaceCard
      key={place.id}
      place={place}
      colors={colors}
      compact={compact}
      dense={compact && compactHome}
      onPress={() => setDetail(place)}
      onSave={() => save(place.id)}
      saved={stopIds.includes(place.id)}
    />
  );
  const renderRoutes = () =>
    curatedRoutes.map((route) => (
      <View
        key={route.id}
        style={[
          styles.panel,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Image
          source={routeArt(route.id)}
          resizeMode="cover"
          style={styles.routeImage}
        />
        <View style={styles.panelInside}>
          {tag(t.artLabel)}
          {title(route.name)}
          {body(route.description)}
          {tag(t.pending)}
          {button(
            t.loadRoute,
            () => {
              setStops([...new Set([...stopIds, ...route.stopIds])]);
              setTab("trip");
            },
            true,
          )}
          <Pressable
            accessibilityRole="link"
            onPress={() => openSource(route.source.url)}
          >
            <Text style={[styles.source, { color: colors.accent }]}>
              {route.source.label}
            </Text>
          </Pressable>
        </View>
      </View>
    ));
  return (
    <SafeAreaView style={[styles.page, { backgroundColor: colors.background }]}>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.brand, text]}>{t.brand}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.openRegions}
            onPress={() => setDrawer(true)}
            style={styles.selector}
          >
            <Text
              style={[styles.selectorText, { color: colors.accent }]}
              numberOfLines={1}
            >
              ☰ {t.regions[current]} ▾
            </Text>
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t.location}
          onPress={() => {
            setDrawer(true);
          }}
          style={[styles.themeButton, { borderColor: colors.border }]}
        >
          <Text style={{ color: colors.accent, fontSize: 20 }}>⌖</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t.theme}: ${t[theme]}`}
          onPress={() =>
            setPreferences((p) => ({
              ...p,
              theme:
                p.theme === "system"
                  ? "dark"
                  : p.theme === "dark"
                    ? "light"
                    : "system",
            }))
          }
          style={[styles.themeButton, { borderColor: colors.border }]}
        >
          <Text style={[styles.caption, muted]}>◐ {t[theme]}</Text>
        </Pressable>
      </View>
      {tab === "home" ? (
        <View
          style={styles.homeBody}
          onLayout={(e) => setPageHeight(e.nativeEvent.layout.height)}
          {...pan.panHandlers}
        >
          <Animated.View
            testID="regional-window"
            importantForAccessibility={journey ? "no-hide-descendants" : "auto"}
            accessibilityElementsHidden={Boolean(journey)}
            style={[
              styles.homeWindow,
              { transform: [{ translateY: motion }], opacity },
            ]}
          >
            <Cover source={regionArt(current)} dark={mode === "dark"} />
            <View
              style={[
                styles.heroTop,
                compactHome && { paddingTop: 10, gap: 4 },
              ]}
            >
              <Text style={styles.eyebrow}>
                {locationBusy
                  ? t.locationBusy
                  : deviceLocation.result?.status === "ready" &&
                      physicalRegion === current
                    ? t.currentArea
                    : t.consultedArea}
              </Text>
              <Text
                style={[
                  styles.heroTitle,
                  compactHome && { fontSize: 29, lineHeight: 34 },
                ]}
              >
                {compactHome ? t.regionShortNames[current] : t.regions[current]}
              </Text>
              {activeCommune && (
                <View style={styles.localContext}>
                  <Text style={styles.provinceContext}>
                    {activeProvince
                      ? `${t.provincePrefix} ${provinceName(activeProvince)}`
                      : t.regions[current]}
                  </Text>
                  <Text
                    style={[
                      styles.communeContext,
                      compactHome && { fontSize: 18 },
                    ]}
                  >
                    {t.communePrefix} {communeName(activeCommune)}
                  </Text>
                  <Text style={styles.artLabel}>
                    {physicalRegion === current &&
                    locatedCommune === activeCommune
                      ? t.located
                      : t.manualCommune}
                  </Text>
                </View>
              )}
              {!compactHome && (
                <Text style={styles.heroSubtitle}>
                  {t.regionStories[current]}
                </Text>
              )}
              <Text style={styles.artLabel}>{t.artLabel}</Text>
            </View>
            <View style={styles.homeBottom}>
              <View
                style={[
                  styles.rowBetween,
                  {
                    backgroundColor: colors.background + "EB",
                    borderRadius: 16,
                    padding: 10,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionHeading, text]}>
                    {regionalPlaces.length
                      ? `${activeCommune ? regionalPlaces.filter((p) => p.commune === activeCommune).length : regionalPlaces.length} ${t.referencePlaces}`
                      : t.discoverRegion}
                  </Text>
                  <Text style={[styles.caption, muted]}>
                    {regionalPlaces.length
                      ? `${activeProvince ? `${t.provincePrefix} ${provinceName(activeProvince)}` : `${provinceIds.length} ${t.provincesLabel}`} · ${localCommuneCount} ${t.communesLabel}`
                      : t.subtitle}
                  </Text>
                </View>
                {button(t.map, () => setMapMode("region"), false, true)}
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ flexDirection: "row", gap: 7 }}
              >
                {button(t.explore, () => setTab("explore"), true, true)}
                {button(t.events, () => setTab("events"), false, true)}
                {button(t.routes, () => setTab("routes"), false, true)}
                {button(t.businesses, () => setTab("businesses"), false, true)}
              </ScrollView>
              {featured.length ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalCards}
                >
                  {featured.map((p) => card(p, true))}
                </ScrollView>
              ) : (
                <View
                  style={[
                    styles.previewEmpty,
                    {
                      backgroundColor: colors.surface + "E8",
                      borderColor: colors.border,
                    },
                  ]}
                >
                  {body(t.regionalCatalog)}
                  {button(t.viewMap, () => setMapMode("region"), true)}
                </View>
              )}
              <View style={styles.rowBetween}>
                {button(
                  `↑ ${t.north}`,
                  () => {
                    const n = neighbor(current, "north");
                    if (n) selectRegion(n, true);
                  },
                  false,
                  true,
                  !neighbor(current, "north"),
                )}
                <Text style={[styles.swipeCaption, muted]}>{t.swipeHint}</Text>
                {button(
                  `↓ ${t.south}`,
                  () => {
                    const n = neighbor(current, "south");
                    if (n) selectRegion(n, true);
                  },
                  false,
                  true,
                  !neighbor(current, "south"),
                )}
              </View>
            </View>
          </Animated.View>
          {journey && (
            <RegionJourney
              journey={journey}
              progress={journeyProgress}
              colors={colors}
              height={pageHeight}
              onCancel={() => {
                clearAnimation();
                setPassing(null);
                motion.setValue(0);
                opacity.setValue(1);
              }}
            />
          )}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {tab === "explore" || tab === "businesses" ? (
            <>
              <View style={styles.rowBetween}>
                {title(tab === "businesses" ? t.businesses : t.explore)}
                {button(t.map, () => setMapMode("region"), false, true)}
              </View>
              {tag(
                commune !== "all" && activeProvince
                  ? `${t.provincePrefix} ${provinceName(activeProvince)}`
                  : t.regions[current],
              )}
              <TextInput
                accessibilityLabel={t.search}
                placeholder={t.search}
                placeholderTextColor={colors.muted}
                value={query}
                onChangeText={setQuery}
                style={[
                  styles.search,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
              >
                {button(
                  t.allCommunes,
                  () => setCommune("all"),
                  commune === "all",
                  true,
                )}
                {communeIds.map((id) => (
                  <View key={id}>
                    {button(
                      communeName(id),
                      () => setCommune(id),
                      commune === id,
                      true,
                    )}
                  </View>
                ))}
              </ScrollView>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}
              >
                {button(
                  t.all,
                  () => setCategory("all"),
                  category === "all",
                  true,
                )}
                {(Object.keys(t.categories) as Category[]).map((id) => (
                  <View key={id}>
                    {button(
                      t.categories[id],
                      () => setCategory(id),
                      category === id,
                      true,
                    )}
                  </View>
                ))}
              </ScrollView>
              <View style={styles.mapPreview}>
                <PlaceMap
                  region={current}
                  points={filtered}
                  dark={mode === "dark"}
                  onPlace={openPlace}
                />
              </View>
              <Text style={[styles.caption, muted]}>
                {t.notOfficialMap} · {filtered.length} {t.referencePlaces}
              </Text>
              {filtered.length ? (
                filtered.map((p) => card(p))
              ) : (
                <View
                  style={[
                    styles.panelInside,
                    { backgroundColor: colors.surface, borderRadius: 20 },
                  ]}
                >
                  {body(
                    regionalPlaces.length
                      ? nationalMatches.length
                        ? t.noRegionalResults
                        : t.noResults
                      : t.regionalCatalog,
                  )}
                </View>
              )}
              {nationalMatches.length > 0 && (
                <View style={{ gap: 12 }}>
                  {title(t.otherRegions)}
                  {body(t.otherRegionsHelp)}
                  {nationalMatches.map((p) => (
                    <View key={p.id}>
                      {tag(
                        `${t.regions[p.region]} · ${communeName(p.commune)}`,
                      )}
                      {card(p)}
                    </View>
                  ))}
                </View>
              )}
              {territoryMatches.length > 0 && (
                <View style={{ gap: 8 }}>
                  {title(t.territoryMatches)}
                  {body(t.territoryReference)}
                  {territoryMatches.map((territory) => (
                    <View key={territory.id}>
                      {button(
                        `${territory.name} · ${t.regions[territory.region]}`,
                        () => {
                          manualRegionSelection.current = true;
                          setPreferences((p) => ({
                            ...p,
                            region: territory.region,
                            commune: territory.commune ?? "all",
                          }));
                          setQuery("");
                        },
                      )}
                    </View>
                  ))}
                </View>
              )}
              {regionalLocalities.length > 0 && (
                <View
                  style={[
                    styles.panelInside,
                    {
                      borderColor: colors.border,
                      borderWidth: 1,
                      borderRadius: 20,
                    },
                  ]}
                >
                  {title(t.localitiesLabel)}
                  {body(
                    regionalLocalities
                      .filter((l) => commune === "all" || l.commune === commune)
                      .map((l) => l.name)
                      .join(" · "),
                  )}
                </View>
              )}
            </>
          ) : tab === "routes" ? (
            <>
              {title(t.curatedRoutes)}
              {body(t.routesReference)}
              {renderRoutes()}
            </>
          ) : tab === "events" ? (
            <>
              {title(t.events)}
              {tag(t.regions[current])}
              {body(t.noLiveEvents)}
              {title(t.demoEvents)}
              {t.eventNames.map((name, i) => (
                <Pressable
                  key={name}
                  accessibilityRole="button"
                  accessibilityLabel={name}
                  onPress={() => setEventDetail(i)}
                  style={[
                    styles.panel,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Image source={eventArt(i)} style={styles.routeImage} />
                  <View style={styles.panelInside}>
                    {tag(t.eventExample)}
                    {title(name)}
                    {body(t.eventBody)}
                  </View>
                </Pressable>
              ))}
            </>
          ) : (
            <>
              {title(t.trip)}
              {body(`${tripPlaces.length} ${t.selectedCount}`)}
              {!tripPlaces.length ? (
                <>
                  {body(t.emptyTrip)}
                  {button(t.explore, () => setTab("explore"), true)}
                  {title(t.curatedRoutes)}
                  {renderRoutes()}
                </>
              ) : (
                <>
                  <View style={styles.quickActions}>
                    {button(
                      t.onlyOneWay,
                      () => setPreferences((p) => ({ ...p, roundTrip: false })),
                      !roundTrip,
                      true,
                    )}
                    {button(
                      t.roundTrip,
                      () => setPreferences((p) => ({ ...p, roundTrip: true })),
                      roundTrip,
                      true,
                    )}
                    {button(t.map, () => setMapMode("trip"), false, true)}
                  </View>
                  <View style={styles.mapPreview}>
                    <PlaceMap
                      region={tripPlaces[0].region}
                      points={tripPlaces}
                      trip
                      roundTrip={roundTrip}
                      dark={mode === "dark"}
                      onPlace={openPlace}
                      navigation={{
                        route: liveTrip.route,
                        fix: liveTrip.fix,
                        follow: liveTrip.active,
                        publicService: routingServer.publicService,
                      }}
                    />
                  </View>
                  <NavigationPanel
                    nav={liveTrip}
                    server={routingServer}
                    dark={mode === "dark"}
                    onMap={() => setMapMode("trip")}
                  />
                  {!liveTrip.route && (
                    <>
                      {tag(t.tripSchematic)}
                      {body(`${tripDistance.toFixed(1)} ${t.straightDistance}`)}
                    </>
                  )}
                  {tripPlaces.map((p, i) => (
                    <View
                      key={p.id}
                      style={[
                        styles.tripStop,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setDetail(p)}
                        style={{ flex: 1 }}
                      >
                        <Text style={[styles.sectionHeading, text]}>
                          {i + 1}. {p.name}
                          {liveTrip.visited.includes(p.id)
                            ? ` · ${t.navigation.visited}`
                            : ""}
                        </Text>
                        <Text style={[styles.caption, muted]}>
                          {t.regions[p.region]} · {t.pending}
                        </Text>
                      </Pressable>
                      <View style={styles.quickActions}>
                        {button(
                          "↑",
                          () => setStops(moveStop(stopIds, p.id, -1)),
                          false,
                          true,
                          i === 0,
                          `${t.moveUp}: ${p.name}`,
                        )}
                        {button(
                          "↓",
                          () => setStops(moveStop(stopIds, p.id, 1)),
                          false,
                          true,
                          i === tripPlaces.length - 1,
                          `${t.moveDown}: ${p.name}`,
                        )}
                        {button(t.remove, () => save(p.id), false, true)}
                      </View>
                    </View>
                  ))}
                </>
              )}
            </>
          )}
          {body(locationMessage)}
          {button(
            locationBusy ? t.locationBusy : t.location,
            () => void locate(),
            false,
            false,
            locationBusy,
          )}
          <Text style={[styles.caption, muted]}>{t.locationExplanation}</Text>
          {physicalRegion && button(t.yourZone, () => void locate())}
          {storageError && body(t.storageUnavailable)}
          <Text style={[styles.caption, muted]}>
            {t.demo} · {t.sourceDate}
            {"\n"}
            {t.osmLicense}
          </Text>
          {button(
            t.openDataLicense,
            () =>
              void Linking.openURL(
                "https://github.com/cristobalrocosaavedra/conexion_emprende/blob/6c377f14f4b6125bb1a4dc0f453fb244a38a4296/content/sources/OSM-CHILE.md",
              ),
          )}
        </ScrollView>
      )}
      <View
        style={[
          styles.tabs,
          { borderTopColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        {(["home", "explore", "events", "trip"] as const).map((id, i) => (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{
              selected: tab === id,
              disabled: Boolean(journey),
            }}
            disabled={Boolean(journey)}
            onPress={() => setTab(id)}
            style={[
              styles.tab,
              tab === id && { backgroundColor: colors.badge },
            ]}
          >
            <Text
              style={{
                fontSize: 19,
                color: tab === id ? colors.accent : colors.muted,
              }}
            >
              {["⌂", "⌕", "▦", "♡"][i]}
            </Text>
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
            <View style={styles.modalHeading}>
              {title(t.chooseRegion)}
              {button(t.close, () => setDrawer(false), false, true)}
            </View>
            <Text
              style={{ fontSize: 11, color: colors.muted, textAlign: "center" }}
            >
              {t.pickerHint}
            </Text>
            <ScrollView
              style={{ flex: 1 }}
              onLayout={(e) => setPickerHeight(e.nativeEvent.layout.height)}
              contentContainerStyle={{
                paddingHorizontal: 12,
                flexGrow: 1,
                justifyContent: "center",
              }}
            >
              <RegionPicker
                selected={current}
                onSelect={selectRegion}
                colors={colors}
                height={pickerHeight}
              />
            </ScrollView>
            <View style={{ padding: 10, gap: 4 }}>
              {locationMessage ? (
                <Text style={[styles.caption, muted]}>{locationMessage}</Text>
              ) : null}
              <View
                style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
              >
                {button(
                  locationBusy ? t.locationBusy : t.location,
                  () => void locate(),
                  false,
                  true,
                  locationBusy,
                )}
                <Text
                  style={{
                    flex: 1,
                    fontSize: 10,
                    lineHeight: 13,
                    color: colors.muted,
                  }}
                >
                  {t.locationCompact}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 9,
                  lineHeight: 12,
                  color: colors.muted,
                  textAlign: "center",
                }}
              >
                {t.geographicMap}
              </Text>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
      <Modal
        visible={detail !== null}
        animationType={reduceMotion ? "none" : "slide"}
        onRequestClose={() => setDetail(null)}
      >
        <SafeAreaView
          style={[styles.page, { backgroundColor: colors.background }]}
        >
          {detail && (
            <>
              <View style={styles.modalHeading}>
                {button(t.close, () => setDetail(null), false, true)}
                {tag(t.pending)}
              </View>
              <ScrollView contentContainerStyle={styles.content}>
                <Image
                  source={placeArt(detail)}
                  resizeMode={placeArtFit(detail)}
                  style={[
                    styles.detailImage,
                    placeArtFit(detail) === "contain" && {
                      backgroundColor: "#fff",
                    },
                  ]}
                />
                {tag(placeArtLabel(detail))}
                {title(detail.name)}
                {body(
                  `${communeName(detail.commune)} · ${t.regions[detail.region]}`,
                )}
                {tag(t.categories[detail.category])}
                {body(
                  detail.origin === "osm" ? t.osmDetails : detail.description,
                )}
                {body(
                  detail.origin === "osm"
                    ? t.osmReference
                    : detail.origin === "master"
                      ? t.masterReference
                      : t.inherited,
                )}
                {masterEvidence[detail.id] && (
                  <View style={{ gap: 8 }}>
                    {body(masterEvidence[detail.id].category)}
                    {masterEvidence[detail.id].possibleDuplicateIds.length >
                      0 && body(t.possibleDuplicate)}
                    {body(t.masterAccessPending)}
                  </View>
                )}
                {body(t.visitInfo)}
                {button(
                  stopIds.includes(detail.id) ? t.saved : t.save,
                  () => save(detail.id),
                  true,
                )}
                {isLocated(detail)
                  ? button(t.viewMap, () => {
                      setMapPlace(detail);
                      setDetail(null);
                      setMapMode("place");
                    })
                  : body(t.locationPending)}
                {title(t.source)}
                {detail.source ? (
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => openSource(detail.source!.url)}
                  >
                    <Text style={[styles.source, { color: colors.accent }]}>
                      {detail.source.label} ↗
                    </Text>
                  </Pressable>
                ) : (
                  body(masterEvidence[detail.id]?.sourceLabel ?? t.sourceOwner)
                )}
                <Text style={[styles.caption, muted]}>
                  {detail.origin === "master"
                    ? `${t.importedOn} ${detail.importedAt} · ${t.pending}`
                    : t.sourceDate}
                </Text>
                {detail.origin === "osm" && (
                  <Text style={[styles.caption, muted]}>{t.osmLicense}</Text>
                )}
              </ScrollView>
            </>
          )}
        </SafeAreaView>
      </Modal>
      <Modal
        visible={mapMode !== null}
        animationType={reduceMotion ? "none" : "slide"}
        onRequestClose={() => setMapMode(null)}
      >
        <SafeAreaView
          style={[styles.page, { backgroundColor: colors.background }]}
        >
          <View style={styles.modalHeading}>
            {title(
              mapMode === "trip"
                ? t.trip
                : mapMode === "place" && mapPlace
                  ? mapPlace.name
                  : t.regions[current],
            )}
            {button(t.close, () => setMapMode(null), false, true)}
          </View>
          <PlaceMap
            region={mapRegion}
            points={mapPoints}
            trip={mapMode === "trip"}
            roundTrip={roundTrip}
            dark={mode === "dark"}
            onPlace={openPlace}
            navigation={
              mapMode === "trip"
                ? {
                    route: liveTrip.route,
                    fix: liveTrip.fix,
                    follow: liveTrip.active,
                    publicService: routingServer.publicService,
                  }
                : undefined
            }
          />
          <View style={styles.mapFooter}>
            {mapMode === "trip" ? (
              <NavigationPanel
                nav={liveTrip}
                server={routingServer}
                dark={mode === "dark"}
                compact
              />
            ) : (
              body(t.catalogReference)
            )}
          </View>
        </SafeAreaView>
      </Modal>
      <Modal
        visible={eventDetail !== null}
        animationType={reduceMotion ? "none" : "slide"}
        onRequestClose={() => setEventDetail(null)}
      >
        <SafeAreaView
          style={[styles.page, { backgroundColor: colors.background }]}
        >
          <View style={styles.modalHeading}>
            {title(t.events)}
            {button(t.close, () => setEventDetail(null), false, true)}
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            <Image
              source={eventArt(eventDetail ?? 0)}
              style={styles.detailImage}
            />
            {tag(t.eventExample)}
            {title(t.eventNames[eventDetail ?? 0])}
            {body(t.eventBody)}
            {tag(t.regions[current])}
          </ScrollView>
        </SafeAreaView>
      </Modal>
      {!hydrated && <View pointerEvents="none" style={styles.hydration} />}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1 },
  header: {
    paddingHorizontal: 22,
    paddingTop: 9,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brand: { fontSize: 25, fontWeight: "800", letterSpacing: -0.6 },
  selector: { minHeight: 38, justifyContent: "center" },
  selectorText: { fontSize: 13, fontWeight: "600" },
  themeButton: {
    borderWidth: 1,
    minHeight: 48,
    justifyContent: "center",
    borderRadius: 15,
    paddingHorizontal: 12,
  },
  homeBody: { flex: 1, overflow: "hidden" },
  homeWindow: { flex: 1 },
  localContext: { gap: 3 },
  provinceContext: { color: "#dcece7", fontSize: 12 },
  communeContext: { color: "#fff", fontSize: 22, fontWeight: "700" },
  heroTop: { paddingHorizontal: 24, paddingTop: 22, gap: 8 },
  eyebrow: {
    color: "#dbefe9",
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "700",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 37,
    fontWeight: "800",
    letterSpacing: -1,
    lineHeight: 43,
    maxWidth: 310,
  },
  heroSubtitle: { color: "#fff", fontSize: 16, maxWidth: 290, lineHeight: 23 },
  artLabel: { color: "#d9e4df", fontSize: 9, marginTop: 4 },
  homeBottom: {
    marginTop: "auto",
    paddingHorizontal: 18,
    paddingBottom: 7,
    gap: 9,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  sectionHeading: { fontSize: 17, fontWeight: "700" },
  quickActions: { flexDirection: "row", gap: 7, flexWrap: "wrap" },
  horizontalCards: { gap: 12, paddingVertical: 1, paddingRight: 4 },
  previewEmpty: { padding: 15, borderRadius: 20, borderWidth: 1, gap: 10 },
  swipeCaption: { fontSize: 9, textAlign: "center", flex: 1, lineHeight: 14 },
  content: {
    padding: 20,
    paddingBottom: 35,
    gap: 15,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  title: { fontSize: 25, fontWeight: "700", letterSpacing: -0.4 },
  body: { fontSize: 14, lineHeight: 23 },
  caption: { fontSize: 11, lineHeight: 17 },
  panel: { borderRadius: 22, borderWidth: 1, overflow: "hidden" },
  panelInside: { padding: 18, gap: 13 },
  routeImage: { height: 180, width: "100%" },
  search: {
    borderRadius: 15,
    borderWidth: 1,
    minHeight: 50,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  chips: { gap: 7 },
  mapPreview: { height: 285, borderRadius: 21, overflow: "hidden" },
  source: { fontSize: 14, lineHeight: 22, textDecorationLine: "underline" },
  tripStop: { padding: 15, borderRadius: 19, borderWidth: 1, gap: 12 },
  tabs: { flexDirection: "row", padding: 8, borderTopWidth: 1, gap: 4 },
  tab: {
    flex: 1,
    minHeight: 58,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    gap: 3,
  },
  tabText: { fontSize: 11, fontWeight: "600" },
  overlay: { flex: 1, backgroundColor: "#00000088" },
  drawer: { width: "96%", maxWidth: 500, height: "100%" },
  modalHeading: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  drawerContent: { padding: 16, gap: 15 },
  mapLayout: { flexDirection: "row", gap: 14 },
  regionList: { flex: 1, gap: 6 },
  detailImage: { height: 245, width: "100%", borderRadius: 22 },
  mapFooter: { padding: 15 },
  hydration: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#071e30aa",
  },
});
