import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import * as Location from "expo-location";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import {
  roadAreaAtPoint,
  roadAreaForPlace,
  fetchRoadRoute,
  travelHeading,
  haversineDistanceKm,
  isLocated,
  navigationUpdate,
  routeLengths,
  checkRoutingServer,
  RouteFailure,
} from "@territorio-vivo/core";
import type {
  GeoPoint,
  NavigationFix,
  NavigationUpdate,
  Place,
  RoadRoute,
  RoutingServer,
} from "@territorio-vivo/core";
export type TripStatus =
  | "idle"
  | "locating"
  | "calculating"
  | "ready"
  | "navigating"
  | "paused"
  | "arrived"
  | "error";
export type TripError =
  | "server"
  | "missingCoordinates"
  | "moreStops"
  | "permission"
  | "services"
  | "gps"
  | "network"
  | "timeout"
  | "noRoute"
  | "invalidResponse"
  | "tooManyStops"
  | "invalidPoints"
  | "requiresFlight";
export function useLiveTrip(
  points: Place[],
  roundTrip: boolean,
  serverUrl: string,
) {
  const [status, setStatus] = useState<TripStatus>("idle"),
    [error, setError] = useState<TripError | null>(null);
  const [route, setRoute] = useState<RoadRoute | null>(null),
    [fix, setFix] = useState<NavigationFix | null>(null),
    [update, setUpdate] = useState<NavigationUpdate | null>(null);
  const [active, setActive] = useState(false),
    [foreground, setForeground] = useState(AppState.currentState === "active");
  const [visited, setVisited] = useState<string[]>([]);
  const options = useRef({ points, roundTrip, serverUrl });
  options.current = { points, roundTrip, serverUrl };
  const mounted = useRef(true),
    activeRef = useRef(false),
    started = useRef(false),
    useGps = useRef(true),
    visitedRef = useRef<string[]>([]);
  const routeRef = useRef<RoadRoute | null>(null),
    lengthsRef = useRef<number[]>([]),
    targetIds = useRef<string[]>([]);
  const currentFix = useRef<NavigationFix | null>(null),
    lastReliable = useRef<NavigationFix | null>(null),
    origin = useRef<GeoPoint | null>(null),
    previewOrigin = useRef<GeoPoint | null>(null);
  const controller = useRef<AbortController | null>(null),
    generation = useRef(0),
    lastRequestAt = useRef(0),
    pending = useRef(false),
    progress = useRef(0),
    offRouteCount = useRef(0),
    lastRecalc = useRef(0);
  const server = useRef<RoutingServer | null>(null);
  const requestRef = useRef<(position?: GeoPoint) => Promise<void>>(
    async () => {},
  );
  const fail = useCallback((code: TripError) => {
    if (mounted.current) {
      if (code === "requiresFlight") {
        activeRef.current = false;
        setActive(false);
        origin.current = null;
        currentFix.current = null;
        lastReliable.current = null;
        setFix(null);
      }
      setError(code);
      setStatus("error");
    }
  }, []);
  const readFix = useCallback(async (): Promise<NavigationFix> => {
    let permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== "granted" && permission.canAskAgain)
      permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") throw new Error("permission");
    if (!(await Location.hasServicesEnabledAsync()))
      throw new Error("services");
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const p = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error("gps")), 20000);
        }),
      ]);
      const value = {
        latitude: p.coords.latitude,
        longitude: p.coords.longitude,
        accuracy: p.coords.accuracy,
        timestamp: p.timestamp,
        heading: p.coords.heading,
        speed: p.coords.speed,
      };
      if (
        !Number.isFinite(value.latitude) ||
        !Number.isFinite(value.longitude) ||
        Math.abs(value.latitude) > 90 ||
        Math.abs(value.longitude) > 180 ||
        !Number.isFinite(value.timestamp) ||
        value.accuracy === null ||
        value.accuracy > 100 ||
        value.accuracy < 0 ||
        Date.now() - value.timestamp > 30000 ||
        value.timestamp - Date.now() > 5000
      )
        throw new Error("gps");
      return value;
    } finally {
      clearTimeout(timer);
    }
  }, []);
  const connect = useCallback(async (): Promise<boolean> => {
    const url = options.current.serverUrl;
    const ticket = generation.current;
    if (!url) {
      fail("server");
      return false;
    }
    try {
      const result = await checkRoutingServer(url);
      if (ticket !== generation.current || !mounted.current) return false;
      server.current = result;
      return true;
    } catch {
      if (ticket === generation.current && mounted.current) {
        server.current = null;
        fail("server");
      }
      return false;
    }
  }, [fail]);
  const request = useCallback(
    async (position?: GeoPoint) => {
      const ticket = ++generation.current;
      controller.current?.abort();
      const abort = new AbortController();
      controller.current = abort;
      pending.current = true;
      routeRef.current = null;
      if (mounted.current) {
        setRoute(null);
        setUpdate(null);
        setError(null);
        setStatus("calculating");
      }
      try {
        const opts = options.current;
        if (
          !server.current ||
          server.current.baseUrl !== opts.serverUrl.replace(/\/?$/, "/")
        ) {
          if (!(await connect())) return;
        }
        if (ticket !== generation.current) return;
        const selected = opts.points;
        if (!selected.length || selected.some((p) => !isLocated(p)))
          throw new Error("missingCoordinates");
        let start: GeoPoint;
        if (position) start = position;
        else if (
          activeRef.current &&
          currentFix.current &&
          Date.now() - currentFix.current.timestamp <= 30000
        )
          start = currentFix.current;
        else if (useGps.current) {
          if (mounted.current) setStatus("locating");
          const value = await readFix();
          if (ticket !== generation.current) return;
          currentFix.current = value;
          setFix(value);
          start = value;
        } else start = selected[0] as Place & GeoPoint;
        if (ticket !== generation.current) return;
        if (
          selected.some((p) => roadAreaForPlace(p) !== roadAreaAtPoint(start))
        )
          throw new RouteFailure("requiresFlight");
        if (!origin.current) origin.current = start;
        previewOrigin.current = start;
        const remaining = activeRef.current
          ? selected.filter((p) => !visitedRef.current.includes(p.id))
          : useGps.current
            ? selected
            : selected.slice(1);
        const destinations = remaining.map((p) => ({
          latitude: p.latitude!,
          longitude: p.longitude!,
        }));
        const ids = remaining.map((p) => p.id);
        if (opts.roundTrip) {
          destinations.push(activeRef.current ? origin.current : start);
          ids.push("__return__");
        }
        if (!destinations.length) throw new Error("moreStops");
        const coordinates = [start, ...destinations];
        if (coordinates.length > (server.current?.maxWaypoints ?? 40))
          throw new RouteFailure("tooManyStops");
        const delay = Math.max(0, 1200 - (Date.now() - lastRequestAt.current));
        if (delay)
          await new Promise<void>((resolve) => setTimeout(resolve, delay));
        if (
          ticket !== generation.current ||
          abort.signal.aborted ||
          AppState.currentState !== "active"
        )
          return;
        if (mounted.current) setStatus("calculating");
        lastRequestAt.current = Date.now();
        lastRecalc.current = Date.now();
        const result = await fetchRoadRoute(
          server.current!.baseUrl,
          coordinates,
          abort.signal,
        );
        if (!mounted.current || ticket !== generation.current) return;
        targetIds.current = ids;
        routeRef.current = result;
        lengthsRef.current = routeLengths(result.points);
        progress.current = 0;
        offRouteCount.current = 0;
        lastReliable.current = null;
        setRoute(result);
        setStatus(
          activeRef.current
            ? AppState.currentState !== "active"
              ? "paused"
              : "navigating"
            : "ready",
        );
      } catch (e) {
        if (
          ticket !== generation.current ||
          abort.signal.aborted ||
          AppState.currentState !== "active"
        )
          return;
        const message = e instanceof Error ? e.message : "";
        fail(
          e instanceof RouteFailure
            ? e.code
            : [
                  "permission",
                  "services",
                  "gps",
                  "missingCoordinates",
                  "moreStops",
                  "requiresFlight",
                ].includes(message)
              ? (message as TripError)
              : "network",
        );
      } finally {
        if (ticket === generation.current) pending.current = false;
      }
    },
    [connect, fail, readFix],
  );
  requestRef.current = request;
  const stop = useCallback(() => {
    activeRef.current = false;
    started.current = false;
    generation.current++;
    controller.current?.abort();
    pending.current = false;
    origin.current = null;
    previewOrigin.current = null;
    currentFix.current = null;
    lastReliable.current = null;
    routeRef.current = null;
    progress.current = 0;
    visitedRef.current = [];
    setActive(false);
    setVisited([]);
    setFix(null);
    setRoute(null);
    setUpdate(null);
    setError(null);
    setStatus("idle");
  }, []);
  const preview = useCallback(
    async (fromGps: boolean) => {
      stop();
      useGps.current = fromGps;
      started.current = true;
      await request();
    },
    [request, stop],
  );
  const start = useCallback(async () => {
    stop();
    const ticket = generation.current;
    if (!options.current.serverUrl) {
      fail("server");
      return;
    }
    useGps.current = true;
    started.current = true;
    try {
      if (
        !(await connect()) ||
        ticket !== generation.current ||
        !mounted.current
      )
        return;
      setStatus("locating");
      const p = await readFix();
      if (ticket !== generation.current || !mounted.current) return;
      if (
        options.current.points.some(
          (place) => roadAreaForPlace(place) !== roadAreaAtPoint(p),
        )
      )
        throw new RouteFailure("requiresFlight");
      origin.current = p;
      currentFix.current = p;
      setFix(p);
      activeRef.current = true;
      setActive(true);
      await request(p);
    } catch (e) {
      if (ticket !== generation.current || !mounted.current) return;
      fail(
        e instanceof RouteFailure
          ? e.code
          : e instanceof Error &&
              ["permission", "services", "gps"].includes(e.message)
            ? (e.message as TripError)
            : "gps",
      );
    }
  }, [connect, fail, readFix, request, stop]);
  const key =
    points.map((p) => p.id).join("|") + ":" + roundTrip + ":" + serverUrl;
  const previousKey = useRef(key);
  useEffect(() => {
    if (previousKey.current === key) return;
    previousKey.current = key;
    const present = new Set(options.current.points.map((p) => p.id));
    visitedRef.current = visitedRef.current.filter((id) => present.has(id));
    setVisited([...visitedRef.current]);
    generation.current++;
    controller.current?.abort();
    pending.current = false;
    routeRef.current = null;
    setRoute(null);
    setUpdate(null);
    if (!started.current) return;
    if (!options.current.points.length) {
      stop();
      return;
    }
    const timer = setTimeout(
      () =>
        void requestRef.current(
          activeRef.current
            ? (currentFix.current ?? undefined)
            : useGps.current
              ? (previewOrigin.current ?? undefined)
              : undefined,
        ),
      1500,
    );
    return () => clearTimeout(timer);
  }, [key, stop]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      setForeground(state === "active");
      if (state !== "active") {
        generation.current++;
        controller.current?.abort();
        pending.current = false;
        if (activeRef.current) setStatus("paused");
      }
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (!active || !foreground) return;
    let cancelled = false,
      subscription: Location.LocationSubscription | undefined;
    void activateKeepAwakeAsync("territorio-vivo-navigation").catch(() => {});
    const onPosition = (p: Location.LocationObject) => {
      if (
        cancelled ||
        !activeRef.current ||
        Date.now() - p.timestamp > 30000 ||
        p.timestamp - Date.now() > 5000
      )
        return;
      const value: NavigationFix = {
        latitude: p.coords.latitude,
        longitude: p.coords.longitude,
        accuracy: p.coords.accuracy,
        timestamp: p.timestamp,
        heading: p.coords.heading,
        speed: p.coords.speed,
      };
      if (
        !Number.isFinite(value.latitude) ||
        !Number.isFinite(value.longitude) ||
        Math.abs(value.latitude) > 90 ||
        Math.abs(value.longitude) > 180
      )
        return;
      value.heading = travelHeading(
        lastReliable.current,
        value,
        value.heading ?? null,
        value.speed ?? null,
        currentFix.current?.heading ?? null,
      );
      currentFix.current = value;
      setFix(value);
      const current = routeRef.current;
      if (pending.current) return;
      if (!current) {
        if (Date.now() - lastRecalc.current >= 30000)
          void requestRef.current(value);
        return;
      }
      const advance = lastReliable.current
        ? Math.max(
            300,
            haversineDistanceKm(lastReliable.current, value) * 3000 +
              (value.accuracy ?? 100) * 2,
          )
        : 500;
      const next = navigationUpdate(
        current,
        lengthsRef.current,
        value,
        progress.current,
        advance,
      );
      if (next.reliable) {
        progress.current = next.projection.progressMeters;
        lastReliable.current = value;
      }
      setUpdate(next);
      setStatus("navigating");
      if (next.reliable && value.accuracy! <= 50) {
        const passed = targetIds.current.filter(
          (id, i) =>
            id !== "__return__" &&
            next.projection.progressMeters >=
              current.waypointMeters[i + 1] - 30 &&
            haversineDistanceKm(value, current.snappedWaypoints[i + 1]) *
              1000 <=
              40,
        );
        if (passed.some((id) => !visitedRef.current.includes(id))) {
          visitedRef.current = [...new Set([...visitedRef.current, ...passed])];
          setVisited([...visitedRef.current]);
        }
      }
      if (next.arrived) {
        activeRef.current = false;
        setActive(false);
        setStatus("arrived");
        origin.current = null;
        currentFix.current = null;
        lastReliable.current = null;
        return;
      }
      offRouteCount.current = next.offRoute ? offRouteCount.current + 1 : 0;
      if (
        offRouteCount.current >= 2 &&
        Date.now() - lastRecalc.current >= 30000
      )
        void requestRef.current(value);
    };
    void (async () => {
      const permission = await Location.getForegroundPermissionsAsync();
      if (cancelled) return;
      if (permission.status !== "granted") {
        fail("permission");
        return;
      }
      if (!(await Location.hasServicesEnabledAsync())) {
        fail("services");
        return;
      }
      if (cancelled) return;
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 3000,
        },
        onPosition,
      );
      if (cancelled) subscription.remove();
    })().catch(() => {
      if (!cancelled) fail("gps");
    });
    return () => {
      cancelled = true;
      subscription?.remove();
      void deactivateKeepAwake("territorio-vivo-navigation");
    };
  }, [active, foreground, fail]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current++;
      controller.current?.abort();
      origin.current = null;
      currentFix.current = null;
      routeRef.current = null;
    };
  }, []);
  return {
    status,
    error,
    route,
    fix,
    update,
    active,
    visited,
    preview,
    start,
    stop,
    recalculate: () => request(),
  };
}
