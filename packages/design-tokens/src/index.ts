// Paleta del manual de marca Turismo en tu Mano 1.0 (berenjena y marfil sostienen la
// interfaz; los colores de zona orientan). Contrastes WCAG AA comprobados:
// texto ≥ 12,9:1, secundario ≥ 6,6:1, acento ≥ 5,7:1 y botón principal ≥ 6,1:1.
export const palettes = {
  dark: {
    background: "#22162E",
    surface: "#2F2140",
    text: "#F7EEDC",
    muted: "#CBBFD6",
    accent: "#F2AA19",
    border: "#4A3A5C",
    badge: "#3D2C50",
  },
  light: {
    background: "#FAF6EE",
    surface: "#FFFFFF",
    text: "#22162E",
    muted: "#5E5468",
    accent: "#A8401F",
    border: "#DDD3C6",
    badge: "#F6E3D9",
  },
} as const;

/** Colores de zona del símbolo (manual 1.0, pág. 9). */
export const zoneColors = {
  norte: "#F2AA19",
  centro: "#DD512D",
  sur: "#159B60",
  austral: "#08B9C9",
  islas: "#1463AA",
} as const;
