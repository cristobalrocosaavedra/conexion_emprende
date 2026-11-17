import { messages as t } from "@territorio-vivo/i18n";
import { Shell } from "../../src/Shell";

const s = t.sitio;
export const metadata = { title: s.sourcesTitle };
export default function Sources() {
  return (
    <Shell>
      <div className="contenido texto-largo">
        <h1>{s.sourcesTitle}</h1>
        <p>{s.sourcesIntro}</p>
        <ul className="sellos">
          {s.seals.map((x) => (
            <li key={x.title}>
              <strong>{x.title}</strong>
              <p>{x.body}</p>
            </li>
          ))}
        </ul>
        <h2>{s.osmTitle}</h2>
        <p>
          {s.osmBody}{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            rel="noopener"
            target="_blank"
          >
            openstreetmap.org/copyright
          </a>
        </p>
        <h2>{s.illustrationsTitle}</h2>
        <p>{s.illustrationsBody}</p>
      </div>
    </Shell>
  );
}
