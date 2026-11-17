/**
 * Planes para negocios. Valores netos en pesos chilenos; el IVA se suma y se
 * muestra siempre junto al total. Los beneficios son borrador hasta que el
 * titular los apruebe; no hay cobro en línea activo.
 */
export const IVA = 0.19;

export interface BusinessPlan {
  id: "presencia" | "completo" | "destacado";
  netClp: number;
  recommended: boolean;
}

export const businessPlans: readonly BusinessPlan[] = [
  { id: "presencia", netClp: 9990, recommended: false },
  { id: "completo", netClp: 24990, recommended: true },
  { id: "destacado", netClp: 39990, recommended: false },
];

export const withIva = (net: number) => Math.round(net * (1 + IVA));

// Formato manual: Intl no está completo en todos los motores móviles.
export const formatClp = (value: number) =>
  "$" + String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** Contacto público del equipo, configurado al publicar (no es secreto). */
export function teamContact(env: Record<string, string | undefined>) {
  const email = env.EXPO_PUBLIC_CONTACTO_CORREO?.trim();
  const whatsapp = env.EXPO_PUBLIC_CONTACTO_WHATSAPP?.replace(/[^0-9]/g, "");
  return {
    email: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null,
    whatsapp: whatsapp && whatsapp.length >= 8 ? whatsapp : null,
  };
}
