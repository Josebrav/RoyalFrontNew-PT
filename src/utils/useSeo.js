import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE_URL, seoForPath, alternatesForPath, pageTitle } from "../data/seo";

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

/** Enlaces a la misma pagina en los otros idiomas (hreflang); se rehacen en cada pagina. */
function setAlternates(links) {
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
  for (const { hreflang, href } of links) {
    const el = document.createElement("link");
    el.setAttribute("rel", "alternate");
    el.setAttribute("hreflang", hreflang);
    el.setAttribute("href", href);
    document.head.appendChild(el);
  }
}

/**
 * Pone titulo, descripcion, canonical, robots y los enlaces a los otros idiomas de cada pagina al
 * navegar (Google ejecuta el JS de la pagina y lee estos valores). Cada sitio (espanol, portugues,
 * ingles) usa sus propios textos y su propio dominio (ver data/sites.js).
 */
export default function useSeo() {
  const { pathname } = useLocation();
  useEffect(() => {
    const seo = seoForPath(pathname);
    // Marca primero y despues de que trata la pagina (Google usa este titulo en los resultados).
    document.title = pageTitle(seo.title);
    setMeta("name", "description", seo.description);
    setMeta("property", "og:title", seo.title);
    setMeta("property", "og:description", seo.description);
    setMeta("property", "og:url", SITE_URL + pathname);
    setMeta("name", "twitter:title", seo.title);
    setMeta("name", "twitter:description", seo.description);
    setMeta("name", "robots", seo.index ? "index, follow" : "noindex, follow");
    setCanonical(SITE_URL + (pathname === "/" ? "/" : pathname));
    setAlternates(seo.index ? alternatesForPath(pathname) : []);
  }, [pathname]);
}
