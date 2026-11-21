import { Link } from "react-router-dom";
import { GAMES_CATALOG } from "../../data/gamesCatalog";
import { GAME_SEO } from "../../data/seo";

// Preguntas frecuentes con las frases que la gente busca en Google. Se ven en la portada (cerradas,
// se abren al tocar) y van tambien como datos estructurados FAQPage. Texto visible, nada oculto:
// Google penaliza el texto escondido.
const FAQ = [
  {
    q: "¿Dónde puedo jugar bingo online gratis?",
    a: "En RoyalJuegos jugás al bingo online gratis desde el celular o la PC, en salas con chat en vivo y sin descargar nada. Solo necesitás crear tu cuenta.",
  },
  {
    q: "¿Hay tragamonedas gratis para jugar sin descargar?",
    a: "Sí. Royal Slots reúne nuestras tragamonedas gratis (Royal Joker, Sugar Calavera, Furia del Olimpo, Santa Wilds, Gema of Gold y más), con tiradas gratis y bonos. Se juegan directo en el navegador.",
  },
  {
    q: "¿Puedo jugar a la ruleta online gratis?",
    a: "Sí, Royal Ruleta es una ruleta online gratis con mesas compartidas, donde apostás con fichas junto a otros jugadores.",
  },
  {
    q: "¿Dónde jugar dominó online con otras personas?",
    a: "En el Dominó de RoyalJuegos te sentás en mesas con jugadores reales, con chat, desde el celular o la computadora.",
  },
  {
    q: "¿Dónde jugar póker online gratis?",
    a: "En RoyalJuegos podés jugar póker Texas Hold'em online gratis en mesas en vivo, con fichas de regalo y chat, sin descargar nada.",
  },
  {
    q: "¿Puedo jugar blackjack online gratis?",
    a: "Sí, nuestro blackjack (21) se juega en mesas compartidas contra el crupier, con fichas virtuales gratis. El blackjack paga 3 a 2.",
  },
  {
    q: "¿Dónde jugar buraco online?",
    a: "En el Buraco de RoyalJuegos jugás 1 contra 1 o en parejas 2 contra 2 con jugadores reales, con canastas, muerto y chat en vivo.",
  },
  {
    q: "¿Qué juegos de casino gratis hay en RoyalJuegos?",
    a: "Bingo online, más de 10 tragamonedas, ruleta europea, póker Texas Hold'em, blackjack, Minas (Mines) y pachinko, además de juegos de mesa como dominó y buraco. Todos gratis y sin descargar.",
  },
  {
    q: "¿Hay juegos para jugar con amigos online?",
    a: "Sí. En bingo, ruleta, póker, blackjack, dominó y buraco jugás en la misma sala o mesa que tus amigos, y pueden hablar por el chat en vivo. También podés agregarlos como amigos y mandarles mensajes.",
  },
  {
    q: "¿Necesito descargar algo para jugar?",
    a: "No. Todos los juegos se abren en el navegador del celular, la tablet o la PC. Solo tenés que crear tu cuenta gratis para guardar tus fichas y tu progreso.",
  },
  {
    q: "¿Se juega con dinero real?",
    a: "No. RoyalJuegos es solo entretenimiento: se juega con fichas virtuales que no se cambian por dinero, premios ni bienes.",
  },
  {
    q: "¿Cómo consigo fichas?",
    a: "Con el bono diario que se cobra todos los días, con los regalos y promociones del sitio, invitando amigos con tu código de referido, o comprando paquetes de fichas.",
  },
];

const FAQ_JSONLD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

// Texto de la portada para visitantes: le explica a Google (y a quien llega por primera vez) que
// es el sitio y enlaza la ficha publica de cada juego (/juegos/:slug).
export default function SeoIntro() {
  const games = GAMES_CATALOG.filter((g) => g.status === "active");
  return (
    <section className="py-20 px-6 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-white font-bold text-2xl md:text-3xl tracking-tight mb-6 text-balance">
          Juegos de casino online gratis: bingo, tragamonedas, ruleta, póker y juegos de cartas
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
            Si te gustan las cartas, tenés <strong className="text-white">póker Texas Hold'em</strong>,{" "}
            <strong className="text-white">blackjack (21)</strong> y <strong className="text-white">buraco online</strong>{" "}
            en mesas en vivo. Y para partidas rápidas, <strong className="text-white">Minas (Mines)</strong> y{" "}
            <strong className="text-white">pachinko</strong>. Son juegos para jugar con amigos o con gente nueva,
            charlando por el chat mientras se juega.
          </p>
          <p>
            Nuestras <strong className="text-white">maquinitas tragamonedas</strong> (también llamadas slots o
            tragaperras) tienen temáticas para todos los gustos: frutas clásicas, dioses griegos, antiguo Egipto,
            Navidad, dulces, pesca, gatos y arcade neón, con giros gratis, comodines y multiplicadores.
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

        <h3 className="text-white font-bold text-xl mt-12 mb-4">Preguntas frecuentes</h3>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-3">
              <summary className="cursor-pointer list-none flex justify-between items-center gap-4 text-white font-semibold">
                {f.q}
                <span className="material-symbols-outlined text-primary transition-transform group-open:rotate-180">expand_more</span>
              </summary>
              <p className="text-on-surface-variant text-sm leading-relaxed mt-2 max-w-[68ch]">{f.a}</p>
            </details>
          ))}
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FAQ_JSONLD }} />
      </div>
    </section>
  );
}
