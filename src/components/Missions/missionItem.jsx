import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { getGameBySlug } from "../../data/gamesCatalog";
import { getUserByEmail } from "../../redux/actions";
import { playCoinSound } from "../../utils/coinSound";
import { swalThemeConfig } from "../../utils/formatters";
import { claimMission, formatNumber, missionTitle } from "../../utils/useMissions";

const METRIC_ICON = {
  plays: "sports_esports",
  wagered: "toll",
  slot_spins: "casino",
  domino_hands: "view_module",
  domino_wins: "emoji_events",
  parchis_matches: "grid_view",
  parchis_wins: "emoji_events",
  bingo_cards: "confirmation_number",
  mines_rounds: "diamond",
  ruleta_rounds: "radio_button_checked",
  blackjack_hands: "style",
  bicho_bets: "pets",
  game_rounds: "casino",
  poker_hands: "playing_cards",
  poker_wins: "emoji_events",
  buraco_rounds: "layers",
  buraco_wins: "emoji_events",
};

/** Color del cuadrito del icono, segun lo que pide la mision. */
const METRIC_COLOR = {
  plays: "#8b5cf6",
  wagered: "#f59e0b",
  slot_spins: "#ec4899",
  domino_hands: "#3b82f6",
  domino_wins: "#eab308",
  parchis_matches: "#22c55e",
  parchis_wins: "#eab308",
  bingo_cards: "#06b6d4",
  mines_rounds: "#14b8a6",
  ruleta_rounds: "#ef4444",
  blackjack_hands: "#10b981",
  bicho_bets: "#84cc16",
  game_rounds: "#d946ef",
  poker_hands: "#0ea5e9",
  poker_wins: "#eab308",
  buraco_rounds: "#6366f1",
  buraco_wins: "#eab308",
};

/** Una misión: progreso, premio y botón de Cobrar (si está cumplida) o de Jugar. */
export default function MissionItem({ mission, compact = false, grow = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state);
  const [claiming, setClaiming] = useState(false);
  const pct = Math.min(100, Math.round((mission.progress / mission.target) * 100));
  const game = mission.gameSlug ? getGameBySlug(mission.gameSlug) : null;
  const ready = mission.completed && !mission.claimed;
  const color = ready ? "#22c55e" : METRIC_COLOR[mission.metric] || "#8b5cf6";
  // Misión de un juego puntual: se muestra la imagen del juego (si el catálogo la tiene) en vez del icono.
  const gameImage = mission.metric === "game_rounds" && !mission.claimed ? game?.image : null;
  const icon = mission.claimed ? "task_alt" : (mission.metric === "game_rounds" && game?.icon) || METRIC_ICON[mission.metric] || "flag";

  const handleClaim = async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      const res = await claimMission(mission.id);
      playCoinSound();
      if (currentUser?.email) dispatch(getUserByEmail(currentUser.email)).catch(() => {});
      Swal.fire({
        title: "¡Misión cumplida!",
        text: `Ganaste ${formatNumber(res.reward)} fichas.`,
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
        ...swalThemeConfig,
      });
    } catch (e) {
      setClaiming(false);
      Swal.fire({ title: "Misiones", text: e?.response?.data?.message || "No se pudo cobrar la misión", icon: "error", ...swalThemeConfig });
    }
  };

  return (
    <div
      className={`flex items-center rounded-xl border ${grow ? "xl:flex-[1_0_auto]" : ""} ${compact ? "gap-2 px-2.5 py-1.5" : "gap-3 p-3"} ${mission.claimed ? "opacity-60" : ""}`}
      style={{
        borderColor: ready ? "rgba(34,197,94,0.6)" : `${color}33`,
        background: ready
          ? "linear-gradient(90deg, rgba(34,197,94,0.16), rgba(250,204,21,0.06))"
          : `linear-gradient(90deg, ${color}14, rgba(255,255,255,0.01))`,
        boxShadow: ready ? "0 0 16px rgba(34,197,94,0.25)" : "none",
      }}
    >
      <span
        className={`flex-shrink-0 inline-flex items-center justify-center rounded-xl overflow-hidden ${compact ? "w-7 h-7" : "w-11 h-11"}`}
        style={{ background: `linear-gradient(135deg, ${color}, ${color}99)`, boxShadow: `0 0 12px ${color}66` }}
      >
        {gameImage ? (
          <img src={gameImage} alt={game?.name || ""} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className={`material-symbols-outlined text-white ${compact ? "text-[16px]" : "text-[24px]"}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            {icon}
          </span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`font-bold text-white ${compact ? "text-xs" : "text-sm"} leading-snug`}>{missionTitle(mission)}</p>
        <div className={`${compact ? "mt-1 h-1.5" : "mt-1.5 h-2"} w-full bg-[#0a0b18] rounded-full overflow-hidden border border-white/5`}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: mission.completed ? "linear-gradient(90deg, #22c55e, #facc15)" : `linear-gradient(90deg, ${color}, #22d3ee)`,
              boxShadow: pct > 0 ? `0 0 8px ${mission.completed ? "#22c55e" : color}` : "none",
            }}
          />
        </div>
        <p className={`${compact ? "mt-0.5 text-[0.625rem]" : "mt-1 text-[0.6875rem]"} text-on-surface-variant tabular-nums`}>
          {formatNumber(mission.progress)} / {formatNumber(mission.target)}
          <span className="text-amber-300 font-bold"> · +{formatNumber(mission.reward)} fichas</span>
        </p>
      </div>
      {mission.claimed ? (
        <span className="text-[0.6875rem] font-bold uppercase text-green-400 flex-shrink-0">Cobrada</span>
      ) : mission.completed ? (
        <button
          type="button"
          onClick={handleClaim}
          disabled={claiming}
          className={`bg-gradient-to-r from-[#22c55e] to-[#facc15] ${compact ? "px-2.5 py-1 text-[0.6875rem]" : "px-3 py-1.5 text-xs"} rounded-lg text-[#0A0A0F] font-black uppercase flex-shrink-0 cursor-pointer border-0 hover:brightness-110 disabled:opacity-60 shadow-[0_0_14px_rgba(34,197,94,0.55)]`}
        >
          Cobrar
        </button>
      ) : (
        <button
          type="button"
          onClick={() => navigate(game?.playPath || "/juegos")}
          className={`${compact ? "px-2.5 py-1 text-[0.6875rem]" : "px-3 py-1.5 text-xs"} rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white font-bold uppercase flex-shrink-0 cursor-pointer border-0 hover:brightness-110 shadow-[0_0_12px_rgba(139,92,246,0.45)]`}
        >
          Jugar
        </button>
      )}
    </div>
  );
}
