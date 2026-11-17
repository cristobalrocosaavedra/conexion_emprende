import { messages as t } from "@territorio-vivo/i18n";
import { FavoritesList } from "../../src/cliente/MiRuta";
import { Shell } from "../../src/Shell";
import { allLite } from "../../src/territorio";

const s = t.sitio;
export const metadata = { title: s.favoritesTitle };
export default function Favorites() {
  return (
    <Shell>
      <div className="contenido">
        <h1>{s.favoritesTitle}</h1>
        <p className="suave">{s.favoritesStored}</p>
        <FavoritesList places={allLite()} />
      </div>
    </Shell>
  );
}
