import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
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
 * Banner de la oferta vigente (panel -> Ofertas) a pantalla completa, la primera vez del día que se
 * entra a la página en este navegador. No interrumpe a quien entra directo a un juego o al panel.
 */
export default function OfferBanner() {
  const location = useLocation();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const blockedRoute = location.pathname.startsWith("/game/") || location.pathname.startsWith("/admin");

  useEffect(() => {
    if (blockedRoute || offer) return undefined;
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
  }, [blockedRoute, offer]);

  if (!offer) return null;

  const left = timeLeft(offer.endsAt);
  const close = () => setOffer(null);
  const buy = () => {
    close();
    navigate("/chips");
  };

  return createPortal(
    <div className="fixed inset-0 z-[99998] bg-black flex items-center justify-center" role="dialog" aria-label={offer.title}>
      <img
        src={offer.imageUrl}
        alt={offer.title}
        onClick={buy}
        className="absolute inset-0 w-full h-full object-contain cursor-pointer"
      />
      <button
        onClick={close}
        aria-label="Cerrar"
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/70 border border-white/40 text-white flex items-center justify-center cursor-pointer"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
      <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 px-4 pointer-events-none">
        {left && (
          <span className="px-4 py-1 rounded-full bg-black/70 text-white text-sm font-bold">Termina en {left}</span>
        )}
        <button
          onClick={buy}
          className="pointer-events-auto gold-gradient gold-glow px-10 py-3.5 rounded-lg font-bold uppercase tracking-wider text-[#0A0A0F] cursor-pointer"
        >
          Ver oferta
        </button>
      </div>
    </div>,
    document.body
  );
}
