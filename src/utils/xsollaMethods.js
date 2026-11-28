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
  oxxo: "OXXO Pay",
  spei: "SPEI",
  cash: "Efectivo",
  paysafecard: "Paysafecard",
  // Pagos viejos: PayPal y Mercado Pago también salían por Xsolla (ahora solo con nuestras
  // integraciones propias). Los de Bizum/Paysafecard de antes traen el medio en la plataforma.
};

// Región de pago (GET /payments/region) -> país de Xsolla. El resto: "OTHER" (moneda local del jugador).
export const XSOLLA_COUNTRY_BY_REGION = { ar: "AR", co: "CO", mx: "MX", es: "ES", br: "BR", other: "OTHER" };

// Moneda que manda el backend para "OTHER": Xsolla cobra en la moneda local del jugador.
export const XSOLLA_LOCAL_CURRENCY = "LOCAL";

/** "COP" / "tu moneda local", para "Pagás en ...". */
export const xsollaCurrencyText = (currency) => (currency === XSOLLA_LOCAL_CURRENCY ? "tu moneda local" : currency);

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
