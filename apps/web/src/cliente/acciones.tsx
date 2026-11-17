"use client";
import { useEffect, useRef, useState } from "react";
import type { RegionId } from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";
import { useFavorites, useRegion, useStops } from "./almacen";
import { regionOrder, zoneOf, zoneRegions, zones } from "../zonas";

const s = t.sitio;

export function RouteButton({ id, small }: { id: string; small?: boolean }) {
  const { stops, toggle } = useStops();
  const on = stops.includes(id);
  return (
    <button
      type="button"
      className={`boton ${on ? "boton-hecho" : "boton-ruta"}${small ? " chico" : ""}`}
      aria-pressed={on}
      onClick={() => toggle(id)}
    >
      {on ? s.inRoute : s.addToRoute}
    </button>
  );
}
export function AddAllButton({ ids }: { ids: string[] }) {
  const { stops, addAll } = useStops();
  const done = ids.length > 0 && ids.every((id) => stops.includes(id));
  return (
    <button
      type="button"
      className={`boton chico ${done ? "boton-hecho" : "boton-ruta"}`}
      onClick={() => addAll(ids)}
      disabled={done}
    >
      {done ? s.allAdded : s.addAllToRoute}
    </button>
  );
}
export function FavoriteButton({ id }: { id: string }) {
  const { favs, toggle } = useFavorites();
  const on = favs.includes(id);
  return (
    <button
      type="button"
      className="boton boton-borde"
      aria-pressed={on}
      onClick={() => toggle(id)}
    >
      {on ? s.favorited : s.favorite}
    </button>
  );
}
export function RouteCount() {
  const { stops } = useStops();
  return stops.length ? <span className="contador">{stops.length}</span> : null;
}
/** Al visitar un territorio, queda como región elegida (no es ubicación). */
export function RememberRegion({ region }: { region: RegionId }) {
  const [current, setRegion] = useRegion();
  useEffect(() => {
    if (current !== region) setRegion(region);
    // Solo al abrir la página: no depende de la región guardada.
  }, [region]);
  return null;
}

export function RegionPicker({ here }: { here?: string }) {
  const [region] = useRegion();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  const label =
    here ?? (region ? t.regionShortNames[region as RegionId] : s.chooseRegion);
  return (
    <>
      <button
        type="button"
        className="estas-en"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span className="pin" aria-hidden="true" />
        <span className="estas-en-texto">{s.youAreIn}</span>
        <strong>{label}</strong>
        <span aria-hidden="true">▾</span>
      </button>
      <dialog
        ref={dialog}
        className="selector"
        onClose={() => setOpen(false)}
        aria-label={s.chooseRegion}
      >
        <div className="selector-cabeza">
          <div>
            <h2>{s.chooseRegion}</h2>
            <p className="suave">{s.chooseRegionHint}</p>
          </div>
          <button
            type="button"
            className="boton boton-borde chico"
            onClick={() => setOpen(false)}
          >
            {s.close}
          </button>
        </div>
        <LocateButton />
        {zones.map((z) => (
          <section key={z} className={`selector-zona zona-borde-${z}`}>
            <h3>{s.zones[z]}</h3>
            <ul>
              {zoneRegions[z].map((r) => (
                <li key={r}>
                  <a
                    href={`/region/${r}`}
                    aria-current={r === region ? "true" : undefined}
                  >
                    {t.regionShortNames[r]}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </dialog>
    </>
  );
}

/** Pide la ubicación una vez, resuelve la región en el navegador y no guarda coordenadas. */
export function LocateButton({ prominent }: { prominent?: boolean }) {
  const [state, setState] = useState<"idle" | "busy" | "denied" | "failed">(
    "idle",
  );
  const [, setRegion] = useRegion();
  async function locate() {
    setState("busy");
    const core = await import("@territorio-vivo/core");
    const adapter = core.createBrowserLocationAdapter(
      globalThis.navigator?.geolocation,
      globalThis.navigator?.permissions,
    );
    const result = await core.readDeviceLocation(
      adapter,
      "manual",
      core.communeNames,
    );
    if (result.status === "ready") {
      setRegion(result.area.region);
      window.location.href = result.area.commune
        ? `/${result.area.commune}`
        : `/region/${result.area.region}`;
    } else setState(result.status === "denied" ? "denied" : "failed");
  }
  return (
    <div className="ubicar">
      <button
        type="button"
        className={`boton ${prominent ? "boton-principal" : "boton-borde"}`}
        onClick={locate}
        disabled={state === "busy"}
      >
        <span className="pin" aria-hidden="true" />{" "}
        {state === "busy" ? s.locating : s.useLocation}
      </button>
      <p className="suave chico-texto" role="status">
        {state === "denied"
          ? s.locationDenied
          : state === "failed"
            ? s.locationFailed
            : s.locationNote}
      </p>
    </div>
  );
}

interface Entry {
  k: "region" | "province" | "commune" | "place";
  n: string;
  d: string;
  h: string;
  a?: string;
}
const normalize = (v: string) =>
  v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export function SearchBox({ big }: { big?: boolean }) {
  const [index, setIndex] = useState<Entry[] | null>(null);
  const [query, setQuery] = useState("");
  const load = () => {
    if (index) return;
    fetch("/indice.json")
      .then((r) => r.json())
      .then((data: Entry[]) => setIndex(data))
      .catch(() => setIndex([]));
  };
  const q = normalize(query.trim());
  const results =
    index && q.length >= 2
      ? index
          .filter((e) => normalize(`${e.n} ${e.a ?? ""}`).includes(q))
          .sort(
            (a, b) =>
              Number(!normalize(a.n).startsWith(q)) -
                Number(!normalize(b.n).startsWith(q)) ||
              ["region", "province", "commune", "place"].indexOf(a.k) -
                ["region", "province", "commune", "place"].indexOf(b.k),
          )
          .slice(0, 8)
      : [];
  return (
    <div className={`buscador${big ? " grande" : ""}`} role="search">
      <label className="oculto" htmlFor={big ? "buscar-grande" : "buscar"}>
        {s.searchLabel}
      </label>
      <input
        id={big ? "buscar-grande" : "buscar"}
        type="search"
        placeholder={s.searchPlaceholder}
        value={query}
        onFocus={load}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />
      {q.length >= 2 && (
        <ul className="resultados">
          {!index && <li className="suave">{s.searchLoading}</li>}
          {index && results.length === 0 && (
            <li className="suave">{s.searchEmpty}</li>
          )}
          {results.map((r) => (
            <li key={r.h}>
              <a href={r.h}>
                <strong>{r.n}</strong>
                <span className="suave">
                  {s.searchKinds[r.k]} · {r.d}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ShareButton() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="boton boton-borde"
      onClick={async () => {
        const url = window.location.href;
        try {
          if (navigator.share) await navigator.share({ url });
          else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
          }
        } catch {
          /* La persona canceló. */
        }
      }}
    >
      {copied ? s.copied : s.share}
    </button>
  );
}

/** Mi región destacada en el inicio (después de hidratar). */
export function YourRegionLink() {
  const [region] = useRegion();
  if (!region || !regionOrder.includes(region as RegionId))
    return <p className="suave">{s.inYourRegionHint}</p>;
  const r = region as RegionId;
  return (
    <a className={`tu-region zona-fondo-${zoneOf(r)}`} href={`/region/${r}`}>
      <span className="etiqueta">{s.yourRegion}</span>
      <strong>{t.regions[r]}</strong>
      <span>{s.seeRegion} →</span>
    </a>
  );
}
