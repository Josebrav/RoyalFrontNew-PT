// Plugin de Vite: cada sitio (espanol, portugues, ingles) sale con su propio index.html (idioma,
// titulo, descripcion, canonical, vista previa y enlaces hreflang), robots.txt y sitemap.xml.
// Antes los tres compartian el index.html y el sitemap de royaljuegos.com, y Google veia los sitios
// en portugues/ingles como copias en espanol del mismo sitio.
import fs from "node:fs";
import path from "node:path";
import { SITES, SITE_LOCALES, HREFLANG, SHARED_PATHS, ES_ONLY_PATHS } from "./src/data/sites.js";
import { prerender } from "./prerender.js";

const ES_URL = SITES.es.url;

/** Slugs de los juegos activos (leidos del catalogo, que importa imagenes y no se puede cargar aca). */
function activeGameSlugs(root) {
  const src = fs.readFileSync(path.join(root, "src/data/gamesCatalog.js"), "utf8");
  const slugs = [];
  const re = /slug: "([^"]+)",[\s\S]*?status: "(\w+)"/g;
  let m;
  while ((m = re.exec(src))) if (m[2] === "active") slugs.push(m[1]);
  return slugs;
}

const escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function alternateLinks(pathname, indent) {
  const links = SITE_LOCALES.map(
    (loc) => `${indent}<link rel="alternate" hreflang="${HREFLANG[loc]}" href="${SITES[loc].url}${pathname}" />`,
  );
  links.push(`${indent}<link rel="alternate" hreflang="x-default" href="${ES_URL}${pathname}" />`);
  return links.join("\n");
}

function setMetaContent(html, attr, key, value) {
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
  return html.replace(re, `$1${escapeAttr(value)}$2`);
}

function transformHtml(html, locale) {
  const site = SITES[locale];
  let out = html;
  if (locale !== "es") {
    out = out.replace('<html lang="es"', `<html lang="${site.lang}"`);
    out = out.replace(/<title>[^<]*<\/title>/, `<title>${site.name}</title>`);
    out = setMetaContent(out, "name", "description", site.description);
    out = setMetaContent(out, "name", "keywords", site.keywords);
    out = setMetaContent(out, "property", "og:site_name", site.name);
    out = setMetaContent(out, "property", "og:locale", site.ogLocale);
    out = setMetaContent(out, "property", "og:title", site.title);
    out = setMetaContent(out, "property", "og:description", site.shareDescription);
    out = setMetaContent(out, "name", "twitter:title", site.title);
    out = setMetaContent(out, "name", "twitter:description", site.shareDescription);
    // Datos estructurados: dominio, nombre, idioma y descripcion del sitio.
    out = out.replace(/"inLanguage": "es"/g, `"inLanguage": "${site.lang}"`);
    out = out.replace(/"description": "[^"]*"/, `"description": ${JSON.stringify(site.description)}`);
    out = out.replace(/"name": "RoyalJuegos"/g, `"name": "${site.name}"`);
    out = out.split(ES_URL).join(site.url);
  }
  // Enlaces a la portada en los otros idiomas (useSeo los rehace en cada pagina).
  out = out.replace("</head>", `${alternateLinks("/", "    ")}\n  </head>`);
  return out;
}

function robotsTxt(locale) {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /perfil",
    "Disallow: /mensajes",
    "Disallow: /amigos",
    "Disallow: /chips",
    "Disallow: /game/",
    "Disallow: /restablecer-contrasena",
    "Disallow: /mercadopago/",
    "",
    `Sitemap: ${SITES[locale].url}/sitemap.xml`,
    "",
  ].join("\n");
}

function sitemapXml(locale, root) {
  const site = SITES[locale];
  const today = new Date().toISOString().slice(0, 10);
  const shared = [...SHARED_PATHS, ...activeGameSlugs(root).map((slug) => `/juegos/${slug}`)];
  const entry = (p, withAlternates) => {
    const priority = p === "/" ? "1.0" : p.startsWith("/juegos/") ? "0.9" : "0.5";
    const freq = p === "/" ? "daily" : "weekly";
    const alternates = withAlternates
      ? "\n" +
        [
          ...SITE_LOCALES.map((loc) => `    <xhtml:link rel="alternate" hreflang="${HREFLANG[loc]}" href="${SITES[loc].url}${p}"/>`),
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${ES_URL}${p}"/>`,
        ].join("\n")
      : "";
    return `  <url>\n    <loc>${site.url}${p}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>${alternates}\n  </url>`;
  };
  const urls = shared.map((p) => entry(p, true));
  if (locale === "es") urls.push(...ES_ONLY_PATHS.map((p) => entry(p, false)));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;
}

export default function seoBuild(localeEnv) {
  const locale = SITES[localeEnv] ? localeEnv : "es";
  let root = process.cwd();
  let outDir = null;
  return {
    name: "seo-build",
    configResolved(config) {
      root = config.root;
      outDir = path.resolve(config.root, config.build.outDir);
    },
    transformIndexHtml: (html) => transformHtml(html, locale),
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robotsTxt(locale) });
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: sitemapXml(locale, root) });
    },
    // Portada y fichas de juegos pre-armadas para buscadores (ver prerender.js).
    async closeBundle() {
      if (!outDir || !fs.existsSync(path.join(outDir, "index.html"))) return;
      const n = await prerender({ root, outDir, locale });
      console.log(`seo-build: ${n} paginas pre-armadas (${locale})`);
    },
    // En desarrollo tambien se pueden ver en /robots.txt y /sitemap.xml.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/robots.txt") return res.end(robotsTxt(locale));
        if (req.url === "/sitemap.xml") {
          res.setHeader("Content-Type", "application/xml");
          return res.end(sitemapXml(locale, root));
        }
        next();
      });
    },
  };
}
