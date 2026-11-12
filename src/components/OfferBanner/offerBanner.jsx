import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import API_URL from "../../api/rutaApi";

const seenKey = (offerId) => `offerBanner:${offerId}`;
const today = () => new Date().toLocaleDateString("en-CA");

const wasSeenToday = (offerId) => {
  try {
    return localStorage.getItem(seenKey(offerId)) === today();
  } catch {
    return false;
  }
};

const markSeenToday = (offerId) => {
  try {
    localStorage.setItem(seenKey(offerId), today());
  } catch {
    // sin localStorage (modo privado): vuelve a salir en la próxima visita
  }
};

const timeLeft = (endsAt) => {
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return null;
  const minutes = Math.ceil(ms / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days > 0) return `${days} d ${hours} h`;
  if (hours > 0) return `${hours} h ${minutes % 60} min`;
  return `${minutes} min`;
};

/**
 * Banner de la oferta vigente (panel -> Ofertas) en el centro de la pantalla, la primera vez del día que se
 * entra a la página en este navegador. Solo con sesión iniciada (las ofertas son para comprar fichas).
 * No interrumpe a quien entra directo a un juego o al panel.
 */
export default function OfferBanner() {
  const location = useLocation();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const loggedIn = useSelector((state) => Boolean(state.currentUser?.id));
  const blockedRoute = location.pathname.startsWith("/game/") || location.pathname.startsWith("/admin");

  useEffect(() => {
    if (!loggedIn || blockedRoute || offer) return undefined;
    let cancelled = false;
    axios
      .get(`${API_URL}/chip-offers/current`)
      .then(({ data }) => {
        if (cancelled || !data?.offer || wasSeenToday(data.offer.id)) return;
        markSeenToday(data.offer.id);
        setOffer(data.offer);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [loggedIn, blockedRoute, offer]);

  if (!offer || !loggedIn) return null;

  const left = timeLeft(offer.endsAt);
  const close = () => setOffer(null);
  const buy = () => {
    close();
    navigate("/chips");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99998] bg-black/75 flex items-center justify-center p-4"
      role="dialog"
      data-offer-banner
      aria-label={offer.title}
      onClick={close}
    >
      <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <img
          src={offer.imageUrl}
          alt={offer.title}
          onClick={buy}
          className="w-full max-h-[65vh] object-contain rounded-xl cursor-pointer"
        />
        <button
          onClick={close}
          aria-label="Cerrar"
          className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black/70 border border-white/40 text-white flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        {/* Debajo de la imagen, para no tapar lo que dice la oferta. */}
        <div className="mt-3 flex flex-col items-center gap-2 px-4">
          {left && (
            <span className="px-4 py-1 rounded-full bg-black/70 text-white text-sm font-bold">Termina en {left}</span>
          )}
          <button
            onClick={buy}
            className="gold-gradient gold-glow px-8 py-2.5 rounded-lg font-bold uppercase tracking-wider text-[#0A0A0F] cursor-pointer"
          >
            Ver oferta
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
