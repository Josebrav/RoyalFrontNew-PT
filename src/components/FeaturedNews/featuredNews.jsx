import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../../api/rutaApi";

const seenKey = (id) => `featuredNews:${id}`;
const today = () => new Date().toLocaleDateString("en-CA");

const wasSeenToday = (id) => {
  try {
    return localStorage.getItem(seenKey(id)) === today();
  } catch {
    return false;
  }
};

const markSeenToday = (id) => {
  try {
    localStorage.setItem(seenKey(id), today());
  } catch {
    // sin localStorage (modo privado): vuelve a salir en la próxima visita
  }
};

const isExternal = (link) => /^https?:\/\//i.test(link || "");

/**
 * Noticia en "primera plana" (panel de Noticias -> "Mostrar en primera plana"): su banner aparece en el centro
 * de la pantalla, como las ofertas, la primera vez del día que se entra a la página en este navegador.
 * Tocar el banner lleva al enlace de la noticia (o a la noticia en /news si no tiene enlace).
 * Se ve con o sin sesión. No interrumpe a quien entra directo a un juego o al panel, y si está abierta la
 * oferta del día espera a que se cierre para no taparse una con la otra.
 */
export default function FeaturedNews() {
  const location = useLocation();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [pending, setPending] = useState(null);
  const blockedRoute = location.pathname.startsWith("/game/") || location.pathname.startsWith("/admin");

  useEffect(() => {
    if (blockedRoute || article || pending) return undefined;
    let cancelled = false;
    axios
      .get(`${API_URL}/news/featured`)
      .then(({ data }) => {
        const a = data?.article;
        if (cancelled || !a?.imageUrl || wasSeenToday(a.id)) return;
        setPending(a);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [blockedRoute, article, pending]);

  // Espera a que no haya otro cartel (la oferta) en pantalla
  useEffect(() => {
    if (!pending) return undefined;
    const tryShow = () => {
      if (document.querySelector("[data-offer-banner]")) return false;
      markSeenToday(pending.id);
      setArticle(pending);
      setPending(null);
      return true;
    };
    if (tryShow()) return undefined;
    const id = setInterval(() => {
      if (tryShow()) clearInterval(id);
    }, 700);
    return () => clearInterval(id);
  }, [pending]);

  if (!article || blockedRoute) return null;

  const close = () => setArticle(null);
  const open = () => {
    close();
    const link = article.linkTo;
    if (!link) navigate(`/news?articulo=${article.id}`);
    else if (isExternal(link)) window.open(link, "_blank", "noopener,noreferrer");
    else navigate(link);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99998] bg-black/75 flex items-center justify-center p-4"
      role="dialog"
      aria-label={article.titulo}
      onClick={close}
    >
      <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <img
          src={article.imageUrl}
          alt={article.titulo}
          onClick={open}
          className="w-full max-h-[65vh] object-contain rounded-xl cursor-pointer"
        />
        <button
          onClick={close}
          aria-label="Cerrar"
          className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black/70 border border-white/40 text-white flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="mt-3 flex flex-col items-center gap-2 px-4">
          <button
            onClick={open}
            className="gold-gradient gold-glow px-8 py-2.5 rounded-lg font-bold uppercase tracking-wider text-[#0A0A0F] cursor-pointer"
          >
            Ver más
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
