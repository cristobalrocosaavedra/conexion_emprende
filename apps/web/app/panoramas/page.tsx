import { messages as t } from "@territorio-vivo/i18n";
import { Shell } from "../../src/Shell";
import {
  href,
  placesIn,
  regionTitle,
  zoneRegions,
  zones,
} from "../../src/territorio";

const s = t.sitio;
export const metadata = { title: s.panoramasTitle };
export default function Panoramas() {
  return (
    <Shell>
      <div className="contenido">
        <h1>{s.panoramasTitle}</h1>
        <p className="suave">{s.panoramasNationalHint}</p>
        {zones.map((z) => (
          <section key={z} className="seccion">
            <h2>{s.zones[z]}</h2>
            <ul className="grilla fichas-territorio">
              {zoneRegions[z].map((r) => (
                <li key={r}>
                  <a
                    href={href.region(r)}
                    className={`ficha-territorio borde-${z}`}
                  >
                    <strong>{regionTitle(r)}</strong>
                    <span className="suave">
                      {s.placesCount(
                        placesIn({ level: "region", id: r }).length,
                      )}
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
