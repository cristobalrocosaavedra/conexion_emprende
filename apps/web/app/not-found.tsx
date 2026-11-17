import { messages as t } from "@territorio-vivo/i18n";
import { SearchBox } from "../src/cliente/acciones";
import { Shell } from "../src/Shell";

const s = t.sitio;
export default function NotFound() {
  return (
    <Shell>
      <div className="contenido texto-largo">
        <h1>{s.notFoundTitle}</h1>
        <p>{s.notFoundBody}</p>
        <SearchBox big />
        <p>
          <a className="boton boton-principal" href="/">
            {s.backHome}
          </a>
        </p>
      </div>
    </Shell>
  );
}
