/**
 * Sistema de rangos (espejo de RoyalGamesBackend/src/common/constants/rank-system.ts, que es quien
 * decide de verdad): se sube solo comprando fichas, contando lo cargado en dólares (1 € = 1 US$,
 * $1.500 ARS = 1 US$). Cada rango da un % fijo de fichas extra en todas las compras y se mantiene
 * cargando al menos MONTHLY_MAINTENANCE_USD por mes; si no, baja un rango.
 */
export const RANK_ORDER = ["bronze", "silver", "gold", "platinum", "diamond"];

/** Dólares acumulados para llegar a cada rango. */
export const RANK_THRESHOLDS = {
  bronze: 0,
  silver: 10,
  gold: 100,
  platinum: 1_000,
  diamond: 5_000,
};

/** Fichas extra (%) en cada compra según el rango. */
export const RANK_BONUS_PERCENT = {
  bronze: 0,
  silver: 10,
  gold: 25,
  platinum: 50,
  diamond: 100,
};

export const MONTHLY_MAINTENANCE_USD = 10;
export const ARS_PER_USD = 1_500;

export const formatUsd = (n) =>
  `US$${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(Number(n) || 0)}`;
export const formatArsEquivalent = (usd) =>
  `$${new Intl.NumberFormat("es-ES").format(Math.round((Number(usd) || 0) * ARS_PER_USD))} ARS`;

export const RANK_META = {
  bronze: {
    label: "Bronce",
    icon: "military_tech",
    className: "from-[#8c5a3c] to-[#5a3620] text-[#f0d9c4]",
  },
  silver: {
    label: "Plata",
    icon: "military_tech",
    className: "from-[#c9c9d1] to-[#8a8a94] text-[#1a1a1f]",
  },
  gold: {
    label: "Oro",
    icon: "workspace_premium",
    className: "from-[#f5d980] to-[#c9a84c] text-[#1a1a1f]",
  },
  platinum: {
    label: "Platino",
    icon: "diamond",
    className: "from-[#d8f0f5] to-[#8fc9d6] text-[#1a1a1f]",
  },
  diamond: {
    label: "Diamante",
    icon: "auto_awesome",
    className: "from-[#9ad8ff] to-[#3f6fd6] text-white",
  },
};

export const getRankMeta = (tier) => RANK_META[tier] || RANK_META.bronze;

/**
 * Returns { label, threshold } for the tier above `tier`, or null if already at the top.
 */
export const getNextRank = (tier) => {
  const index = RANK_ORDER.indexOf(tier || "bronze");
  if (index === -1 || index === RANK_ORDER.length - 1) {
    return null;
  }
  const nextTier = RANK_ORDER[index + 1];
  return { tier: nextTier, ...RANK_META[nextTier], threshold: RANK_THRESHOLDS[nextTier] };
};
