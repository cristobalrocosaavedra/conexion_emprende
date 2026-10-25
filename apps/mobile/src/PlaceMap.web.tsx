import { useEffect, useMemo, useRef } from "react";
import { decodeMapSelection } from "@territorio-vivo/core";
import type { RegionId } from "@territorio-vivo/core";
import type { PlaceMapProps } from "./PlaceMap";
import { buildMapDocument } from "./map-document";
import { messages as t } from "@territorio-vivo/i18n";
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
  const ref = useRef<HTMLIFrameElement>(null);
  const html = useMemo(
    () => buildMapDocument({ region, points, trip, roundTrip, dark }),
    [region, points, trip, roundTrip, dark],
  );
  const latest = useRef(navigation);
  latest.current = navigation;
  const update = () =>
    ref.current?.contentWindow?.postMessage(
      { type: "tv-navigation", value: latest.current ?? null },
      "*",
    );
  useEffect(update, [navigation]);
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.source !== ref.current?.contentWindow) return;
      const selected = decodeMapSelection(event.data);
      if (selected?.type === "place") onPlace(selected.id);
      else if (selected?.type === "region") onRegion?.(selected.id as RegionId);
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [onPlace, onRegion]);
  return (
    <iframe
      ref={ref}
      onLoad={update}
      title={t.interactiveMap}
      srcDoc={html}
      style={{ width: "100%", height: "100%", border: 0 }}
    />
  );
}
