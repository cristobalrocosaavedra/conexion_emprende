import { messages as t } from "@territorio-vivo/i18n";
import {
  LocateButton,
  SearchBox,
  YourRegionLink,
} from "../src/cliente/acciones";
import { ChileStrip } from "../src/chile";
import { Shell } from "../src/Shell";
import { JoinBanner } from "../src/TerritoryPage";
import {
  isBusiness,
  places,
  regionName,
  zoneArt,
  zoneRegions,
  zones,
} from "../src/territorio";
import { PlaceCard } from "../src/ui";

const s = t.sitio;
export default function Home() {
  const founders = places.filter(
    (p) => isBusiness(p) && p.verification === "verified",
  );
  return (
    <Shell>
      <section className="inicio-portada">
        <div className="inicio-texto">
          <h1>{s.heroTitle}</h1>
          <p className="portada-bajada">{s.heroSubtitle}</p>
          <SearchBox big />
          <LocateButton prominent />
        </div>
        <div className="inicio-franja">
          <ul className="bandas" aria-hidden="true">
            {zones.map((z) => (
              <li key={z} className={`banda zona-${z}`}>
                <img src={`/arte/${zoneArt[z]}.webp`} alt="" />
              </li>
            ))}
          </ul>
          <ChileStrip links className="chile franja" />
          <span className="rotulo">{s.illustration}</span>
        </div>
      </section>
      <div className="contenido">
        <section className="seccion">
          <h2>{s.zonesTitle}</h2>
          <div className="zonas">
            {zones.map((z) => (
              <a
                key={z}
                href={`/destinos#${z}`}
                className={`zona-tarjeta zona-${z}`}
              >
                <img src={`/arte/${zoneArt[z]}.webp`} alt="" loading="lazy" />
                <span className="zona-nombre">{s.zones[z]}</span>
                <span className="zona-detalle">
                  {s.regionCount(zoneRegions[z].length)} ·{" "}
                  {zoneRegions[z].map(regionName).join(", ")}
                </span>
              </a>
            ))}
          </div>
        </section>
        <section className="seccion">
          <h2>{s.yourRegion}</h2>
          <YourRegionLink />
        </section>
        <section className="seccion">
          <h2>{s.founders}</h2>
          <p className="suave">{s.foundersHint}</p>
          <div className="grilla tarjetas">
            {founders.map((p) => (
              <PlaceCard key={p.id} place={p} />
            ))}
          </div>
        </section>
        <JoinBanner />
      </div>
    </Shell>
  );
}
