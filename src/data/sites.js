// Los 3 sitios (un solo codigo, un deploy de Vercel por idioma con VITE_SITE_LOCALE). Este archivo
// no importa nada para que lo pueda usar tambien vite.config.js al generar index.html, robots.txt
// y sitemap.xml de cada sitio.
// Si el sitio en ingles pasa a tener dominio propio, cambiar solo `url` de `en` aca.
export const SITES = {
  es: {
    url: "https://www.royaljuegos.com",
    name: "RoyalJuegos",
    lang: "es",
    ogLocale: "es_AR",
    title: "RoyalJuegos | Bingo, tragamonedas, ruleta y dominó online gratis",
    description:
      "Juegos de casino gratis online: bingo, tragamonedas, ruleta, póker, blackjack, dominó y buraco con fichas de regalo. Sin descargar, con chat en vivo y torneos.",
    shareDescription: "Jugá gratis online a bingo, tragamonedas, ruleta, dominó y minas con fichas de regalo. Chat en vivo, rankings y torneos.",
    keywords:
      "juegos online gratis, bingo online, bingo gratis, tragamonedas gratis, slots online, ruleta online, dominó online, póker online gratis, blackjack online, buraco online, minas, pachinko, royal juegos",
  },
  pt: {
    url: "https://www.royalgames.lat",
    name: "RoyalGames",
    lang: "pt-BR",
    ogLocale: "pt_BR",
    title: "RoyalGames | Bingo, caça-níqueis, roleta e dominó online grátis",
    description:
      "Jogos de cassino grátis online: bingo, caça-níqueis, roleta, pôquer, blackjack, dominó e buraco com fichas de presente. Sem baixar, com chat ao vivo e torneios.",
    shareDescription: "Jogue grátis online bingo, caça-níqueis, roleta, dominó e buraco com fichas de presente. Chat ao vivo, rankings e torneios.",
    keywords:
      "jogos online grátis, bingo online, bingo grátis, caça-níqueis grátis, slots online, roleta online, dominó online, pôquer online grátis, blackjack online, buraco online, royal games",
  },
  en: {
    url: "https://www.royal-games.fun",
    name: "RoyalGames",
    lang: "en",
    ogLocale: "en_US",
    title: "RoyalGames | Free online bingo, slots, roulette and dominoes",
    description:
      "Free online casino games: bingo, slots, roulette, poker, blackjack, dominoes and more with free chips. No download, live chat and tournaments.",
    shareDescription: "Play free online bingo, slots, roulette, dominoes and poker with free chips. Live chat, leaderboards and tournaments.",
    keywords:
      "free online games, online bingo, free bingo, free slots, online slots, online roulette, online dominoes, free poker, online blackjack, social casino, royal games",
  },
};

export const SITE_LOCALES = Object.keys(SITES);

/** Codigo hreflang de cada sitio (Google lo usa para mostrar a cada persona el sitio de su idioma). */
export const HREFLANG = { es: "es", pt: "pt", en: "en" };

/** Rutas publicas que existen en los 3 sitios (ademas de /juegos/<slug> de cada juego activo). */
export const SHARED_PATHS = ["/"];

/** Paginas publicas extra que solo estan escritas en espanol (solo van al sitemap de royaljuegos.com). */
export const ES_ONLY_PATHS = [
  "/noticias",
  "/rangos",
  "/preguntas-frecuentes",
  "/about",
  "/contacto",
  "/terminos-y-condiciones",
  "/privacidad",
];
