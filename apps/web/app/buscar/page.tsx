import { messages as t } from "@territorio-vivo/i18n";
import { SearchBox } from "../../src/cliente/acciones";
import { Shell } from "../../src/Shell";

const s = t.sitio;
export const metadata = { title: s.nav.search };
export default function Search() {
  return (
    <Shell>
      <div className="contenido texto-largo">
        <h1>{s.nav.search}</h1>
        <SearchBox big />
      </div>
    </Shell>
  );
}
