"use client";
import { useEffect, useRef, useState } from "react";
import type { Category } from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { useStops } from "./almacen";
import type { PlaceLite } from "../territorio";
import { categoryLook } from "../categorias";

const s = t.sitio;
/** Mapa del territorio con íconos por categoría. Leaflet se carga solo en el navegador. */
export function TerritoryMap({
  points,
  bounds,
  name,
  categories,
}: {
  points: PlaceLite[];
  bounds: [[number, number], [number, number]];
  name: string;
  categories: Category[];
}) {
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Category[]>(categories);
  const [ready, setReady] = useState(false);
  const { stops, toggle } = useStops();
  const toggleRef = useRef(toggle);
  const stopsRef = useRef(stops);
  toggleRef.current = toggle;
  stopsRef.current = stops;
  const mapRef = useRef<{
    map: Leaflet.Map;
    layer: Leaflet.LayerGroup;
    L: typeof Leaflet;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("leaflet").then((L) => {
      if (cancelled || !box.current) return;
      const map = L.map(box.current, { scrollWheelZoom: false });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "© OpenStreetMap",
      }).addTo(map);
      const [[w, so], [e, n]] = bounds;
      map.fitBounds(
        [
          [so, w],
          [n, e],
        ],
        { padding: [16, 16] },
      );
      mapRef.current = { map, layer: L.layerGroup().addTo(map), L };
      setReady(true);
    });
    return () => {
      cancelled = true;
      mapRef.current?.map.remove();
      mapRef.current = null;
    };
  }, [bounds]);

  useEffect(() => {
    const current = mapRef.current;
    if (!current) return;
    const { L, layer, map } = current;
    layer.clearLayers();
    const shown = points.filter(
      (p) => active.includes(p.category) && p.lat !== null && p.lon !== null,
    );
    for (const p of shown) {
      const look = categoryLook[p.category];
      const marker = L.marker([p.lat!, p.lon!], {
        title: p.name,
        alt: p.name,
        icon: L.divIcon({
          className: "",
          html: `<div class="pin-mapa" style="background:${look.bg}"><svg viewBox="0 0 24 24" stroke="${look.ink}">${look.icon}</svg></div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
          popupAnchor: [0, -16],
        }),
      }).addTo(layer);
      marker.bindPopup(() => {
        const box = document.createElement("div");
        box.className = "globo";
        const title = document.createElement("strong");
        title.textContent = p.name;
        const meta = document.createElement("span");
        meta.textContent = `${t.categories[p.category]} · ${t.verification[p.verification]}`;
        const link = document.createElement("a");
        link.href = p.href;
        link.textContent = s.seeCard;
        const add = document.createElement("button");
        add.type = "button";
        add.textContent = stopsRef.current.includes(p.id)
          ? s.inRoute
          : s.addToRoute;
        add.onclick = () => {
          toggleRef.current(p.id);
          add.textContent = stopsRef.current.includes(p.id)
            ? s.addToRoute
            : s.inRoute;
        };
        box.append(title, meta, link, add);
        return box;
      });
    }
    if (shown.length > 1)
      map.fitBounds(
        L.latLngBounds(shown.map((p) => [p.lat!, p.lon!] as [number, number])),
        { padding: [30, 30], maxZoom: 14 },
      );
    else if (shown.length === 1)
      map.setView([shown[0].lat!, shown[0].lon!], 14);
  }, [points, active, ready]);

  return (
    <div className="mapa-territorio">
      <div className="filtros" role="group" aria-label={s.mapFilters}>
        {categories.map((c) => {
          const on = active.includes(c);
          const count = points.filter((p) => p.category === c).length;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={on}
              className={`filtro${on ? " activo" : ""}`}
              onClick={() =>
                setActive(on ? active.filter((x) => x !== c) : [...active, c])
              }
            >
              <span
                className="punto"
                style={{ background: categoryLook[c].bg }}
                aria-hidden="true"
              />
              {t.categories[c]} ({count})
            </button>
          );
        })}
      </div>
      {!ready && <p className="suave mapa-cargando">{s.mapLoading}</p>}
      <div
        ref={box}
        className="mapa"
        role="region"
        aria-label={s.mapLabel(name)}
      />
      <p className="suave chico-texto">{s.mapHint}</p>
    </div>
  );
}
