import {
  businessPlans,
  formatClp,
  teamContact,
  withIva,
} from "@territorio-vivo/core";
import { messages as t } from "@territorio-vivo/i18n";

const c = t.commercial;
// Contacto público (no secreto) configurado al publicar; mismas variables que la app.
const contact = teamContact({
  EXPO_PUBLIC_CONTACTO_CORREO: process.env.EXPO_PUBLIC_CONTACTO_CORREO,
  EXPO_PUBLIC_CONTACTO_WHATSAPP: process.env.EXPO_PUBLIC_CONTACTO_WHATSAPP,
});

export function Contact() {
  return (
    <section id="contacto" className="seccion caja">
      <h2>{c.contactTitle}</h2>
      {contact.email || contact.whatsapp ? (
        <div className="fila">
          {contact.email && (
            <a
              className="boton boton-principal"
              href={`mailto:${contact.email}`}
            >
              {c.email}
            </a>
          )}
          {contact.whatsapp && (
            <a
              className="boton boton-borde"
              href={`https://wa.me/${contact.whatsapp}`}
              rel="noopener"
              target="_blank"
            >
              {c.whatsapp}
            </a>
          )}
        </div>
      ) : (
        <p className="suave">{c.contactSoon}</p>
      )}
    </section>
  );
}

export function Plans() {
  return (
    <>
      <section className="portada-oscura">
        <h1>{c.joinTitle}</h1>
        <p>{c.joinIntro}</p>
      </section>
      <div className="contenido">
        <ol className="pasos">
          <li>
            <strong>1</strong> {c.chooseStep}
          </li>
          {c.rules.map((rule, i) => (
            <li key={rule}>
              <strong>{i + 2}</strong> {rule}
            </li>
          ))}
        </ol>
        <section className="seccion">
          <h2>{c.plansTitle}</h2>
          <p className="clave-ruta">{c.routeKey}</p>
          <div className="planes">
            {businessPlans.map((plan) => (
              <article
                key={plan.id}
                className={`plan${plan.recommended ? " recomendado" : ""}`}
              >
                <header>
                  <h3>{c.plans[plan.id].name}</h3>
                  {plan.recommended && (
                    <span className="etiqueta">{c.recommended}</span>
                  )}
                </header>
                <p className="precio">
                  {formatClp(plan.netClp)}{" "}
                  <span>
                    {c.plusIva} / {c.perMonth}
                  </span>
                </p>
                <p className="suave chico-texto">
                  {c.total}: {formatClp(withIva(plan.netClp))} {c.perMonth}
                </p>
                <p>{c.plans[plan.id].detail}</p>
                <ul className="beneficios">
                  {(
                    [
                      ["card", true],
                      ["map", plan.mapAndRoute],
                      ["route", plan.mapAndRoute],
                      ["photos", plan.mapAndRoute],
                      ["featured", plan.featured],
                    ] as const
                  ).map(([key, on]) => (
                    <li key={key} className={on ? "si" : "no"}>
                      <span aria-hidden="true">{on ? "✓" : "—"}</span>
                      <span className="oculto">
                        {on ? c.included : c.notIncluded}:
                      </span>{" "}
                      {c.features[key]}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="suave">
            {c.annual} {c.founders}
          </p>
          <p className="suave chico-texto">{c.draftNote}</p>
        </section>
        <aside className="banda-negocio">
          <p>{c.municipalLink}</p>
          <a className="boton boton-borde" href="/municipios">
            {t.sitio.footerMunicipal} →
          </a>
        </aside>
        <Contact />
      </div>
    </>
  );
}

export function Municipal() {
  return (
    <>
      <section className="portada-oscura">
        <h1>{c.municipalTitle}</h1>
        <p>{c.municipalIntro}</p>
      </section>
      <div className="contenido">
        <ul className="lista-check">
          {c.municipalPoints.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <p>{c.municipalPrice}</p>
        <a className="boton boton-borde" href="/suma-tu-negocio">
          {c.businessLink} →
        </a>
        <Contact />
      </div>
    </>
  );
}

export function Legal({
  title,
  sections,
}: {
  title: string;
  sections: readonly { title: string; body: string }[];
}) {
  return (
    <div className="contenido texto-largo">
      <h1>{title}</h1>
      <p className="aviso">{t.legal.draft}</p>
      {sections.map((x) => (
        <section key={x.title}>
          <h2>{x.title}</h2>
          <p>{x.body}</p>
        </section>
      ))}
      <p className="suave chico-texto">
        {t.legal.updated} · {c.team}
      </p>
    </div>
  );
}
