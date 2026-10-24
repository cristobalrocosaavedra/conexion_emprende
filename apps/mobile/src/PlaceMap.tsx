import { useMemo } from "react";
import { Linking } from "react-native";
import { WebView } from "react-native-webview";
import { decodeMapSelection } from "@territorio-vivo/core";
import type { Place, RegionId } from "@territorio-vivo/core";
import { buildMapDocument } from "./map-document";
export interface PlaceMapProps {
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
}: PlaceMapProps) {
  const html = useMemo(
    () => buildMapDocument({ region, points, trip, roundTrip, dark }),
    [region, points, trip, roundTrip, dark],
  );
  return (
    <WebView
      style={{ flex: 1, backgroundColor: dark ? "#102d42" : "#e1ede7" }}
      source={{ html }}
      originWhitelist={["about:blank"]}
      applicationNameForUserAgent="TerritorioVivo/0.2"
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
