import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import RankBadge from "../ui/RankBadge/rankBadge";
import useRankStatus from "../../utils/useRankStatus";
import {
  RANK_ORDER,
  RANK_META,
  RANK_THRESHOLDS,
  RANK_BONUS_PERCENT,
  MONTHLY_MAINTENANCE_USD,
  formatUsd,
  formatArsEquivalent,
} from "../../utils/rank";

// Color de cada rango (borde, fondo y brillo de su tarjeta).
const TIER_COLORS = {
  bronze: { a: "#d97742", b: "#7c3a14" },
  silver: { a: "#a8b4c8", b: "#475569" },
  gold: { a: "#facc15", b: "#a16207" },
  platinum: { a: "#2dd4bf", b: "#0f766e" },
  diamond: { a: "#60a5fa", b: "#4338ca" },
};
const RULE_COLORS = ["#06b6d4", "#8b5cf6", "#10b981", "#ec4899"];

const RULES = [
  {
    icon: "shopping_bag",
    title: "Se sube comprando fichas",
    text: "Cada compra suma su valor en dólares a tu progreso (o su equivalente: 1 € = 1 US$ y $1.500 ARS = 1 US$). Jugar o recibir fichas de regalo no suma.",
  },
  {
    icon: "redeem",
    title: "Fichas extra en todas tus compras",
    text: "Mientras tengas un rango, cada paquete que compres te acredita automáticamente el % extra de ese rango, sobre cualquier promoción del paquete.",
  },
  {
    icon: "event_repeat",
    title: `Mantenelo con ${formatUsd(MONTHLY_MAINTENANCE_USD)} por mes`,
    text: `Para conservar tu rango cargá al menos ${formatUsd(MONTHLY_MAINTENANCE_USD)} (${formatArsEquivalent(MONTHLY_MAINTENANCE_USD)}) en cada mes calendario. El mes en que subís de rango no cuenta.`,
  },
  {
    icon: "trending_down",
    title: "Si un mes no cargás, bajás un rango",
    text: "El día 1 bajás al rango anterior y tu progreso queda en el mínimo de ese rango: para recuperar el que perdiste tenés que volver a juntar lo que falte.",
  },
];

export default function RankSystem() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state);
  const status = useRankStatus(currentUser?.id);
  const currentRank = status?.rank || currentUser?.rank || null;
  const progress =
    status?.nextThreshold ? Math.min(100, Math.round((status.points / status.nextThreshold) * 100)) : 100;
  const maintenanceLeft = status ? Math.max(0, status.maintenanceUsd - status.monthDepositedUsd) : 0;

  return (
    <div className="bg-background text-on-background min-h-screen pt-20 pb-16">
      <div className="px-4 md:px-margin-desktop max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("/chips")}
          className="text-sm text-on-surface-variant hover:text-primary flex items-center gap-1 mb-4 cursor-pointer bg-transparent border-0 p-0"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Volver a Comprar Fichas
        </button>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] shadow-[0_0_18px_rgba(139,92,246,0.55)] material-symbols-outlined text-[26px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
              workspace_premium
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffe08f] via-[#f9a8d4] to-[#7dd3fc]">Sistema de Rangos</span>
          </h1>
          <p className="text-on-surface-variant mt-2 max-w-2xl">
            Cuanto más alto tu rango, más fichas recibís en cada compra. Además, cada rango tiene ofertas y
            beneficios exclusivos que vamos a ir anunciando.
          </p>
        </header>

        {/* Estado del jugador */}
        {currentUser?.id && (
          <section className="relative overflow-hidden rounded-2xl border border-[#8b5cf6]/35 bg-[#0d0f1f] p-5 mb-8 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-[#8b5cf6]/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-[#06b6d4]/20 blur-3xl" />
            <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tu rango</span>
                <RankBadge tier={currentRank} />
                {status && status.bonusPercent > 0 && (
                  <span className="text-sm font-bold text-green-400">+{status.bonusPercent}% de fichas en cada compra</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => navigate("/chips")}
                className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] px-5 py-2 rounded-xl text-white font-bold text-sm cursor-pointer border-0 hover:brightness-110 shadow-[0_0_16px_rgba(139,92,246,0.5)]"
              >
                Comprar fichas
              </button>
            </div>

            {status ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">
                    {status.nextRank
                      ? `Progreso hacia ${RANK_META[status.nextRank].label}`
                      : "Rango máximo alcanzado"}
                  </p>
                  <div className="w-full bg-surface-container-lowest h-2.5 rounded-full overflow-hidden border border-outline-variant/10">
                    <div className="h-full bg-gradient-to-r from-[#8b5cf6] via-[#ec4899] to-[#06b6d4]" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-xs mt-1 text-on-surface-variant tabular-nums">
                    {formatUsd(status.points)}
                    {status.nextThreshold ? ` / ${formatUsd(status.nextThreshold)}` : ""}
                    {status.nextThreshold && status.points < status.nextThreshold
                      ? ` · te faltan ${formatUsd(status.nextThreshold - status.points)}`
                      : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">Carga de este mes</p>
                  {status.maintenanceRequired ? (
                    <>
                      <div className="w-full bg-surface-container-lowest h-2.5 rounded-full overflow-hidden border border-outline-variant/10">
                        <div
                          className={`h-full ${maintenanceLeft === 0 ? "bg-green-500" : "bg-amber-400"}`}
                          style={{ width: `${Math.min(100, (status.monthDepositedUsd / status.maintenanceUsd) * 100)}%` }}
                        />
                      </div>
                      <p className={`text-xs mt-1 ${maintenanceLeft === 0 ? "text-green-400" : "text-amber-300"}`}>
                        {maintenanceLeft === 0
                          ? `Rango asegurado este mes (${formatUsd(status.monthDepositedUsd)} cargados).`
                          : `Cargá ${formatUsd(maintenanceLeft)} más antes de fin de mes para no bajar de rango.`}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-on-surface-variant">
                      {currentRank === "bronze"
                        ? "Bronce no necesita mantenimiento."
                        : "Este mes subiste de rango: no necesitás cargar para mantenerlo."}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-12 flex items-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
            </div>
          </section>
        )}

        {/* Rangos */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#ec4899] to-[#8b5cf6]" />Rangos y fichas extra</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {RANK_ORDER.map((tier) => {
              const isCurrent = tier === currentRank;
              const c = TIER_COLORS[tier] || TIER_COLORS.bronze;
              return (
                <div
                  key={tier}
                  className={`rounded-2xl p-4 flex flex-col gap-3 border-2 transition-transform ${isCurrent ? "-translate-y-1" : "hover:-translate-y-1"}`}
                  style={{
                    borderColor: isCurrent ? c.a : `${c.a}55`,
                    background: `linear-gradient(165deg, ${c.b}55, #0d0f1f 60%)`,
                    boxShadow: isCurrent ? `0 0 24px ${c.a}88` : "0 6px 18px rgba(0,0,0,0.35)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <RankBadge tier={tier} size="sm" />
                    {isCurrent && <span className="text-[0.625rem] font-black uppercase px-2 py-0.5 rounded-full text-white" style={{ background: c.a }}>Tu rango</span>}
                  </div>
                  <div>
                    <p className="text-[0.625rem] uppercase tracking-wider text-on-surface-variant font-bold">Se alcanza con</p>
                    <p className="text-lg font-black text-white tabular-nums" style={{ textShadow: `0 0 10px ${c.a}66` }}>
                      {RANK_THRESHOLDS[tier] === 0 ? "Al registrarte" : formatUsd(RANK_THRESHOLDS[tier])}
                    </p>
                    {RANK_THRESHOLDS[tier] > 0 && (
                      <p className="text-[0.6875rem] text-on-surface-variant">≈ {formatArsEquivalent(RANK_THRESHOLDS[tier])}</p>
                    )}
                  </div>
                  <div className="mt-auto">
                    <p className="text-[0.625rem] uppercase tracking-wider text-on-surface-variant font-bold">Fichas extra</p>
                    <p className={`text-2xl font-black ${RANK_BONUS_PERCENT[tier] > 0 ? "text-green-400" : "text-on-surface-variant"}`}>
                      {RANK_BONUS_PERCENT[tier] > 0 ? `+${RANK_BONUS_PERCENT[tier]}%` : "—"}
                    </p>
                    <p className="text-[0.6875rem] text-on-surface-variant">
                      {RANK_BONUS_PERCENT[tier] > 0 ? "en cada compra" : "rango inicial"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-on-surface-variant mt-3">
            Los montos son acumulados: por ejemplo, diez compras de US$10 te llevan a Oro. Ejemplo de bono: un paquete
            de 1.000.000 de fichas comprado siendo Oro te acredita 1.250.000.
          </p>
        </section>

        {/* Reglas */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#06b6d4] to-[#10b981]" />Cómo funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RULES.map((rule, i) => (
              <div
                key={rule.title}
                className="rounded-2xl p-4 flex gap-3 border"
                style={{ borderColor: `${RULE_COLORS[i % 4]}55`, background: `linear-gradient(135deg, ${RULE_COLORS[i % 4]}22, #0d0f1f 70%)` }}
              >
                <span
                  className="material-symbols-outlined text-white p-2 rounded-lg h-fit"
                  style={{ background: RULE_COLORS[i % 4], boxShadow: `0 0 12px ${RULE_COLORS[i % 4]}99` }}
                >
                  {rule.icon}
                </span>
                <div>
                  <p className="font-bold text-white">{rule.title}</p>
                  <p className="text-sm text-on-surface-variant mt-1">{rule.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl p-5 border border-[#f472b6]/40 bg-gradient-to-r from-[#ec4899]/20 via-[#8b5cf6]/15 to-[#06b6d4]/15 shadow-[0_0_20px_rgba(236,72,153,0.2)]">
          <p className="font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-white bg-[#ec4899] p-1.5 rounded-lg">local_offer</span>
            Ofertas y beneficios exclusivos por rango
          </p>
          <p className="text-sm text-on-surface-variant mt-1">
            Además del bono fijo, vamos a lanzar ofertas especiales y beneficios solo para cada rango. Seguí las{" "}
            <button
              type="button"
              onClick={() => navigate("/noticias")}
              className="text-[#f9a8d4] font-bold underline cursor-pointer bg-transparent border-0 p-0"
            >
              Noticias
            </button>{" "}
            para enterarte primero.
          </p>
        </section>
      </div>
    </div>
  );
}
