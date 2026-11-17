import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { messages as t } from "@territorio-vivo/i18n";
import {
  FavoriteButton,
  RememberRegion,
  RouteButton,
  ShareButton,
} from "../../../src/cliente/acciones";
import { categoryLook } from "../../../src/categorias";
import { Shell } from "../../../src/Shell";
import {
  communeById,
  evidenceOf,
  href,
  isLocated,
  nearby,
  placeArt,
  placeBySlug,
  placeSlug,
  places,
  regionName,
} from "../../../src/territorio";
import { Badge, Crumbs, Featured } from "../../../src/ui";
import { JoinBanner } from "../../../src/TerritoryPage";

const s = t.sitio;
type Params = { params: Promise<{ comuna: string; lugar: string }> };
export const dynamicParams = false;
export const generateStaticParams = () =>
  places.map((p) => ({ comuna: p.commune, lugar: placeSlug(p) }));
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { comuna, lugar } = await params;
  const place = placeBySlug(comuna, lugar);
  return place
    ? {
        title: `${place.name} · ${communeById(comuna)?.name ?? comuna}`,
        description: place.summary || s.metaDescription,
      }
    : {};
}

export default async function PlacePage({ params }: Params) {
  const { comuna, lugar } = await params;
  const place = placeBySlug(comuna, lugar);
  if (!place) notFound();
  const commune = communeById(place.commune);
  const art = placeArt(place);
  const evidence = evidenceOf(place);
  const near = nearby(place);
  const look = categoryLook[place.category];
  const osm = place.origin === "osm";
  const text = place.description || place.summary;
  return (
    <Shell here={`${commune?.name ?? comuna} · ${regionName(place.region)}`}>
      <RememberRegion region={place.region} />
      <div className="contenido ficha">
        <Crumbs
          region={place.region}
          province={place.province}
          commune={place.commune}
          last={place.name}
        />
        <div className="ficha-grilla">
          <div className="ficha-principal">
            <figure
              className={`ficha-arte${art.fit === "contain" ? " contener" : ""}`}
            >
              <img src={art.src} alt={art.fit === "contain" ? art.label : ""} />
              {art.fit === "cover" && (
                <span className="rotulo">{s.illustration}</span>
              )}
              <figcaption className="oculto">{art.label}</figcaption>
            </figure>
            <div className="ficha-texto">
              <p className="suave">
                <span
                  className="punto"
                  style={{ background: look.bg }}
                  aria-hidden="true"
                />
                {t.categories[place.category]}
              </p>
              <h1>{place.name}</h1>
              <span className="fila">
                <Badge status={place.verification} />
                {place.plan === "destacado" && <Featured />}
              </span>
              {place.plan === "destacado" && (
                <p className="suave chico-texto">{s.featuredNote}</p>
              )}
              {evidence && (
                <p className="suave chico-texto">
                  {evidence.method} · {t.reviewedOn}{" "}
                  {evidence.checkedOn.split("-").reverse().join("-")}
                </p>
              )}
              <h2 className="oculto">{s.about}</h2>
              <p className="ficha-descripcion">{text || s.aboutEmpty}</p>
              <div className="fila">
                <FavoriteButton id={place.id} />
                <ShareButton />
              </div>
            </div>
          </div>
          <aside className="ficha-lateral">
            <div className="caja-llegar">
              <h2>{s.howToGet}</h2>
              {isLocated(place) ? (
                <>
                  <div className="fila">
                    <a
                      className="boton boton-oscuro"
                      href={href.explore(place.commune)}
                    >
                      🚶 {s.walk}
                    </a>
                    <a
                      className="boton boton-oscuro"
                      href={href.explore(place.commune)}
                    >
                      🚗 {s.car}
                    </a>
                  </div>
                  <p className="chico-texto">{s.howToGetNote}</p>
                </>
              ) : place.onMap === false ? (
                <>
                  <p className="chico-texto">{s.notOnMap}</p>
                  <a className="boton boton-oscuro" href="/suma-tu-negocio">
                    {s.notOnMapOwner} →
                  </a>
                </>
              ) : (
                <p className="chico-texto">{s.noCoords}</p>
              )}
            </div>
            {place.onMap !== false && <RouteButton id={place.id} />}
            {near.length > 0 && (
              <section className="cerca">
                <h2>{s.nearby}</h2>
                <ul>
                  {near.map(({ place: p, km }) => (
                    <li key={p.id}>
                      <a href={href.place(p)}>
                        <span
                          className="punto"
                          style={{ background: categoryLook[p.category].bg }}
                          aria-hidden="true"
                        />
                        <strong>{p.name}</strong>
                        <span className="suave">{s.km(km)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
        <section className="fuente">
          <h2>{s.sourceTitle}</h2>
          <div>
            {evidence ? (
              <p>
                {t.verification[evidence.status]} · {evidence.organism} ·{" "}
                <a href={evidence.evidenceUrl} rel="noopener" target="_blank">
                  {t.verificationEvidence}
                </a>
              </p>
            ) : null}
            {place.source ? (
              <p>
                <a href={place.source.url} rel="noopener" target="_blank">
                  {place.source.label}
                </a>
                {osm && <span className="suave"> · {s.osmNote}</span>}
              </p>
            ) : (
              <p className="suave">{s.sourceNone}</p>
            )}
          </div>
          <a className="boton boton-borde" href="/suma-tu-negocio#contacto">
            {s.reportError} →
          </a>
        </section>
        <JoinBanner />
      </div>
    </Shell>
  );
}
