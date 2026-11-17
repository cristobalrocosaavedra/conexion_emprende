"use client";
import type { ReactNode } from "react";
import type { RegionId } from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
import { useFavorites, useStops } from "./almacen";
import { categoryLook } from "../categorias";
import { chileViewBox, isIsland, project } from "../proyeccion";
import { zoneOf } from "../zonas";
import type { PlaceLite } from "../territorio";

const s = t.sitio;
const island = (p: PlaceLite) =>
  p.commune === "isla-de-pascua" || (p.lon !== null && isIsland(p.lon));

export function RoutePlanner({
  places,
  chile,
}: {
  places: PlaceLite[];
  chile: ReactNode;
}) {
  const { stops, set, startIn } = useStops();
  const index = new Map(places.map((p) => [p.id, p]));
  const list = stops
    .map((id) => index.get(id))
    .filter((p): p is PlaceLite => !!p && p.onMap);
  const regions = new Set(list.map((p) => p.region));
  const unlocated = list.filter((p) => p.lat === null || p.lon === null);
  const move = (i: number, d: -1 | 1) => {
    const ids = list.map((p) => p.id);
    const j = i + d;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    set(ids);
  };
  return (
    <div className="ruta">
      <div className="ruta-cabeza">
        <p className="ruta-resumen">
          {list.length
            ? s.routeSummary(regions.size, list.length)
            : s.routeEmpty}
        </p>
        {list.length > 0 && (
          <div className="fila">
            {unlocated.length === 0 ? (
              <a
                className="boton boton-ruta"
                href="/explorar/"
                onClick={() => startIn(list[0].region)}
              >
                ▶ {s.startRoute}
              </a>
            ) : (
              <button
                type="button"
                className="boton boton-ruta"
                onClick={() =>
                  set(
                    list.filter((p) => !unlocated.includes(p)).map((p) => p.id),
                  )
                }
              >
                {s.removeUnlocated(unlocated.length)}
              </button>
            )}
            <button
              type="button"
              className="boton boton-borde"
              onClick={() => set([])}
            >
              {s.clearRoute}
            </button>
          </div>
        )}
      </div>
      {list.length > 0 && (
        <p
          className={unlocated.length ? "aviso" : "suave chico-texto"}
          role="status"
        >
          {unlocated.length
            ? s.unlocatedWarning(unlocated.map((p) => p.name).join(", "))
            : s.startRouteNote}
        </p>
      )}
      <div className="ruta-cuerpo">
        <ol className="paradas">
          {list.map((p, i) => {
            const prev = list[i - 1];
            const newRegion = !prev || prev.region !== p.region;
            const flight = prev && island(prev) !== island(p);
            return (
              <li key={p.id} className="parada-bloque">
                {flight && (
                  <div className="vuelo" role="note">
                    ✈ {s.flight} · <span className="suave">{s.flightNote}</span>
                  </div>
                )}
                {newRegion && (
                  <h3 className={`ruta-region zona-suave-${zoneOf(p.region)}`}>
                    {t.regions[p.region as RegionId]}
                  </h3>
                )}
                <div className="parada">
                  <span className={`numero zona-fondo-${zoneOf(p.region)}`}>
                    {i + 1}
                  </span>
                  <div className="parada-texto">
                    <a href={p.href}>
                      <strong>{p.name}</strong>
                    </a>
                    <span className="suave">
                      {t.categories[p.category]} · {p.communeName}
                      {(p.lat === null || p.lon === null) &&
                        ` · ${s.noLocationShort}`}
                    </span>
                  </div>
                  <div className="parada-acciones">
                    <button
                      type="button"
                      className="icono"
                      aria-label={`${s.moveUp}: ${p.name}`}
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="icono"
                      aria-label={`${s.moveDown}: ${p.name}`}
                      onClick={() => move(i, 1)}
                      disabled={i === list.length - 1}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="icono"
                      aria-label={`${s.remove}: ${p.name}`}
                      onClick={() =>
                        set(list.filter((x) => x.id !== p.id).map((x) => x.id))
                      }
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <figure className="ruta-mapa">
          <div className="capas">
            {chile}
            <svg
              viewBox={chileViewBox}
              className="chile capa"
              aria-hidden="true"
            >
              {list
                .filter((p) => p.lat !== null && p.lon !== null && !island(p))
                .map((p) => {
                  const [x, y] = project(p.lon!, p.lat!);
                  const n = list.indexOf(p) + 1;
                  return (
                    <g key={p.id}>
                      <circle cx={x} cy={y} r={13} className="marca" />
                      <text
                        x={x}
                        y={y + 6}
                        textAnchor="middle"
                        className="marca-num"
                      >
                        {n}
                      </text>
                    </g>
                  );
                })}
            </svg>
          </div>
          <figcaption className="suave chico-texto">
            {s.routeMapNote} {s.stored}
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

export function FavoritesList({ places }: { places: PlaceLite[] }) {
  const { favs, toggle } = useFavorites();
  const list = favs
    .map((id) => places.find((p) => p.id === id))
    .filter((p): p is PlaceLite => !!p);
  if (!list.length) return <p className="vacio">{s.favoritesEmpty}</p>;
  return (
    <ul className="grilla tarjetas">
      {list.map((p) => (
        <li key={p.id} className="tarjeta tarjeta-texto">
          <span
            className="punto"
            style={{ background: categoryLook[p.category].bg }}
            aria-hidden="true"
          />
          <a href={p.href}>
            <strong>{p.name}</strong>
          </a>
          <span className="suave">
            {t.categories[p.category]} · {p.communeName}
          </span>
          <button
            type="button"
            className="boton boton-borde chico"
            onClick={() => toggle(p.id)}
          >
            {s.favorited}
          </button>
        </li>
      ))}
    </ul>
  );
}
