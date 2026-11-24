// Paginas pre-armadas para buscadores: despues de compilar, la portada y la ficha de cada juego activo
// se escriben como HTML con su titulo, descripcion, canonical, enlaces a los otros idiomas y el texto
// de la pagina dentro de #root. Google (y Bing, WhatsApp, Facebook) leen todo sin ejecutar JavaScript.
// Para el jugador no cambia nada: React arranca y reemplaza ese contenido por la pagina de siempre.
//
// Archivos que genera en dist/:
//   index.html              portada con su contenido
//   juegos/<slug>/index.html ficha de cada juego activo
//   spa.html                el index.html vacio de siempre, para todas las demas rutas (ver vercel.json)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { SITES } from "./src/data/sites.js";

const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif", ".PNG", ".JPG", ".JPEG", ".WEBP", ".GIF"];

/** Carga catalogo, textos y SEO del sitio con el idioma ya fijado (las imagenes no hacen falta). */
async function loadSiteData(root, locale) {
  const abs = (p) => JSON.stringify(path.join(root, p).replace(/\\/g, "/"));
  const entry = [
    `export { GAMES_CATALOG, CATEGORY_ORDER } from ${abs("src/data/gamesCatalog.js")};`,
    `export { gameFaqFor } from ${abs("src/data/gameFaq.js")};`,
    `export { seoForPath, pageTitle, alternatesForPath, SITE_URL, SITE_NAME } from ${abs("src/data/seo.js")};`,
    `export { t } from ${abs("src/i18n/strings.js")};`,
  ].join("\n");
  const outfile = path.join(os.tmpdir(), `royal-prerender-${locale}-${process.pid}.mjs`);
  await build({
    stdin: { contents: entry, resolveDir: root, loader: "js" },
    bundle: true,
    format: "esm",
    platform: "node",
    outfile,
    logLevel: "silent",
    loader: Object.fromEntries(IMAGE_EXT.map((ext) => [ext, "empty"])),
    define: { "import.meta.env": JSON.stringify({ VITE_SITE_LOCALE: locale }) },
  });
  try {
    return await import(pathToFileURL(outfile).href + `?t=${Date.now()}`);
  } finally {
    fs.rmSync(outfile, { force: true });
  }
}

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Script JSON-LD seguro dentro de HTML. */
const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

const UI = {
  es: { games: "Juegos online gratis", faq: "Preguntas frecuentes sobre", back: "Ver todos los juegos", play: "Jugar gratis", soon: "Próximamente" },
  pt: { games: "Jogos online grátis", faq: "Perguntas frequentes sobre", back: "Ver todos os jogos", play: "Jogar grátis", soon: "Em breve" },
  en: { games: "Free online games", faq: "Frequently asked questions about", back: "See all games", play: "Play for free", soon: "Coming soon" },
};

// Estilos minimos en linea: lo que se ve el instante antes de que arranque React (fondo oscuro y dorado).
const WRAP = 'style="max-width:960px;margin:0 auto;padding:96px 16px 48px;color:#e5e2e1;font-family:Inter,system-ui,sans-serif;line-height:1.6"';
const H1 = 'style="color:#e6c364;font-size:2rem;line-height:1.2;margin:0 0 12px"';
const H2 = 'style="color:#ffffff;font-size:1.25rem;margin:32px 0 12px"';
const LINK = 'style="color:#e6c364"';

/** Reemplaza titulo, descripcion, canonical, vista previa y hreflang del HTML base para una pagina. */
function withHead(html, { title, description, url, alternates, index }) {
  let out = html;
  const setMeta = (attr, key, value) => {
    const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
    out = out.replace(re, `$1${esc(value)}$2`);
  };
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  setMeta("name", "description", description);
  setMeta("name", "robots", index ? "index, follow" : "noindex, follow");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", url);
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  out = out.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${esc(url)}$2`);
  // hreflang de esta pagina (el HTML base trae los de la portada)
  out = out.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*" \/>/g, "");
  const links = alternates.map((a) => `    <link rel="alternate" hreflang="${a.hreflang}" href="${esc(a.href)}" />`).join("\n");
  out = out.replace("</head>", `${links}\n  </head>`);
  return out;
}

const withRoot = (html, content) => html.replace('<div id="root"></div>', `<div id="root">${content}</div>`);

function homeContent(d, locale) {
  const site = SITES[locale];
  const ui = UI[locale];
  const active = d.GAMES_CATALOG.filter((g) => g.status === "active");
  const items = active
    .map((g) => `<li style="margin:0 0 10px"><a href="/juegos/${esc(g.slug)}" ${LINK}><strong>${esc(g.name)}</strong></a> — ${esc(g.description)}</li>`)
    .join("");
  return `<main ${WRAP}><h1 ${H1}>${esc(site.title)}</h1><p>${esc(site.description)}</p><h2 ${H2}>${esc(ui.games)}</h2><ul style="padding-left:18px">${items}</ul></main>`;
}

function gameContent(d, locale, game) {
  const ui = UI[locale];
  const extra = d.gameFaqFor(game, locale);
  const about = (extra?.about || []).map((p) => `<p>${esc(p)}</p>`).join("");
  const faq = extra?.faq?.length
    ? `<h2 ${H2}>${esc(ui.faq)} ${esc(game.name)}</h2>` +
      extra.faq.map((f) => `<h3 style="color:#fff;font-size:1rem;margin:16px 0 4px">${esc(f.q)}</h3><p style="margin:0">${esc(f.a)}</p>`).join("") +
      jsonLd({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: extra.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      })
    : "";
  const others = d.GAMES_CATALOG.filter((g) => g.status === "active" && g.slug !== game.slug)
    .map((g) => `<a href="/juegos/${esc(g.slug)}" ${LINK}>${esc(g.name)}</a>`)
    .join(" · ");
  return (
    `<main ${WRAP}><p><a href="/" ${LINK}>${esc(d.SITE_NAME)}</a></p>` +
    `<h1 ${H1}>${esc(game.name)}</h1><p>${esc(game.description)}</p>${about}${faq}` +
    `<h2 ${H2}>${esc(ui.back)}</h2><p>${others}</p></main>`
  );
}

/** Escribe las paginas pre-armadas en outDir a partir del index.html ya compilado. */
export async function prerender({ root, outDir, locale }) {
  const indexPath = path.join(outDir, "index.html");
  const base = fs.readFileSync(indexPath, "utf8");
  const d = await loadSiteData(root, locale);

  // Todas las rutas que no tienen pagina propia usan el HTML vacio de siempre.
  fs.writeFileSync(path.join(outDir, "spa.html"), base);

  const homeSeo = d.seoForPath("/");
  const home = withHead(base, {
    title: d.pageTitle(homeSeo.title),
    description: homeSeo.description,
    url: d.SITE_URL + "/",
    alternates: d.alternatesForPath("/"),
    index: true,
  });
  fs.writeFileSync(indexPath, withRoot(home, homeContent(d, locale)));

  let count = 1;
  for (const game of d.GAMES_CATALOG.filter((g) => g.status === "active")) {
    const pathname = `/juegos/${game.slug}`;
    const seo = d.seoForPath(pathname);
    const html = withHead(base, {
      title: d.pageTitle(seo.title),
      description: seo.description,
      url: d.SITE_URL + pathname,
      alternates: d.alternatesForPath(pathname),
      index: seo.index,
    });
    const dir = path.join(outDir, "juegos", game.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), withRoot(html, gameContent(d, locale, game)));
    count++;
  }
  return count;
}
