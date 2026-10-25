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
  const update = () =>
    ref.current?.injectJavaScript(
      `window.tvNavigation?.(${JSON.stringify(latest.current ?? null)});true;`,
    );
  useEffect(update, [navigation]);
  return (
    <WebView<object>
      ref={ref}
      onLoadEnd={update}
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
          request.url.startsWith("https://leafletjs.com/")
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
