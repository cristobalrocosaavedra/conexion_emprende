import { messages as t } from "@territorio-vivo/i18n";
import { RoutePlanner } from "../../src/cliente/MiRuta";
import { ChileStrip } from "../../src/chile";
import { Shell } from "../../src/Shell";
import { allLite } from "../../src/territorio";

const s = t.sitio;
export const metadata = { title: s.routeTitle };
export default function MyRoute() {
  return (
    <Shell>
      <div className="contenido">
        <h1>{s.routeTitle}</h1>
        <RoutePlanner places={allLite()} chile={<ChileStrip />} />
      </div>
    </Shell>
  );
}
