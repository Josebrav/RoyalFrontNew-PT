// Noticias fijas a las que enlazan otras secciones (el id lo fija la migración que las publica en
// el backend). Se abren con /noticias?articulo=<id>.
export const POINTS_AND_TOURNAMENTS_NEWS_ID = "5f3c2a10-7b4e-4d8a-9c61-2e8f0a7d4b01";

export const newsArticlePath = (id) => `/noticias?articulo=${id}`;
