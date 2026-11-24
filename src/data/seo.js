import { getGameBySlug } from "./gamesCatalog";
import { LOCALE } from "../i18n/locale";
import { GAME_TEXTS } from "./gameTexts";
import { SITES, SITE_LOCALES, HREFLANG } from "./sites";

// Titulo y descripcion de cada pagina para buscadores y para la vista previa al compartir el link.
// Cada sitio usa los suyos: royaljuegos.com (espanol), royalgames.lat (portugues) y el de ingles.

const SITE = SITES[LOCALE] || SITES.es;
export const SITE_URL = SITE.url;
// royaljuegos.com se llama RoyalJuegos; los sitios en portugues (royalgames.lat) e ingles, RoyalGames.
export const SITE_NAME = SITE.name;

export const DEFAULT_SEO = {
  title: SITE.title,
  description: SITE.description,
};

const PAGE_SEO = {
  "/noticias": {
    title: "Noticias y torneos | RoyalJuegos",
    description: "Novedades, torneos, premios y juegos nuevos de RoyalJuegos, la comunidad de juegos online gratis.",
  },
  "/rangos": {
    title: "Rangos y niveles de jugador | RoyalJuegos",
    description: "Conocé los rangos de RoyalJuegos: cómo subir de nivel jugando y qué beneficios tiene cada rango.",
  },
  "/about": {
    title: "Quiénes somos | RoyalJuegos",
    description: "RoyalJuegos es una página de juegos online gratis hecha en Argentina: bingo, slots, ruleta, dominó y más.",
  },
  "/contacto": {
    title: "Contacto | RoyalJuegos",
    description: "Escribinos para consultas, sugerencias o soporte. El equipo de RoyalJuegos responde enseguida.",
  },
  "/preguntas-frecuentes": {
    title: "Preguntas frecuentes | RoyalJuegos",
    description: "Respuestas sobre fichas, cuentas, juegos, rangos y pagos en RoyalJuegos.",
  },
  "/terminos-y-condiciones": { title: "Términos y condiciones | RoyalJuegos" },
  "/privacidad": { title: "Política de privacidad | RoyalJuegos" },
  "/cumplimiento": { title: "Cumplimiento | RoyalJuegos" },
  "/trabaja-con-nosotros": { title: "Trabajá con nosotros | RoyalJuegos" },
};

// Texto pensado para buscadores de cada juego (lo que la gente escribe en Google).
export const GAME_SEO = {
  bingo: {
    title: "Bingo online gratis con chat en vivo | RoyalJuegos",
    description: "Jugá al bingo online gratis en salas con chat en vivo, cartones automáticos y premios en fichas. Jugalo con amigos desde el celular o la PC.",
  },
  "royal-ruleta": {
    title: "Ruleta online gratis | RoyalJuegos",
    description: "Ruleta online gratis con mesas compartidas. Apostá con fichas de regalo y jugá con otros jugadores en vivo.",
  },
  blackjack: {
    title: "Blackjack online gratis con mesas en vivo | RoyalJuegos",
    description: "Jugá blackjack online gratis en mesas compartidas con otros jugadores: vencé al crupier sin pasarte de 21. Fichas de regalo y chat en vivo.",
  },
  buraco: {
    title: "Buraco online gratis contra jugadores reales | RoyalJuegos",
    description: "Jugá al buraco online gratis en mesas 1 vs 1 o en parejas 2 vs 2, con canastas, muertos y chat en vivo. Armá tu mesa con las reglas que prefieras.",
  },
  domino: {
    title: "Dominó online gratis contra jugadores reales | RoyalJuegos",
    description: "Jugá dominó online gratis en mesas con jugadores reales, con chat y salas por apuesta. Partidas rápidas desde el celular o la PC.",
  },
  royalslots: {
    title: "Tragamonedas gratis online (Royal Slots) | RoyalJuegos",
    description: "Todas nuestras tragamonedas gratis en un solo lugar: tiradas gratis, bonos y comodines. Jugá slots online con fichas de regalo.",
  },
  "royal-joker": {
    title: "Royal Joker: tragamonedas clásica gratis | RoyalJuegos",
    description: "Royal Joker, la tragamonedas clásica de frutas y comodines con bono de cartas y tiradas gratis. Jugá gratis online.",
  },
  santawilds: {
    title: "Santa Wilds: tragamonedas navideña gratis | RoyalJuegos",
    description: "Santa Wilds, la tragamonedas de Navidad con comodines, tiradas gratis y multiplicadores. Jugala gratis online.",
  },
  sugarcalavera: {
    title: "Sugar Calavera: tragamonedas gratis | RoyalJuegos",
    description: "Sugar Calavera, la tragamonedas de calaveritas de azúcar con tiradas gratis y compra de bono. Jugá gratis online.",
  },
  furiaolimpo: {
    title: "Furia del Olimpo: tragamonedas de dioses griegos gratis | RoyalJuegos",
    description: "Furia del Olimpo, la tragamonedas de Zeus y los dioses del Olimpo con tiradas gratis y compra de bono. Jugá gratis online.",
  },
  gildedcobra: {
    title: "Gilded Cobra: tragamonedas del antiguo Egipto gratis | RoyalJuegos",
    description: "Gilded Cobra, la tragamonedas del antiguo Egipto con 720 formas de ganar, tiradas gratis y bono de huevos. Jugá gratis online.",
  },
  jokerwilds: {
    title: "Joker Wilds: tragamonedas del bufón gratis | RoyalJuegos",
    description: "Joker Wilds, la tragamonedas del bufón con coronas, cofres y gemas: 5 Joker pagan 2.000 veces la apuesta. Jugá gratis online.",
  },
  sweettreats: {
    title: "Sweet Treats: tragamonedas de bombones en cascada gratis | RoyalJuegos",
    description: "Sweet Treats, la tragamonedas de chocolates en cascada: 4 o más iguales explotan, multiplicadores y giros gratis. Jugá gratis online.",
  },
  gamerzone: {
    title: "Gamer Zone: tragamonedas arcade neón gratis | RoyalJuegos",
    description: "Gamer Zone, la tragamonedas arcade neón: 243 formas de ganar, giros gratis con WILD expansivo que cubre todo el rodillo. Jugá gratis online.",
  },
  oceanriches: {
    title: "Ocean Riches: tragamonedas de pesca gratis | RoyalJuegos",
    description: "Ocean Riches, la tragamonedas de pesca en el fondo del mar: peces con premio, el pescador que los recoge, giros gratis con marea y el bonus del cofre. Jugá gratis online.",
  },
  gomitas: {
    title: "Gomitas Espaciales: tragamonedas de ositos de gomita gratis | RoyalJuegos",
    description: "Gomitas Espaciales, la tragamonedas neón de ositos de gomita en el espacio: 243 formas de ganar, giros gratis con premios x3 y la máquina de gomitas. Jugá gratis online.",
  },
  "gema-of-gold": {
    title: "Gema of Gold: tragamonedas de gemas gratis | RoyalJuegos",
    description: "Gema of Gold, la tragamonedas de gemas y oro con premios y bonos. Jugá gratis online con fichas de regalo.",
  },
  bicho: {
    title: "Juego del Bicho online gratis | RoyalJuegos",
    description: "Jugá al Juego del Bicho online gratis: 25 animales, un sorteo cada minuto para todos y premios de 24 veces lo apostado.",
  },
  minas: {
    title: "Minas (Mines) online gratis | RoyalJuegos",
    description: "Jugá a Minas (Mines) online gratis: elegí casillas, evitá las bombas y multiplicá tus fichas. Retirate cuando quieras.",
  },
  "royal-pachinka": {
    title: "Pachinko online gratis (Royal Pachinka) | RoyalJuegos",
    description: "Royal Pachinka, el pachinko online gratis: soltá las bolas, mirá cómo rebotan y ganá multiplicadores.",
  },
  "royal-poker": {
    title: "Póker online gratis: Texas Hold'em con fichas | RoyalJuegos",
    description: "Jugá póker Texas Hold'em online gratis en mesas en vivo, con fichas de regalo y chat. Sin descargar, desde el celular o la PC.",
  },
  royalcats: {
    title: "Royal Cats: tragamonedas de gatos gratis | RoyalJuegos",
    description: "Royal Cats, la tragamonedas de gatos reales con joyas: 243 formas de ganar, giros gratis con WILD pegajosos y bonus de ovillos. Jugá gratis online.",
  },
  sweetfuturist: {
    title: "Sweet Futurist: tragamonedas de dulces neón gratis | RoyalJuegos",
    description: "Sweet Futurist, la tragamonedas de chocolates de neón: 243 formas de ganar, giros gratis con WILD pegajosos y bonus de regalos. Jugá gratis online.",
  },
};

/** Titulo, descripcion y si se debe indexar la ruta. */
export function seoForPath(pathname) {
  if (pathname === "/") return { ...DEFAULT_SEO, index: true };
  // Las paginas institucionales solo estan escritas en espanol: en los otros sitios no se indexan.
  if (PAGE_SEO[pathname]) {
    // Sus titulos estan en espanol: en los otros sitios usan el titulo general y no se indexan.
    if (LOCALE !== "es") return { ...DEFAULT_SEO, index: false };
    return { description: DEFAULT_SEO.description, ...PAGE_SEO[pathname], index: true };
  }
  const m = pathname.match(/^\/juegos\/([^/]+)$/);
  if (m) {
    const game = getGameBySlug(m[1]);
    if (game) {
      const custom = LOCALE === "es" ? GAME_SEO[game.slug] : GAME_TEXTS[LOCALE]?.[game.slug];
      return {
        title: custom?.title || `${game.name} | ${SITE_NAME}`,
        description: custom?.description || game.description || DEFAULT_SEO.description,
        index: game.status === "active",
      };
    }
  }
  // Paginas privadas (perfil, mensajes, juegos abiertos, admin...): titulo generico y sin indexar.
  return { ...DEFAULT_SEO, index: false };
}

/**
 * Titulo de la pagina (pestaña y renglon azul de Google): la marca primero, como pidio el dueño para la
 * pestaña, y despues de que trata la pagina. "Bingo online gratis | RoyalJuegos" -> "RoyalJuegos | Bingo online gratis".
 */
export function pageTitle(title) {
  if (!title) return SITE_NAME;
  if (title.startsWith(SITE_NAME)) return title;
  const suffix = " | " + SITE_NAME;
  const topic = title.endsWith(suffix) ? title.slice(0, -suffix.length) : title;
  return `${SITE_NAME} | ${topic}`;
}

/** La misma pagina en los otros idiomas (solo inicio y fichas de juegos, que existen en los 3 sitios). */
export function alternatesForPath(pathname) {
  const shared = pathname === "/" || /^\/juegos\/[^/]+$/.test(pathname);
  if (!shared) return [];
  const links = SITE_LOCALES.map((loc) => ({ hreflang: HREFLANG[loc], href: SITES[loc].url + pathname }));
  links.push({ hreflang: "x-default", href: SITES.es.url + pathname });
  return links;
}
