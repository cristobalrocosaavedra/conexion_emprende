import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { messages as t } from "@territorio-vivo/i18n";
import "@fontsource-variable/nunito";
import "./style.css";

export const metadata: Metadata = {
  title: {
    default: t.sitio.pageTitle(t.sitio.heroTitle),
    template: t.sitio.pageTitle("%s"),
  },
  description: t.sitio.metaDescription,
  // Sitio en pruebas: no indexar hasta aprobación expresa.
  robots: { index: false, follow: false },
  icons: { icon: "/arte/turismo-en-tu-mano-icono.png" },
};
export const viewport: Viewport = {
  themeColor: "#22162E",
  width: "device-width",
  initialScale: 1,
};
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CL">
      <body>{children}</body>
    </html>
  );
}
