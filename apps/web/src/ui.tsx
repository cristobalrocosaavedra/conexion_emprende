import type { ReactNode } from "react";
import type { Place, RegionId } from "@territorio-vivo/core";
import { neighbor } from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
import {
  RegionPicker,
  RouteButton,
  RouteCount,
  SearchBox,
} from "./cliente/acciones";
import { categoryLook } from "./categorias";
import { ChileStrip, regionCenter } from "./chile";
import {
  communeById,
  communesOf,
  evidenceOf,
  href,
  isLocated,
  placeArt,
  provinceById,
  provincesOf,
  regionName,
  regions,
  zoneOf,
} from "./territorio";
import type { TerritoryRef } from "./territorio";

const s = t.sitio;

export function Logo({ small }: { small?: boolean }) {
  return (
    <a href="/" className={`logo${small ? " chico" : ""}`}>
      <img
        src="/arte/turismo-en-tu-mano-icono.webp"
        alt=""
        width={44}
        height={44}
      />
      <span>
        <b>Turismo</b>
        <em>en tu Mano</em>
      </span>
    </a>
  );
}

export function SiteHeader({ here }: { here?: string }) {
  return (
    <header className="cabecera">
      <div className="cabecera-fila">
        <Logo />
        <nav aria-label={s.nav.main} className="menu">
          <a href="/">{s.nav.home}</a>
          <a href="/destinos">{s.nav.destinations}</a>
          <a href="/panoramas">{s.nav.panoramas}</a>
          <a href="/negocios-locales">{s.nav.business}</a>
          <a href="/mi-ruta" className="menu-ruta">
            {s.nav.route} <RouteCount />
          </a>
          <a href="/favoritos">{s.nav.favorites}</a>
        </nav>
        <a href="/suma-tu-negocio" className="boton boton-ocre cabecera-cta">
          {s.nav.join}
        </a>
        <a href="/buscar" className="cabecera-buscar" aria-label={s.nav.search}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m15.5 15.5 5 5" />
          </svg>
        </a>
      </div>
      <div className="cabecera-barra">
        <RegionPicker here={here} />
        <SearchBox />
      </div>
    </header>
  );
}

export function BottomNav() {
  return (
    <nav aria-label={s.nav.mobile} className="nav-movil">
      <a href="/">
        <span aria-hidden="true">⌂</span>
        {s.nav.home}
      </a>
      <a href="/destinos">
        <span aria-hidden="true">◎</span>
        {s.nav.destinations}
      </a>
      <a href="/mi-ruta" className="nav-movil-ruta">
        <span aria-hidden="true">⤳</span>
        {s.nav.route}
        <RouteCount />
      </a>
      <a href="/favoritos">
        <span aria-hidden="true">♡</span>
        {s.nav.favorites}
      </a>
      <a href="/negocios-locales">
        <span aria-hidden="true">▤</span>
        {s.nav.business}
      </a>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="pie">
      <Logo small />
      <nav className="pie-enlaces" aria-label={s.footerSources}>
        <a href="/destinos">{s.nav.destinations}</a>
        <a href="/suma-tu-negocio">{s.nav.join}</a>
        <a href="/municipios">{s.footerMunicipal}</a>
        <a href="/fuentes">{s.footerSources}</a>
        <a href="/terminos">{t.commercial.termsLink}</a>
        <a href="/privacidad">{t.commercial.privacyLink}</a>
      </nav>
      <p>
        {s.footerTeam} · {s.footerTest}
      </p>
      <p className="chico-texto">{s.footerOsm}</p>
    </footer>
  );
}

export function Featured() {
  return (
    <span className="sello sello-destacado" title={s.featuredNote}>
      ★ {s.featured}
    </span>
  );
}
export function Badge({ status }: { status: Place["verification"] }) {
  return (
    <span className={`sello sello-${status}`}>{t.verification[status]}</span>
  );
}

/** Migas con selector de vecinos en cada nivel (sin JavaScript). */
export function Crumbs({
  region,
  province,
  commune,
  last,
}: {
  region: RegionId;
  province?: string;
  commune?: string;
  last?: string;
}) {
  const Pick = ({
    label,
    current,
    items,
  }: {
    label: string;
    current: string;
    items: { id: string; name: string; href: string }[];
  }) => (
    <details className="migas-selector">
      <summary>
        {label} <span aria-hidden="true">▾</span>
      </summary>
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={i.href}
              aria-current={i.id === current ? "page" : undefined}
            >
              {i.name}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
  const p = province ? provinceById(province) : undefined;
  const c = commune ? communeById(commune) : undefined;
  return (
    <nav className="migas" aria-label="Migas">
      <a href="/">{s.nav.home}</a>
      <span aria-hidden="true">›</span>
      <Pick
        label={regionName(region)}
        current={region}
        items={regions.map((r) => ({
          id: r,
          name: regionName(r),
          href: href.region(r),
        }))}
      />
      {p && (
        <>
          <span aria-hidden="true">›</span>
          <Pick
            label={s.provinceTitle(p.name)}
            current={p.id}
            items={provincesOf(region).map((x) => ({
              id: x.id,
              name: s.provinceTitle(x.name),
              href: href.province(x.id),
            }))}
          />
        </>
      )}
      {c && (
        <>
          <span aria-hidden="true">›</span>
          <Pick
            label={c.name}
            current={c.id}
            items={communesOf(c.province).map((x) => ({
              id: x.id,
              name: x.name,
              href: href.commune(x.id),
            }))}
          />
        </>
      )}
      {last && (
        <>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{last}</span>
        </>
      )}
    </nav>
  );
}

export function Hero({
  title,
  subtitle,
  art,
  crumbs,
  zone,
}: {
  title: string;
  subtitle?: string;
  art: { src: string; label: string };
  crumbs?: ReactNode;
  zone: string;
}) {
  return (
    <section className={`portada zona-${zone}`}>
      <img className="portada-arte" src={art.src} alt="" />
      <span className="rotulo" title={art.label}>
        {s.illustration}
      </span>
      <div className="portada-texto">
        {crumbs}
        <h1>{title}</h1>
        {subtitle && <p className="portada-bajada">{subtitle}</p>}
      </div>
    </section>
  );
}

export function Tabs({
  base,
  current,
}: {
  base: string;
  current: "todo" | "explore" | "business";
}) {
  const items = [
    { k: "todo", h: base, label: s.tabs.todo, icon: "◎" },
    { k: "explore", h: `${base}/explorar`, label: s.tabs.explore, icon: "▦" },
    { k: "business", h: `${base}/negocios`, label: s.tabs.business, icon: "▤" },
  ] as const;
  return (
    <nav className="pestanas" aria-label={s.tabsLabel}>
      {items.map((i) => (
        <a
          key={i.k}
          href={i.h}
          aria-current={i.k === current ? "page" : undefined}
        >
          <span aria-hidden="true">{i.icon}</span> {i.label}
        </a>
      ))}
    </nav>
  );
}

export function PlaceCard({
  place,
  hideCommune,
}: {
  place: Place;
  hideCommune?: boolean;
}) {
  const art = placeArt(place);
  const look = categoryLook[place.category];
  const evidence = evidenceOf(place);
  return (
    <article className="tarjeta">
      <a
        href={href.place(place)}
        className="tarjeta-arte"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={art.src}
          alt=""
          className={art.fit === "contain" ? "contener" : ""}
          loading="lazy"
        />
      </a>
      <div className="tarjeta-cuerpo">
        <span className="fila">
          <Badge status={place.verification} />
          {place.plan === "destacado" && <Featured />}
        </span>
        <h3>
          <a href={href.place(place)}>{place.name}</a>
        </h3>
        <p className="suave chico-texto">
          <span
            className="punto"
            style={{ background: look.bg }}
            aria-hidden="true"
          />
          {t.categories[place.category]}
          {!hideCommune &&
            ` · ${communeById(place.commune)?.name ?? place.commune}`}
          {evidence && ` · ${evidence.organism}`}
        </p>
        {isLocated(place) && <RouteButton id={place.id} small />}
      </div>
    </article>
  );
}

export function RegionPager({ region }: { region: RegionId }) {
  const north = neighbor(region, "north");
  const south = neighbor(region, "south");
  const [x, y] = regionCenter(region);
  return (
    <nav className="paginador" aria-label={s.regionPager}>
      {north ? (
        <a href={href.region(north)} rel="prev">
          {s.northTo(regionName(north))}
        </a>
      ) : (
        <span className="suave">{s.countryStart}</span>
      )}
      <div className="paginador-mapa" aria-hidden="true">
        <ChileStrip active={region} className="chile mini">
          <circle cx={x} cy={y} r={14} className="aqui" />
        </ChileStrip>
        <span className={`etiqueta zona-fondo-${zoneOf(region)}`}>
          {regionName(region)}
        </span>
      </div>
      {south ? (
        <a href={href.region(south)} rel="next">
          {s.southTo(regionName(south))}
        </a>
      ) : (
        <span className="suave">{s.countryEnd}</span>
      )}
    </nav>
  );
}

export function TerritoryList({ territory }: { territory: TerritoryRef }) {
  if (territory.level === "region") {
    const list = provincesOf(territory.region);
    return (
      <section className="seccion">
        <h2>{s.provinces}</h2>
        <ul className="grilla fichas-territorio">
          {list.map((p) => (
            <li key={p.id}>
              <a href={href.province(p.id)} className="ficha-territorio">
                <strong>{s.provinceTitle(p.name)}</strong>
                <span className="suave">
                  {s.communesCount(communesOf(p.id).length)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  if (territory.level === "province") {
    const list = communesOf(territory.id);
    return (
      <section className="seccion">
        <h2>{s.communes}</h2>
        <ul className="grilla fichas-territorio">
          {list.map((c) => (
            <li key={c.id}>
              <a href={href.commune(c.id)} className="ficha-territorio">
                <strong>{c.name}</strong>
              </a>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  return null;
}
