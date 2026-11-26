import { LOCALE } from "../i18n/locale";
import { GAME_TEXTS } from "./gameTexts";
import rjImage from "../assets/rj.png";
import minasImage from "../assets/minas2.png";
import pachinkaImage from "../assets/rpachinka2.png";
import bingoImage from "../assets/bingoproxi.png";
import ruletaImage from "../assets/ruleta.png";
import blackjackImage from "../assets/blackjack.jpg";
import pokerImage from "../assets/poker.jpg";
import bichoImage from "../assets/bicho.jpg";
import buracoImage from "../assets/buraco.jpg";
import triviaImage from "../assets/trivia.jpg";
import gemaOfGoldImage from "../assets/gemaOfGold.png";
import dominoImage from "../assets/domino.png";
import jokerWildsImage from "../assets/jokerwilds.jpg";
import sweetTreatsImage from "../assets/sweettreats.jpg";
import gomitasImage from "../assets/gomitas.jpg";
import oceanRichesImage from "../assets/oceanriches.jpg";
import gamerZoneImage from "../assets/gamerzone.jpg";
import royalCatsImage from "../assets/royalcats.jpg";
import sweetFuturistImage from "../assets/sweetfuturist.jpg";
import chinchonImage from "../assets/chinchon.jpg";

// `chipClassName` es la misma paleta pero como píldora (fondo + borde translúcidos), para donde
// la categoría necesita notarse de un vistazo (ej. la grilla de "Juegos Populares" del Home) en
// vez de un simple texto de color — `className` (solo texto) sigue igual para no tocar los demás
// usos ya existentes (GamesCatalog, GameDetail, etc.).
// accent/accentTo: colores de la categoría para paneles de cada juego (ej. "Top Ganadores"), así no
// todo el sitio es dorado sobre negro. El dorado queda para la marca y los botones de jugar.
export const CATEGORY_META = {
  bingo: { label: "Bingo", className: "text-[#c9a84c]", chipClassName: "bg-[#c9a84c]/15 text-[#c9a84c] border border-[#c9a84c]/40", accent: "#f97316", accentTo: "#c2410c" },
  casino: { label: "Clásicos", className: "text-[#e05252]", chipClassName: "bg-[#e05252]/15 text-[#e05252] border border-[#e05252]/40", accent: "#ef4444", accentTo: "#9f1239" },
  cartas: { label: "Cartas", className: "text-[#4f8fe0]", chipClassName: "bg-[#4f8fe0]/15 text-[#4f8fe0] border border-[#4f8fe0]/40", accent: "#3b82f6", accentTo: "#1e3a8a" },
  otros: { label: "Otros", className: "text-[#4caf7d]", chipClassName: "bg-[#4caf7d]/15 text-[#4caf7d] border border-[#4caf7d]/40", accent: "#22c55e", accentTo: "#0f766e" },
  slots: { label: "Slots", className: "text-[#a855f7]", chipClassName: "bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/40", accent: "#a855f7", accentTo: "#4c1d95" },
  mesa: { label: "Mesa", className: "text-[#2dd4bf]", chipClassName: "bg-[#2dd4bf]/15 text-[#2dd4bf] border border-[#2dd4bf]/40", accent: "#14b8a6", accentTo: "#155e75" },
};

export const CATEGORY_ORDER = ["bingo", "casino", "cartas", "otros", "slots", "mesa"];

/**
 * Static game catalog for the lobby list on Home. Not backend-driven (there's no
 * category/description/image field on the backend Game entity, which only exists
 * today for the favorites relationship) — same hardcoded-catalog pattern already
 * used by GameGrid's GAMES array and Home's featuredGames array.
 */
export const GAMES_CATALOG = [
  {
    slug: "royal-joker",
    name: "Royal Joker",
    category: "slots",
    status: "active",
    image: rjImage,
    icon: "mood",
    players: 1476,
    playPath: "/game/royaljoker",
    description:
      "Una tragamonedas con temática de comodines llena de multiplicadores y rondas especiales. Gira los rodillos y deja que el Joker reparta la suerte.",
  },
  {
    slug: "minas",
    name: "Minas",
    category: "otros",
    status: "active",
    image: minasImage,
    icon: "grid_view",
    players: 3349,
    playPath: "/game/minas",
    // Matches the pre-existing backend Game row so favorites saved before the catalog
    // rework aren't lost.
    favoriteId: "501ffe04-71e2-44c9-a06a-f97df1babd0a",
    description:
      "Revela casillas en una grilla y evita las minas ocultas para multiplicar tu apuesta. Cuanto más avances, mayor será tu premio... si te arriesgas.",
  },
  {
    slug: "royal-pachinka",
    name: "Royal Pachinka",
    category: "otros",
    status: "active",
    image: pachinkaImage,
    icon: "casino",
    players: 2004,
    playPath: "/game/royalpachinka",
    favoriteId: "d9c2b8f0-7e6a-4c9a-9a2b-1f3e5a2b6c7d",
    description:
      "El clásico juego de pachinko con estilo Royal: deja caer la bola y observa cómo rebota entre los pines hasta encontrar tu multiplicador.",
  },
  {
    slug: "royalslots",
    name: "Royal Slots",
    category: "slots",
    status: "active",
    icon: "diamond",
    players: 1650,
    playPath: "/game/royalslots",
    // Sigue activo y jugable (/juegos, GameDetail, etc.) — solo se lo saca de la grilla de
    // "Juegos Populares" del Home para hacerle lugar a Domino y Gema of Gold (tope de 8 tarjetas).
    showOnHome: false,
    description:
      "La tragamonedas clásica de RoyalGames: rodillos cargados de símbolos dorados, multiplicadores y la chance de llevarte el premio mayor en cualquier giro.",
  },
  {
    slug: "santawilds",
    name: "Santa Wilds",
    category: "slots",
    status: "active",
    icon: "ac_unit",
    players: 1820,
    playPath: "/game/santawilds",
    description:
      "Tragamonedas navideña con símbolos wild que se expanden y multiplican tus ganancias. Encontrá a Santa y desbloqueá rondas bonus llenas de regalos.",
  },
  {
    slug: "sugarcalavera",
    name: "Sugar Calavera",
    category: "slots",
    status: "active",
    icon: "cookie",
    players: 1290,
    playPath: "/game/sugarcalavera",
    description:
      "Tragamonedas con temática de calaveritas de azúcar: símbolos dulces, colores vibrantes y multiplicadores que celebran la buena suerte.",
  },
  {
    slug: "furiaolimpo",
    name: "Furia del Olimpo",
    category: "slots",
    status: "active",
    icon: "bolt",
    players: 0,
    playPath: "/game/furiaolimpo",
    description:
      "Tragamonedas de los dioses griegos: Zeus, Poseidón, Ares y Apolo en el Olimpo. Tres Zeus dan tiradas gratis, o compralas directo.",
  },
  {
    slug: "gildedcobra",
    name: "Gilded Cobra",
    category: "slots",
    status: "active",
    icon: "pets",
    players: 0,
    playPath: "/game/gildedcobra",
    description:
      "Tragamonedas del antiguo Egipto con rodillos escalonados y 720 formas de ganar. Tres scatter dan tiradas gratis y el bonus de los huevos suma multiplicadores.",
  },
  {
    slug: "jokerwilds",
    name: "Joker Wilds",
    category: "slots",
    status: "active",
    image: jokerWildsImage,
    icon: "theater_comedy",
    players: 0,
    playPath: "/game/jokerwilds",
    description:
      "Tragamonedas del bufón: 5 rodillos con Joker, coronas, cofres y gemas. Cada símbolo paga en rodillos seguidos desde el primero, en cualquier fila; 5 Joker pagan 2.000 veces la apuesta.",
  },
  {
    slug: "sweettreats",
    name: "Sweet Treats",
    category: "slots",
    status: "active",
    image: sweetTreatsImage,
    icon: "cake",
    players: 0,
    playPath: "/game/sweettreats",
    description:
      "Tragamonedas de bombones en cascada: 4 o más iguales en cualquier lugar explotan y caen nuevos. Los multiplicadores multiplican el premio y 3 FREE SPIN dan 10 giros gratis.",
  },
  {
    slug: "gomitas",
    name: "Gomitas Espaciales",
    category: "slots",
    status: "active",
    image: gomitasImage,
    icon: "rocket_launch",
    players: 0,
    playPath: "/game/gomitas",
    description:
      "Tragamonedas neón de ositos de gomita en el espacio: 243 formas de ganar. 3 platillos dan giros gratis con premios x3 y 3 máquinas abren el bonus de la máquina de gomitas.",
  },
  {
    slug: "oceanriches",
    name: "Ocean Riches",
    category: "slots",
    status: "active",
    image: oceanRichesImage,
    icon: "sailing",
    players: 0,
    playPath: "/game/oceanriches",
    description:
      "Tragamonedas de pesca en el fondo del mar: 243 formas de ganar. Los peces traen premios y el pescador los recoge; el pelícano los multiplica, la marea sube en los giros gratis y 3 cofres abren la pesca en el fondo.",
  },
  {
    slug: "gamerzone",
    name: "Gamer Zone",
    category: "slots",
    status: "active",
    image: gamerZoneImage,
    icon: "sports_esports",
    players: 0,
    playPath: "/game/gamerzone",
    description:
      "Tragamonedas neón arcade: 243 formas de ganar con controles, consolas y máquinas de arcade. 3 estrellas SCATTER dan giros gratis donde el WILD se expande y cubre todo el rodillo.",
  },
  {
    slug: "bingo",
    name: "Royal Bingo",
    category: "bingo",
    status: "active",
    image: bingoImage,
    icon: "grid_on",
    players: 2210,
    playPath: "/game/bingo",
    description:
      "El bingo de toda la vida, ahora en salas en vivo con otros jugadores de RoyalGames. Canta línea, canta bingo y gana el pozo.",
  },
  {
    slug: "video-bingo",
    name: "Video Bingo",
    category: "bingo",
    status: "soon",
    icon: "live_tv",
    description:
      "La velocidad del video bingo: cartones automáticos, rondas rápidas y bonos especiales sin esperar a que se llene la sala.",
  },
  {
    slug: "jogo-do-bicho",
    name: "Jogo do Bicho",
    category: "bingo",
    status: "soon",
    icon: "pets",
    description:
      "La tradicional lotería de animales llega a RoyalGames. Elige tu bicho de la suerte y apuesta a que sea el ganador del sorteo.",
  },
  {
    slug: "bicho",
    showOnHome: false,
    name: "Juego del Bicho",
    category: "casino",
    status: "soon",
    image: bichoImage,
    icon: "pets",
    players: 0,
    playPath: "/game/bicho",
    description:
      "Elegí entre 25 animales y esperá el sorteo: cada minuto gira el bolillero para todos. Si sale tu animal, ganás 24 veces lo apostado.",
  },
  {
    slug: "royal-ruleta",
    name: "Royal Ruleta",
    category: "casino",
    status: "active",
    image: ruletaImage,
    icon: "donut_large",
    players: 1120,
    // En el sitio en portugues la direccion es /game/royalroleta (las dos abren la ruleta)
    playPath: LOCALE === "pt" ? "/game/royalroleta" : "/game/royalruleta",
    playPathAliases: ["/game/royalruleta", "/game/royalroleta"],
    description:
      "Ruleta europea con mesas compartidas. Apuesta a tu número, color o docena favorita y deja girar la rueda.",
  },
  {
    slug: "crazy-time-royal",
    name: "Crazy Time Royal",
    category: "casino",
    status: "soon",
    icon: "celebration",
    description:
      "Nuestra rueda de la fortuna en vivo, con rondas bonus, multiplicadores gigantes y toda la energía de un game show en tiempo real.",
  },
  {
    slug: "blackjack",
    name: "Blackjack",
    category: "casino",
    status: "active",
    image: blackjackImage,
    icon: "style",
    players: 0,
    playPath: "/game/blackjack",
    description:
      "El clásico 21: vence al crupier sin pasarte de 21 puntos. Estrategia, cartas y la adrenalina de la mesa de blackjack.",
  },
  {
    slug: "uno",
    name: "UNO",
    category: "cartas",
    status: "soon",
    icon: "sports_esports",
    description:
      "El juego de cartas favorito de todos, ahora contra otros jugadores de RoyalGames. Quédate sin cartas antes que nadie y grita ¡UNO!",
  },
  {
    slug: "royal-poker",
    name: "Poker Texas Hold'em",
    category: "cartas",
    status: "active",
    image: pokerImage,
    icon: "casino",
    players: 0,
    playPath: "/game/poker",
    description:
      "El Texas Hold'em de siempre, con la mesa de RoyalGames: leé a tus rivales, armá tu jugada y llevate el pozo.",
  },
  {
    slug: "truco-argentino",
    name: "Truco Argentino",
    category: "cartas",
    status: "soon",
    icon: "style",
    description:
      "El clásico de los bares argentinos llega a RoyalGames: envido, truco y mucho bluff con la baraja española de toda la vida.",
  },
  {
    slug: "trivia",
    name: "Trivia Royal",
    category: "otros",
    status: "active",
    image: triviaImage,
    icon: "quiz",
    players: 0,
    playPath: "/game/trivia",
    description:
      "Preguntas de fútbol, historia, cine, música, ciencia y mucho más: elegí la categoría, respondé antes de que se acabe el tiempo y ganá fichas según la dificultad.",
  },
  {
    slug: "buraco",
    name: "Buraco",
    category: "cartas",
    status: "active",
    image: buracoImage,
    icon: "extension",
    players: 0,
    playPath: "/game/buraco",
    description:
      "Armá tríos y escaleras antes que tus rivales en este clásico de mesa sudamericano, ahora online contra otros jugadores de RoyalGames.",
  },
  {
    slug: "royalcats",
    name: "Royal Cats",
    category: "slots",
    status: "active",
    image: royalCatsImage,
    icon: "pets",
    players: 0,
    playPath: "/game/royalcats",
    description:
      "Gatos reales llenos de joyas: 243 formas de ganar, giros gratis con WILD que quedan pegados y un bonus de ovillos para elegir premios.",
  },
  {
    slug: "sweetfuturist",
    name: "Sweet Futurist",
    category: "slots",
    status: "active",
    image: sweetFuturistImage,
    icon: "rocket_launch",
    players: 0,
    playPath: "/game/sweetfuturist",
    description:
      "Chocolates de neón en una ciudad del futuro: 243 formas de ganar, giros gratis con WILD que quedan pegados y un bonus de regalos neón con multiplicadores.",
  },
  {
    slug: "chinchon",
    name: "Chinchón",
    category: "cartas",
    status: "active",
    image: chinchonImage,
    icon: "style",
    players: 0,
    playPath: "/game/chinchon",
    description:
      "El clásico juego de cartas españolas: armá escaleras y grupos, cortá a tiempo y buscá el chinchón.",
  },
  {
    slug: "pearl-empires",
    showOnHome: false,
    name: "Pearl Empires",
    category: "slots",
    status: "soon",
    icon: "castle",
    description:
      "Construí tu imperio de perlas y tesoros en esta tragamonedas de reinos antiguos, con rondas de bonificación dignas de la realeza.",
  },
  {
    slug: "royal-gods",
    showOnHome: false,
    name: "RoyalGods",
    category: "slots",
    status: "soon",
    icon: "auto_awesome",
    description:
      "Mitología y fortuna se combinan: invocá a los dioses de RoyalGames para desatar multiplicadores divinos en cada giro.",
  },
  {
    slug: "royal-futbol",
    showOnHome: false,
    name: "RoyalFutbol",
    category: "slots",
    status: "soon",
    icon: "sports_soccer",
    description:
      "La pasión del fútbol convertida en tragamonedas: símbolos de gol, penales de bonificación y la emoción del clásico en cada tirada.",
  },
  {
    slug: "gema-of-gold",
    name: "Gema of Gold",
    category: "slots",
    status: "active",
    image: gemaOfGoldImage,
    icon: "diamond",
    players: 980,
    playPath: "/game/gemaofgold",
    description:
      "Gemas brillantes y cascadas de oro: una tragamonedas clásica con multiplicadores en cadena para los amantes de lo simple y lo dorado.",
  },
  {
    slug: "domino",
    name: "Dominó",
    category: "mesa",
    status: "active",
    image: dominoImage,
    icon: "view_module",
    players: 860,
    playPath: "/game/domino",
    description:
      "El clásico de fichas de toda la vida, ahora online: encadená tus números y dejá a tus rivales sin jugadas.",
  },
  {
    slug: "parchis",
    name: "Parchís",
    category: "mesa",
    status: "soon",
    icon: "flag",
    playPath: "/game/parchis",
    description:
      "Tirá los dados y llevá tus fichas a casa antes que nadie, en el clásico juego de mesa familiar ahora en RoyalGames.",
  },
  {
    slug: "royal-palabras",
    name: "Royal Palabras",
    category: "mesa",
    status: "soon",
    icon: "abc",
    description:
      "Armá las mejores palabras y sumá puntos contra otros jugadores en este clásico de letras con la mesa de RoyalGames.",
  },
  {
    slug: "damas",
    name: "Damas",
    category: "mesa",
    status: "soon",
    icon: "grid_on",
    description:
      "El juego de tablero de siempre: comé las fichas de tu rival y coroná tus damas para dominar el tablero.",
  },
  {
    slug: "ajedrez",
    name: "Ajedrez",
    category: "mesa",
    status: "soon",
    icon: "psychology",
    description:
      "El juego de estrategia por excelencia llega a RoyalGames: planeá tus jugadas y dale jaque mate a tu rival.",
  },
];

// En los sitios en ingles/portugues cada juego muestra su descripcion traducida (la de arriba es la de espanol).
for (const game of GAMES_CATALOG) {
  const text = GAME_TEXTS[LOCALE]?.[game.slug];
  if (text?.description) game.description = text.description;
}

export const getGameBySlug = (slug) => GAMES_CATALOG.find((game) => game.slug === slug);

/** La app (Android) manda su actividad como "app:" + la misma ruta de la web, ej. "app:/game/bingo". */
export const isAppActivity = (path) => typeof path === "string" && path.startsWith("app:");
export const stripAppPrefix = (path) => (isAppActivity(path) ? path.slice(4) : path);

export const getGameByPlayPath = (rawPath) => {
  const path = stripAppPrefix(rawPath);
  return GAMES_CATALOG.find((game) => game.playPath === path || (game.playPathAliases || []).includes(path));
};

export const getGamesByCategory = (category) =>
  GAMES_CATALOG.filter((game) => game.category === category);

/**
 * Jugadores que se muestran en las tarjetas y en la página de cada juego. Los "players" del
 * catálogo son un peso fijo, no gente real: los juegos sin número muestran entre 10 y 20, y los
 * de miles se bajan a algo creíble (aprox. 30 a 80). Varía un poco cada 10 minutos, igual para
 * todos los jugadores, así no salta en cada recarga.
 */
export const getDisplayedPlayers = (game) => {
  if (!game) return 0;
  const slug = String(game.slug || game.name || "");
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  const window = Math.floor(Date.now() / (10 * 60 * 1000));
  const jitter = (Math.abs(hash + window * 2654435761) % 7) - 3; // -3..+3
  const base = Number(game.players) || 0;
  if (base <= 0) return 15 + Math.round((jitter * 5) / 3); // 10..20
  return Math.max(21, Math.round(20 + base / 55) + jitter);
};
