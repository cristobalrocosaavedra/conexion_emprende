import { messages as t } from "@territorio-vivo/i18n";
import { Shell } from "../../src/Shell";
import {
  communesOfRegion,
  href,
  provincesOf,
  regionTitle,
  zoneArt,
  zoneRegions,
  zones,
} from "../../src/territorio";

const s = t.sitio;
export const metadata = { title: s.destinationsTitle };
export default function Destinations() {
  return (
    <Shell>
      <div className="contenido">
        <h1>{s.destinationsTitle}</h1>
        <p className="suave">{s.destinationsHint}</p>
        {zones.map((z) => (
          <section key={z} id={z} className="seccion">
            <div className={`zona-cabeza zona-${z}`}>
              <img src={`/arte/${zoneArt[z]}.webp`} alt="" loading="lazy" />
              <h2>{s.zones[z]}</h2>
              <span className="rotulo">{s.illustration}</span>
            </div>
            <ul className="grilla fichas-territorio">
              {zoneRegions[z].map((r) => (
                <li key={r}>
                  <a
                    href={href.region(r)}
                    className={`ficha-territorio borde-${z}`}
                  >
                    <strong>{regionTitle(r)}</strong>
                    <span className="suave">
                      {s.provinces}: {provincesOf(r).length} ·{" "}
                      {s.communesCount(communesOfRegion(r).length)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Shell>
  );
}
