// Texto extra de la ficha publica de cada juego (/juegos/:slug): un par de parrafos y preguntas
// frecuentes escritas con las frases que la gente busca en Google ("ruleta online gratis",
// "poker texas holdem gratis", "maquinitas tragamonedas", etc.). Todo se muestra en la pagina
// (nada oculto) y las preguntas van tambien como datos estructurados FAQPage.
// Solo el sitio en espanol. Escribir solo cosas que el juego realmente hace.

const COMMON_FREE = {
  q: "¿Se juega con dinero real?",
  a: "No. En RoyalJuegos todo se juega con fichas virtuales gratis, que no se cambian por dinero ni premios. Al crear tu cuenta recibís fichas de regalo y todos los días podés cobrar un bono diario.",
};

const COMMON_DEVICE = {
  q: "¿Se puede jugar desde el celular?",
  a: "Sí. Se juega directo en el navegador del celular, la tablet o la computadora, sin descargar ni instalar nada.",
};

const GAME_FAQ = {
  bingo: {
    about: [
      "El bingo online de RoyalJuegos se juega en salas en vivo con otros jugadores y chat, como en un bingo de verdad pero desde tu casa. Comprás tus cartones con fichas, el bolillero canta los números solo y tus cartones se marcan automáticamente, así no se te pasa ninguno.",
      "Hay premios por línea, doble línea y bingo, el pozo acumulado del Super Bingo, salas con distintos valores de cartón y la opción de comprar cartones automáticos para cada partida. Es ideal para jugar al bingo con amigos o con la familia y charlar mientras sale la bola.",
    ],
    faq: [
      {
        q: "¿Cómo se juega al bingo online gratis?",
        a: "Creá tu cuenta, entrá a una sala de bingo y comprá cartones con las fichas de regalo. Los números salen solos y tus cartones se marcan automáticamente; si completás una línea, una doble línea o el cartón entero (bingo), ganás fichas.",
      },
      {
        q: "¿Puedo jugar al bingo con amigos?",
        a: "Sí. Entrando a la misma sala juegan la misma partida y pueden hablar por el chat en vivo. También se pueden regalar cartones entre jugadores.",
      },
      {
        q: "¿Tengo que marcar los números a mano?",
        a: "No, los cartones se marcan solos a medida que salen las bolas, así podés jugar varios cartones a la vez sin perderte nada.",
      },
      COMMON_FREE,
      COMMON_DEVICE,
    ],
  },
  royalslots: {
    about: [
      "Royal Slots reúne todas nuestras tragamonedas gratis (también conocidas como maquinitas, slots o tragaperras) en un solo lobby: temáticas de frutas, Egipto, dioses griegos, Navidad, dulces, pesca, gatos y más.",
      "Cada máquina tiene sus propios giros gratis, comodines (WILD), multiplicadores y bonos. Se juegan en el navegador, sin descargar nada, y lo que ganás suma para los torneos semanales y mensuales de slots.",
    ],
    faq: [
      {
        q: "¿Hay tragamonedas gratis sin descargar?",
        a: "Sí. Todas las tragamonedas de Royal Slots se juegan directo en el navegador del celular o la PC, sin descargar nada, con las fichas de regalo de tu cuenta.",
      },
      {
        q: "¿Qué son los giros gratis y los comodines?",
        a: "Los giros gratis son tiradas que no te descuentan fichas y se activan con símbolos especiales. El comodín (WILD) reemplaza a otros símbolos para completar combinaciones ganadoras.",
      },
      {
        q: "¿Cuáles son las mejores tragamonedas para empezar?",
        a: "Royal Joker es la clásica de frutas, ideal para empezar. Si te gustan los bonos, probá Furia del Olimpo, Sweet Treats o Royal Cats, que tienen giros gratis con multiplicadores.",
      },
      COMMON_FREE,
    ],
  },
  "royal-ruleta": {
    about: [
      "Royal Ruleta es una ruleta europea online gratis (un solo cero) con mesas compartidas: apostás junto a otros jugadores y todos ven girar la misma rueda.",
      "Podés apostar a un número pleno, a rojo o negro, par o impar, docenas, columnas y más, con fichas de distintos valores. Es la forma más simple de jugar a la ruleta de casino gratis, sin riesgo.",
    ],
    faq: [
      {
        q: "¿Cómo se juega a la ruleta online gratis?",
        a: "Elegí una mesa, poné tus fichas sobre los números o las apuestas exteriores (rojo/negro, par/impar, docenas) y esperá el giro. Si la bola cae en tu apuesta, cobrás según lo que paga cada tipo de apuesta.",
      },
      {
        q: "¿Cuánto paga un pleno en la ruleta?",
        a: "Un pleno (acertar el número exacto) paga 35 a 1. Las apuestas a rojo o negro y par o impar pagan 1 a 1, y las docenas y columnas 2 a 1.",
      },
      {
        q: "¿Es ruleta europea o americana?",
        a: "Es ruleta europea, con un solo cero (0), que es la versión clásica de los casinos.",
      },
      COMMON_FREE,
      COMMON_DEVICE,
    ],
  },
  "royal-poker": {
    about: [
      "Jugá póker Texas Hold'em online gratis en mesas en vivo de RoyalJuegos. Cada jugador recibe dos cartas propias y se arman las mejores manos combinándolas con las cinco cartas comunitarias de la mesa.",
      "Comprás fichas para la mesa con tu saldo, jugás las manos que quieras y al levantarte lo que tengas en la mesa vuelve a tu cuenta. Hay chat para hablar con los demás jugadores.",
    ],
    faq: [
      {
        q: "¿Dónde jugar póker online gratis?",
        a: "En RoyalJuegos podés jugar póker Texas Hold'em gratis con fichas de regalo, desde el navegador del celular o la PC, sin descargar nada.",
      },
      {
        q: "¿Cómo se juega al Texas Hold'em?",
        a: "Cada jugador recibe 2 cartas y se reparten 5 cartas comunitarias en tres etapas (flop, turn y river). En cada ronda podés pasar, igualar, subir o retirarte. Gana el pozo quien arme la mejor mano de 5 cartas o quien se quede solo en la mano.",
      },
      {
        q: "¿Qué mano gana en el póker?",
        a: "De mayor a menor: escalera real, escalera de color, póker, full, color, escalera, trío, doble par, par y carta alta.",
      },
      COMMON_FREE,
    ],
  },
  blackjack: {
    about: [
      "El blackjack (o 21) online gratis de RoyalJuegos se juega en mesas compartidas contra el crupier. El objetivo es sumar más que la banca sin pasarte de 21.",
      "Podés pedir carta, plantarte, doblar y dividir pares, y un blackjack natural paga 3 a 2. Jugás junto a otros jugadores en la misma mesa, con chat.",
    ],
    faq: [
      {
        q: "¿Cómo se juega al blackjack online?",
        a: "Apostás, recibís dos cartas y decidís si pedir más o plantarte. Las figuras valen 10 y el as vale 1 u 11. Ganás si sumás más que el crupier sin pasarte de 21, o si él se pasa.",
      },
      {
        q: "¿Cuánto paga el blackjack?",
        a: "Un blackjack (as más una carta de 10) paga 3 a 2. Una mano ganadora común paga 1 a 1 y el empate devuelve la apuesta.",
      },
      COMMON_FREE,
      COMMON_DEVICE,
    ],
  },
  domino: {
    about: [
      "Jugá dominó online gratis contra jugadores reales: te sentás en una mesa, se reparten las fichas y gana quien se quede sin fichas primero o sume menos puntos cuando se tranca.",
      "Hay salas con distintas apuestas en fichas, mesas para jugar con amigos y chat en vivo. Partidas rápidas desde el celular o la computadora.",
    ],
    faq: [
      {
        q: "¿Dónde jugar dominó online con amigos?",
        a: "En RoyalJuegos podés sentarte en la misma mesa de dominó que tus amigos y jugar en vivo con chat, desde el celular o la PC.",
      },
      {
        q: "¿Qué pasa si el dominó se tranca?",
        a: "Cuando nadie puede jugar, la mano se cierra y gana quien tenga menos puntos sumando sus fichas.",
      },
      COMMON_FREE,
      COMMON_DEVICE,
    ],
  },
  buraco: {
    about: [
      "El buraco online gratis de RoyalJuegos se juega 1 contra 1 o en parejas (2 contra 2) con jugadores reales. Armá juegos y canastas, tomá el muerto y cerrá la mano antes que tus rivales.",
      "Podés elegir las reglas de tu mesa y charlar con los demás por el chat en vivo. Es el clásico juego de cartas de mesa de Sudamérica, ahora online.",
    ],
    faq: [
      {
        q: "¿Cómo se juega al buraco online?",
        a: "Cada jugador arma juegos de cartas (escaleras del mismo palo o grupos del mismo número). Al completar 7 cartas en un juego se forma una canasta. Cuando te quedás sin cartas tomás el muerto y seguís jugando. Para cerrar hay que haber tomado el muerto y tener al menos una canasta limpia (sin comodines).",
      },
      {
        q: "¿Se puede jugar al buraco en parejas?",
        a: "Sí, hay mesas 2 contra 2 en parejas y mesas 1 contra 1.",
      },
      COMMON_FREE,
    ],
  },
  minas: {
    about: [
      "Minas (Mines) es el juego de casino de las casillas y las bombas: elegís cuántas minas hay en el tablero y vas destapando casillas. Cada diamante que encontrás sube el multiplicador.",
      "Podés retirarte cuando quieras y cobrar lo acumulado, o arriesgar una casilla más. Es rápido, simple y se juega gratis con fichas.",
    ],
    faq: [
      {
        q: "¿Cómo se juega a Minas (Mines)?",
        a: "Elegís tu apuesta y la cantidad de minas, y tocás casillas. Si sale un diamante, el premio sube; si sale una bomba, perdés la apuesta. Podés cobrar en cualquier momento.",
      },
      COMMON_FREE,
    ],
  },
  "royal-pachinka": {
    about: [
      "Royal Pachinka es un pachinko online gratis: soltás las bolas desde arriba, rebotan entre los clavos y caen en casillas con distintos multiplicadores.",
    ],
    faq: [
      {
        q: "¿Qué es el pachinko?",
        a: "Es un juego de origen japonés en el que una bola cae rebotando entre clavos hasta una casilla de premio. En Royal Pachinka cada casilla tiene un multiplicador sobre tu apuesta.",
      },
      COMMON_FREE,
    ],
  },
};

// Slots sueltos: mismo par de preguntas, con el nombre del juego.
const SLOT_FAQ = (name) => ({
  about: [
    `${name} es una de las tragamonedas gratis de RoyalJuegos: se juega en el navegador, sin descargar, con las fichas de regalo de tu cuenta. Lo que ganás suma para los rankings y los torneos de slots.`,
  ],
  faq: [
    {
      q: `¿Cómo se juega a ${name}?`,
      a: `Elegí tu apuesta y tocá girar. Si se forman combinaciones de símbolos iguales en las líneas o formas de ganar, cobrás fichas. Los símbolos especiales activan los giros gratis y los bonos de ${name}.`,
    },
    {
      q: `¿${name} se puede jugar gratis?`,
      a: `Sí. ${name} se juega con fichas virtuales gratis, desde el celular o la PC. Las fichas no se cambian por dinero: es solo para divertirse.`,
    },
  ],
});

/** Parrafos y preguntas extra de un juego, o null si no tiene. */
export function gameFaqFor(game) {
  if (!game) return null;
  if (GAME_FAQ[game.slug]) return GAME_FAQ[game.slug];
  if (game.category === "slots" && game.status === "active") return SLOT_FAQ(game.name);
  return null;
}
