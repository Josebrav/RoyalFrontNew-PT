import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { LOCALE } from "../i18n/locale";
import { SITE_URL, seoForPath } from "../data/seo";

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Pone titulo, descripcion, canonical y robots de cada pagina al navegar (Google ejecuta el JS de
 * la pagina y lee estos valores). Solo en el sitio en espanol: los datos de seo.js estan en espanol.
 */
export default function useSeo() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (LOCALE !== "es") {
      // Los sitios en ingles/portugues comparten el index.html en espanol: sin canonical ni
      // vista previa apuntando a royaljuegos.com, para que Google no los tome como copias.
      document.head.querySelector('link[rel="canonical"]')?.remove();
      document.head.querySelector('meta[property="og:url"]')?.remove();
      document.title = "RoyalGames";
      return;
    }
    const seo = seoForPath(pathname);
    document.title = seo.title;
    setMeta("name", "description", seo.description);
    setMeta("property", "og:title", seo.title);
    setMeta("property", "og:description", seo.description);
    setMeta("property", "og:url", SITE_URL + pathname);
    setMeta("name", "twitter:title", seo.title);
    setMeta("name", "twitter:description", seo.description);
    setMeta("name", "robots", seo.index ? "index, follow" : "noindex, follow");
    setCanonical(SITE_URL + (pathname === "/" ? "/" : pathname));
  }, [pathname]);
}
