import { getGameBySlug } from "./gamesCatalog";

// Titulo y descripcion de cada pagina para buscadores y para la vista previa al compartir el link.
// Solo el sitio en espanol (royaljuegos.com); los sitios en ingles/portugues usan el titulo generico.

export const SITE_URL = "https://www.royaljuegos.com";
export const SITE_NAME = "RoyalJuegos";

export const DEFAULT_SEO = {
  title: "RoyalJuegos | Bingo, tragamonedas, ruleta y dominó online gratis",
  description:
    "Jugá gratis online a bingo, tragamonedas, ruleta, dominó y minas con fichas de regalo. Chat en vivo, rankings y torneos con jugadores de toda Latinoamérica.",
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
  "gema-of-gold": {
    title: "Gema of Gold: tragamonedas de gemas gratis | RoyalJuegos",
    description: "Gema of Gold, la tragamonedas de gemas y oro con premios y bonos. Jugá gratis online con fichas de regalo.",
  },
  minas: {
    title: "Minas (Mines) online gratis | RoyalJuegos",
    description: "Jugá a Minas (Mines) online gratis: elegí casillas, evitá las bombas y multiplicá tus fichas. Retirate cuando quieras.",
  },
  "royal-pachinka": {
    title: "Pachinko online gratis (Royal Pachinka) | RoyalJuegos",
    description: "Royal Pachinka, el pachinko online gratis: soltá las bolas, mirá cómo rebotan y ganá multiplicadores.",
  },
};

/** Titulo, descripcion y si se debe indexar la ruta. */
export function seoForPath(pathname) {
  if (pathname === "/") return { ...DEFAULT_SEO, index: true };
  if (PAGE_SEO[pathname]) return { description: DEFAULT_SEO.description, ...PAGE_SEO[pathname], index: true };
  const m = pathname.match(/^\/juegos\/([^/]+)$/);
  if (m) {
    const game = getGameBySlug(m[1]);
    if (game) {
      const custom = GAME_SEO[game.slug];
      return {
        title: custom?.title || `${game.name} online gratis | RoyalJuegos`,
        description: custom?.description || game.description || DEFAULT_SEO.description,
        index: game.status === "active",
      };
    }
  }
  // Paginas privadas (perfil, mensajes, juegos abiertos, admin...): titulo generico y sin indexar.
  return { ...DEFAULT_SEO, index: false };
}
