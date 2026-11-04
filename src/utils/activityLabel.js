import { getGameByPlayPath } from "../data/gamesCatalog";

// Paginas del sitio (no juegos) con nombre legible para el panel de admin.
const PAGE_LABELS = {
  "/": "Inicio",
  "/juegos": "Catálogo de juegos",
  "/perfil": "Su perfil",
  "/amigos": "Amigos",
  "/mensajes": "Mensajes",
  "/chips": "Comprar fichas",
  "/royalstore": "Vestidor",
  "/noticias": "Noticias",
  "/rangos": "Rangos",
  "/ayuda": "Ayuda",
  "/contacto": "Contacto",
  "/preguntas-frecuentes": "Preguntas frecuentes",
};

/**
 * Traduce users.currentActivity (la ruta donde estaba en su ultimo latido) a algo legible:
 * { label, isGame }. Los juegos salen del catalogo; las rutas de admin y de perfiles ajenos se agrupan.
 */
export function activityLabel(path) {
  if (!path) return { label: "—", isGame: false };
  const game = getGameByPlayPath(path);
  if (game) return { label: game.name, isGame: true };
  if (path.startsWith("/game/")) return { label: path.slice(6), isGame: true };
  if (PAGE_LABELS[path]) return { label: PAGE_LABELS[path], isGame: false };
  if (path.startsWith("/perfil/")) return { label: `Viendo perfil de ${decodeURIComponent(path.slice(8))}`, isGame: false };
  if (path.startsWith("/mensajes/")) return { label: `Chateando con ${decodeURIComponent(path.slice(10))}`, isGame: false };
  if (path.startsWith("/juegos/")) return { label: "Viendo un juego", isGame: false };
  if (path.startsWith("/ayuda/")) return { label: "Ayuda (ticket)", isGame: false };
  if (path.startsWith("/admin")) return { label: "Panel de admin", isGame: false };
  return { label: path, isGame: false };
}

export function timeAgo(dateString) {
  if (!dateString) return "nunca";
  const minutes = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
  if (minutes < 1) return "justo ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 60) return `hace ${days} d`;
  return `hace ${Math.floor(days / 30)} meses`;
}
