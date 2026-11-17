import { regionBounds } from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
import { AddAllButton, RememberRegion } from "./cliente/acciones";
import { TerritoryMap } from "./cliente/Mapa";
import {
  categoriesOrder,
  communeById,
  href,
  isBusiness,
  isLocated,
  lite,
  onMap,
  placeById,
  placesIn,
  provinceById,
  routesIn,
  territory,
  territoryArt,
  zoneOf,
} from "./territorio";
import type { Level } from "./territorio";
import {
  Crumbs,
  Hero,
  PlaceCard,
  RegionPager,
  Tabs,
  TerritoryList,
} from "./ui";

const s = t.sitio;
export type Tab = "todo" | "explore" | "business";
const PER_CATEGORY = 6;

export function JoinBanner() {
  return (
    <aside className="banda-negocio">
      <span className="banda-icono" aria-hidden="true">
        ▤
      </span>
      <p>{s.joinBanner}</p>
      <a href="/suma-tu-negocio" className="boton boton-principal">
        {s.seePlans}
      </a>
    </aside>
  );
}

export function TerritoryPage({
  level,
  id,
  tab,
}: {
  level: Level;
  id: string;
  tab: Tab;
}) {
  const ref = territory(level, id);
  const list = placesIn(ref);
  const zone = zoneOf(ref.region);
  const province =
    level === "province"
      ? id
      : level === "commune"
        ? communeById(id)!.province
        : undefined;
  const regionFull = s.regionTitle(t.regions[ref.region], ref.region);
  const subtitle =
    level === "region"
      ? t.regionStories[ref.region]
      : level === "province"
        ? regionFull
        : `${s.provinceTitle(provinceById(province!)!.name)} · ${regionFull}`;
  return (
    <>
      <RememberRegion region={ref.region} />
      <Hero
        title={ref.title}
        subtitle={subtitle}
        art={territoryArt(ref.region, level === "commune" ? id : undefined)}
        zone={zone}
        crumbs={
          <Crumbs
            region={ref.region}
            province={province}
            commune={level === "commune" ? id : undefined}
          />
        }
      />
      <div className="pestanas-fijas">
        <Tabs base={ref.basePath} current={tab} />
      </div>
      <div className="contenido">
        {tab === "todo" && <TodoTab level={level} id={id} />}
        {tab === "explore" && (
          <section className="seccion">
            <TerritoryMap
              key={ref.basePath}
              name={ref.title}
              points={list.filter(onMap).map(lite)}
              categories={categoriesOrder.filter((c) =>
                list.some((p) => onMap(p) && p.category === c),
              )}
              bounds={mapBounds(level, id, ref.region, list)}
            />
            {list.some((p) => onMap(p) && !isLocated(p)) && (
              <div className="sin-ubicacion">
                <p className="suave">
                  {s.noCoordinates(
                    list.filter((p) => onMap(p) && !isLocated(p)).length,
                  )}
                </p>
                <ul>
                  {list
                    .filter((p) => onMap(p) && !isLocated(p))
                    .map((p) => (
                      <li key={p.id}>
                        <a href={href.place(p)}>{p.name}</a>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </section>
        )}
        {tab === "business" && (
          <section className="seccion">
            <h2>{s.tabs.business}</h2>
            <p className="suave">{s.businessHint}</p>
            {list.filter(isBusiness).length ? (
              <div className="grilla tarjetas">
                {list.filter(isBusiness).map((p) => (
                  <PlaceCard
                    key={p.id}
                    place={p}
                    hideCommune={level === "commune"}
                  />
                ))}
              </div>
            ) : (
              <p className="vacio">{s.businessEmpty}</p>
            )}
          </section>
        )}
        <JoinBanner />
        {level === "region" && <RegionPager region={ref.region} />}
      </div>
    </>
  );
}

function mapBounds(
  level: Level,
  id: string,
  region: Parameters<typeof regionBounds>[0],
  list: ReturnType<typeof placesIn>,
): [[number, number], [number, number]] {
  const located = list.filter(isLocated);
  if (level !== "region" && located.length) {
    const lons = located.map((p) => p.longitude!);
    const lats = located.map((p) => p.latitude!);
    const pad = 0.03;
    return [
      [Math.min(...lons) - pad, Math.min(...lats) - pad],
      [Math.max(...lons) + pad, Math.max(...lats) + pad],
    ];
  }
  void id;
  const [[w, so], [e, n]] = regionBounds(region);
  return [
    [w, so],
    [e, n],
  ];
}

function TodoTab({ level, id }: { level: Level; id: string }) {
  const ref = territory(level, id);
  const list = placesIn(ref);
  const routes = routesIn(list);
  const base = ref.basePath;
  return (
    <>
      <TerritoryList territory={ref} />
      {level === "region" && id === "valparaiso" && (
        <aside className="isla">
          <img src="/arte/rapa-nui.webp" alt="" />
          <div>
            <h2>{s.rapaNuiTitle}</h2>
            <p>{s.rapaNuiBody}</p>
            <a
              className="boton boton-borde"
              href={href.commune("isla-de-pascua")}
            >
              {s.seeCommune} →
            </a>
          </div>
        </aside>
      )}
      {routes.length > 0 && (
        <section className="seccion">
          <h2>{s.dayRoutes}</h2>
          <p className="suave">{s.dayRoutesHint}</p>
          <div className="grilla tarjetas">
            {routes.map((r) => {
              const stops = r.stopIds.map(placeById).filter((p) => !!p);
              return (
                <article key={r.id} className="tarjeta tarjeta-ruta">
                  <div className="tarjeta-cuerpo">
                    <span className="sello sello-pending">
                      {t.verification.pending}
                    </span>
                    <h3>{r.name}</h3>
                    <p className="chico-texto">{r.description}</p>
                    <p className="suave chico-texto">
                      {s.stops(stops.length)} ·{" "}
                      {stops.map((p) => p!.name).join(" → ")}
                    </p>
                    <p className="suave chico-texto">
                      <a href={r.source.url} rel="noopener" target="_blank">
                        {r.source.label}
                      </a>
                    </p>
                    <AddAllButton ids={r.stopIds} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
      <section className="seccion">
        <h2>{s.panoramas}</h2>
        <p className="suave">{s.panoramasHint}</p>
        {list.length === 0 && <p className="vacio">{s.emptyTodo}</p>}
        {categoriesOrder.map((c) => {
          const items = list.filter((p) => p.category === c);
          if (!items.length) return null;
          return (
            <div key={c} className="categoria">
              <h3>
                {t.categories[c]}{" "}
                <span className="suave">({items.length})</span>
              </h3>
              <div className="grilla tarjetas">
                {items.slice(0, PER_CATEGORY).map((p) => (
                  <PlaceCard
                    key={p.id}
                    place={p}
                    hideCommune={level === "commune"}
                  />
                ))}
              </div>
              {items.length > PER_CATEGORY && (
                <a className="ver-mas" href={`${base}/explorar`}>
                  {s.showMore(items.length - PER_CATEGORY)} →
                </a>
              )}
            </div>
          );
        })}
      </section>
    </>
  );
}
