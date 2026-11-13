import { useMemo } from "react";
import { useSelector } from "react-redux";
import { GAMES_CATALOG } from "./gamesCatalog";

/** Clave de site-content donde se guarda el orden elegido por admins/mods (lista de slugs en JSON). */
export const GAMES_ORDER_KEY = "games.order";

export function parseGameOrder(text) {
  try {
    const list = JSON.parse(text || "[]");
    return Array.isArray(list) ? list.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

/** Catalogo ordenado: primero los juegos en el orden guardado; los que no estan en la lista (juegos nuevos) siguen al final. */
export function sortGames(games, order) {
  if (!order.length) return games;
  const pos = new Map(order.map((slug, i) => [slug, i]));
  return games
    .map((g, i) => ({ g, i }))
    .sort((a, b) => {
      const pa = pos.has(a.g.slug) ? pos.get(a.g.slug) : order.length + a.i;
      const pb = pos.has(b.g.slug) ? pos.get(b.g.slug) : order.length + b.i;
      return pa - pb;
    })
    .map((x) => x.g);
}

/** GAMES_CATALOG en el orden que eligieron los admins (se actualiza al guardar, sin recargar). */
export function useOrderedGames() {
  const saved = useSelector((state) => state.siteContent[GAMES_ORDER_KEY]);
  const text = saved?.type === "text" ? saved.text : "";
  return useMemo(() => sortGames(GAMES_CATALOG, parseGameOrder(text)), [text]);
}
