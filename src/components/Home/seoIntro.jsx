import { Link } from "react-router-dom";
import { GAMES_CATALOG } from "../../data/gamesCatalog";
import { GAME_SEO } from "../../data/seo";

// Texto de la portada para visitantes: le explica a Google (y a quien llega por primera vez) que
// es el sitio y enlaza la ficha publica de cada juego (/juegos/:slug).
export default function SeoIntro() {
  const games = GAMES_CATALOG.filter((g) => g.status === "active");
  return (
    <section className="py-20 px-6 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-white font-bold text-2xl md:text-3xl tracking-tight mb-6 text-balance">
          Juegos online gratis: bingo, tragamonedas, ruleta y dominó
        </h2>
        <div className="space-y-4 text-on-surface-variant leading-relaxed max-w-[68ch]">
          <p>
            RoyalJuegos es una comunidad de juegos online gratis para jugar desde el celular o la computadora,
            sin descargar nada. Al crear tu cuenta recibís fichas de regalo y todos los días podés cobrar un bono
            diario para seguir jugando.
          </p>
          <p>
            Jugá al <strong className="text-white">bingo online</strong> en salas con chat en vivo, probá nuestras{" "}
            <strong className="text-white">tragamonedas gratis</strong> con tiradas gratis y bonos, apostá en la{" "}
            <strong className="text-white">ruleta online</strong> o sentate en una mesa de{" "}
            <strong className="text-white">dominó online</strong> contra jugadores reales. Sumá puntos, subí de
            rango y competí en los rankings y torneos con jugadores de toda Latinoamérica.
          </p>
          <p>
            Las fichas son solo para jugar y divertirse dentro del sitio: no se cambian por dinero.
          </p>
        </div>

        <h3 className="text-white font-bold text-xl mt-10 mb-4">Nuestros juegos</h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {games.map((g) => (
            <li key={g.slug}>
              <Link to={`/juegos/${g.slug}`} className="text-primary font-bold hover:underline">
                {g.name}
              </Link>
              <p className="text-on-surface-variant text-sm leading-snug">
                {GAME_SEO[g.slug]?.description || g.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
