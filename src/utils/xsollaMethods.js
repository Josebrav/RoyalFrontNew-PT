// Medios de pago de Xsolla: nombres para el historial y país de Xsolla de cada región de pago.
// La lista de qué medio va en qué país (y su id en Xsolla) la tiene el backend
// (src/modules/payments/xsolla-methods.ts) y la manda en GET /xsolla/methods.

export const XSOLLA_METHOD_LABELS = {
  nequi: "Nequi",
  pse: "PSE",
  bancolombia: "Botón Bancolombia",
  efecty: "Efecty",
  card: "Tarjeta",
  paypal: "PayPal",
  "google-pay": "Google Pay",
  "apple-pay": "Apple Pay",
  pix: "PIX",
  mercadopago: "Mercado Pago",
  "boleto-flash": "Boleto Flash",
  picpay: "PicPay",
  nupay: "NuPay",
  bizum: "Bizum",
  klarna: "Klarna",
  "online-banking": "Banca online",
  // Pagos viejos (antes el medio iba en la plataforma).
  paysafecard: "Paysafecard",
};

// Región de pago (GET /payments/region) -> país de Xsolla. México y el resto: "OTHER" (en dólares).
export const XSOLLA_COUNTRY_BY_REGION = { ar: "AR", co: "CO", es: "ES", br: "BR", mx: "OTHER", other: "OTHER" };

const LEGACY_PLATFORM = /^xsolla_(paysafecard|bizum)(_sandbox)?$/;

export const isXsollaPlatform = (platform) => /^xsolla(_|$)/.test(String(platform || ""));

/**
 * "Xsolla · Nequi" / "Xsolla (prueba) · Nequi" para un depósito de Xsolla, o null si no es de Xsolla.
 * Sin medio guardado: "Xsolla" / "Xsolla (prueba)".
 */
export function formatXsollaPlatform(platform, method) {
  const p = String(platform || "").toLowerCase();
  if (!isXsollaPlatform(p)) return null;
  const legacy = LEGACY_PLATFORM.exec(p);
  const key = method || legacy?.[1];
  const base = p.endsWith("_sandbox") ? "Xsolla (prueba)" : "Xsolla";
  return key ? `${base} · ${XSOLLA_METHOD_LABELS[key] || key}` : base;
}
