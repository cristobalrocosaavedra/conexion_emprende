import { useEffect, useMemo, useRef } from "react";
import { Linking } from "react-native";
import { WebView } from "react-native-webview";
import { decodeMapSelection } from "@territorio-vivo/core";
import type {
  Place,
  RegionId,
  RoadRoute,
  NavigationFix,
} from "@territorio-vivo/core";
import { buildMapDocument } from "./map-document";
export interface NavigationMapState {
  route: RoadRoute | null;
  fix: NavigationFix | null;
  follow: boolean;
  publicService?: boolean;
}
export interface PlaceMapProps {
  navigation?: NavigationMapState;
  region: RegionId;
  points: Place[];
  trip?: boolean;
  roundTrip?: boolean;
  dark?: boolean;
  onPlace: (id: string) => void;
  onRegion?: (id: RegionId) => void;
}
export function PlaceMap({
  region,
  points,
  trip,
  roundTrip,
  dark,
  onPlace,
  onRegion,
  navigation,
}: PlaceMapProps) {
  const html = useMemo(
    () => buildMapDocument({ region, points, trip, roundTrip, dark }),
    [region, points, trip, roundTrip, dark],
  );
  const source = useMemo(() => ({ html }), [html]);
  const ref = useRef<WebView<object>>(null);
  const latest = useRef(navigation);
  latest.current = navigation;
  const sentRoute = useRef<RoadRoute | null | undefined>(undefined);
  const update = (force = false) => {
    const value = latest.current;
    const { route, ...rest } = value ?? { route: null };
    const payload = value
      ? { ...rest, ...(force || sentRoute.current !== route ? { route } : {}) }
      : null;
    sentRoute.current = route;
    ref.current?.injectJavaScript(
      `window.tvNavigation?.(${JSON.stringify(payload)});true;`,
    );
  };
  useEffect(() => update(), [navigation]);
  return (
    <WebView<object>
      ref={ref}
      onLoadEnd={() => update(true)}
      style={{ flex: 1, backgroundColor: dark ? "#102d42" : "#e1ede7" }}
      source={source}
      originWhitelist={["about:blank"]}
      applicationNameForUserAgent="TerritorioVivo/0.4"
      geolocationEnabled={false}
      allowFileAccess={false}
      mixedContentMode="never"
      javaScriptEnabled
      domStorageEnabled={false}
      setSupportMultipleWindows={false}
      onShouldStartLoadWithRequest={(request) => {
        if (
          request.url === "about:blank" ||
          request.url.startsWith("about:blank#")
        )
          return true;
        if (
          request.url.startsWith("https://www.openstreetmap.org/") ||
          request.url.startsWith("https://leafletjs.com/") ||
          request.url === "https://routing.openstreetmap.de/about.html"
        )
          void Linking.openURL(request.url);
        return false;
      }}
      onMessage={(event) => {
        const selected = decodeMapSelection(event.nativeEvent.data);
        if (selected?.type === "place") onPlace(selected.id);
        else if (selected?.type === "region")
          onRegion?.(selected.id as RegionId);
      }}
    />
  );
}
