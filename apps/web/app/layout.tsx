import type { ReactNode } from "react";
import { messages as t } from "@territorio-vivo/i18n";
import "./style.css";
export const metadata = { title: t.brand, description: t.webBody };
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
