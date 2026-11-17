import type { ReactNode } from "react";
import { messages as t } from "@territorio-vivo/i18n";
import { BottomNav, SiteFooter, SiteHeader } from "./ui";

export function Shell({
  here,
  children,
}: {
  here?: string;
  children: ReactNode;
}) {
  return (
    <>
      <a className="saltar" href="#contenido">
        {t.sitio.skip}
      </a>
      <SiteHeader here={here} />
      <main id="contenido">{children}</main>
      <SiteFooter />
      <BottomNav />
    </>
  );
}
