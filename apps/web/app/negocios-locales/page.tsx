import { messages as t } from "@territorio-vivo/i18n";
import { Shell } from "../../src/Shell";
import { JoinBanner } from "../../src/TerritoryPage";
import {
  href,
  isBusiness,
  placesIn,
  regionTitle,
  regions,
} from "../../src/territorio";
import { PlaceCard } from "../../src/ui";

const s = t.sitio;
export const metadata = { title: s.businessTitle };
export default function Business() {
  return (
    <Shell>
      <div className="contenido">
        <h1>{s.businessTitle}</h1>
        <p className="suave">{s.businessNationalHint}</p>
        {regions.map((r) => {
          const list = placesIn({ level: "region", id: r }).filter(isBusiness);
          if (!list.length) return null;
          return (
            <section key={r} className="seccion">
              <h2>
                <a href={`${href.region(r)}/negocios`}>{regionTitle(r)}</a>
              </h2>
              <div className="grilla tarjetas">
                {list.slice(0, 6).map((p) => (
                  <PlaceCard key={p.id} place={p} />
                ))}
              </div>
              {list.length > 6 && (
                <a className="ver-mas" href={`${href.region(r)}/negocios`}>
                  {s.showMore(list.length - 6)} →
                </a>
              )}
            </section>
          );
        })}
        <JoinBanner />
      </div>
    </Shell>
  );
}
