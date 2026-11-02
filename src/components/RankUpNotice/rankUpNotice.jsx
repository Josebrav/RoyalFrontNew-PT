import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../../api/rutaApi";
import { RANK_META, RANK_BONUS_PERCENT } from "../../utils/rank";

/**
 * Cartel de "¡Subiste a Plata!": el servidor guarda en users.rankUpNotice el rango nuevo cuando
 * sube (por una compra o porque lo subió el dueño) y acá se muestra una sola vez; al cerrarlo se
 * avisa al servidor para que no vuelva a salir.
 */
export default function RankUpNotice() {
  const { currentUser } = useSelector((state) => state);
  const [rank, setRank] = useState(null);
  const [seen, setSeen] = useState(null);

  const pending = currentUser?.id ? currentUser.rankUpNotice : null;
  useEffect(() => {
    if (pending && RANK_META[pending] && pending !== seen) setRank(pending);
  }, [pending, seen]);

  if (!rank) return null;

  const meta = RANK_META[rank];
  const bonus = RANK_BONUS_PERCENT[rank] ?? 0;
  const close = () => {
    setSeen(rank);
    setRank(null);
    axios.post(`${API_URL}/users/me/rank-notice/seen`).catch(() => {});
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={close}
    >
      <div
        className="glass-card rounded-xl p-8 shadow-2xl relative max-w-sm w-full text-center space-y-6 border border-[#1A1A26] select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-glow-spot -top-20 -left-20 pointer-events-none"></div>

        <div
          className={`mx-auto w-28 h-28 rounded-full bg-gradient-to-br ${meta.className} flex items-center justify-center shadow-[0_0_30px_rgba(201,168,76,0.35)] relative z-10`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "64px" }}>
            {meta.icon}
          </span>
        </div>

        <div className="space-y-2 relative z-10">
          <h2 className="font-headline-md text-headline-md text-white">
            ¡Subiste a {meta.label}!
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {bonus > 0
              ? `Desde ahora recibís ${bonus}% de fichas extra en todas tus compras.`
              : "Felicitaciones por tu nuevo rango."}
          </p>
          <Link
            to="/rangos"
            onClick={close}
            className="inline-block text-sm text-[#c9a84c] underline underline-offset-2"
          >
            Ver beneficios de los rangos
          </Link>
        </div>

        <button
          onClick={close}
          className="gold-gradient gold-glow gold-glow-hover w-full py-3.5 px-4 rounded-lg font-headline-sm text-headline-sm text-[#0A0A0F] uppercase tracking-wider transition-all duration-300 transform active:scale-[0.98] cursor-pointer relative z-10"
        >
          ¡Genial!
        </button>
      </div>
    </div>,
    document.body
  );
}
