import { LOCALE } from "../i18n/locale";

// Texto extra de la ficha publica de cada juego (/juegos/:slug): un par de parrafos y preguntas
// frecuentes escritas con las frases que la gente busca en Google ("ruleta online gratis",
// "poker texas holdem gratis", "maquinitas tragamonedas", "free online bingo", "jogo de buraco
// online"...). Todo se muestra en la pagina (nada oculto) y las preguntas van tambien como datos
// estructurados FAQPage. Un juego de textos por idioma (es, en, pt).
// Escribir solo cosas que el juego realmente hace.

// ======================= ESPAÑOL (royaljuegos.com) =======================

const ES_FREE = {
  q: "¿Se juega con dinero real?",
  a: "No. En RoyalJuegos todo se juega con fichas virtuales gratis, que no se cambian por dinero ni premios. Al crear tu cuenta recibís fichas de regalo y todos los días podés cobrar un bono diario.",
};

const ES_DEVICE = {
  q: "¿Se puede jugar desde el celular?",
  a: "Sí. Se juega directo en el navegador del celular, la tablet o la computadora, sin descargar ni instalar nada.",
};

const ES = {
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
      ES_FREE,
      ES_DEVICE,
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
      ES_FREE,
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
      ES_FREE,
      ES_DEVICE,
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
      ES_FREE,
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
      ES_FREE,
      ES_DEVICE,
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
      ES_FREE,
      ES_DEVICE,
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
      ES_FREE,
    ],
  },
  chinchon: {
    about: [
      "El chinchón online gratis de RoyalJuegos se juega con la baraja española de 40 cartas contra jugadores reales. Armá escaleras del mismo palo y grupos de cartas del mismo número, y cerrá la mano con la menor cantidad de puntos sueltos.",
      "El 1 de oros es el comodín. Cada ronda suma los puntos que te quedan en la mano: el que pasa del límite queda afuera y gana el último que sigue en la mesa. Hay chat en vivo para hablar con los demás.",
    ],
    faq: [
      {
        q: "¿Cómo se juega al chinchón?",
        a: "En tu turno robás una carta del mazo o de la pila de descarte y tirás una. El objetivo es combinar tus cartas en escaleras del mismo palo (3 o más seguidas) o en grupos del mismo número (3 o 4). Cuando las cartas que te quedan sueltas suman poco, podés cerrar la mano.",
      },
      {
        q: "¿Qué es hacer chinchón?",
        a: "Es cerrar con una escalera de 7 cartas del mismo palo sin comodín: es la mejor jugada posible y gana la partida.",
      },
      ES_FREE,
      ES_DEVICE,
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
      ES_FREE,
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
      ES_FREE,
    ],
  },
};

const ES_SLOT = (name) => ({
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

// ======================= ENGLISH =======================

const EN_FREE = {
  q: "Do you play with real money?",
  a: "No. At RoyalGames everything is played with free virtual chips that can't be exchanged for money or prizes. You get free chips when you sign up and a daily bonus every day.",
};

const EN_DEVICE = {
  q: "Can I play on my phone?",
  a: "Yes. It runs right in the browser on your phone, tablet or computer, with nothing to download or install.",
};

const EN = {
  bingo: {
    about: [
      "RoyalGames online bingo is played in live rooms with other players and chat, just like a real bingo hall but from home. You buy your cards with chips, the numbers are called automatically and your cards are daubed for you, so you never miss one.",
      "There are prizes for a line, two lines and a full house (bingo), the Super Bingo jackpot, rooms with different card prices and auto-buy cards for every game. It's perfect for playing bingo with friends or family and chatting while the balls are drawn.",
    ],
    faq: [
      {
        q: "How do I play free online bingo?",
        a: "Create your account, join a bingo room and buy cards with your free chips. The numbers are drawn automatically and your cards are marked for you; complete a line, two lines or the whole card (bingo) to win chips.",
      },
      {
        q: "Can I play bingo with friends?",
        a: "Yes. Join the same room to play the same game and talk in the live chat. Players can also gift cards to each other.",
      },
      {
        q: "Do I have to mark the numbers myself?",
        a: "No, the cards are marked automatically as the balls come out, so you can play several cards at once without missing anything.",
      },
      EN_FREE,
      EN_DEVICE,
    ],
  },
  royalslots: {
    about: [
      "Royal Slots brings all our free slot machines together in one lobby: fruit, Egypt, Greek gods, Christmas, candy, fishing, cats and more.",
      "Every machine has its own free spins, WILDs, multipliers and bonus rounds. They run in the browser with no download, and your wins count toward the weekly and monthly slot tournaments.",
    ],
    faq: [
      {
        q: "Are there free slots with no download?",
        a: "Yes. Every Royal Slots machine plays right in your phone or computer browser, with no download, using the free chips in your account.",
      },
      {
        q: "What are free spins and WILDs?",
        a: "Free spins are spins that don't cost chips and are triggered by special symbols. The WILD substitutes for other symbols to complete winning combinations.",
      },
      {
        q: "Which slots are best to start with?",
        a: "Royal Joker is the classic fruit slot, great for beginners. If you like bonus rounds, try Fury of Olympus, Sweet Treats or Royal Cats, which have free spins with multipliers.",
      },
      EN_FREE,
    ],
  },
  "royal-ruleta": {
    about: [
      "Royal Roulette is free online European roulette (single zero) with shared tables: you bet alongside other players and everyone watches the same wheel spin.",
      "Bet on a straight number, red or black, odd or even, dozens, columns and more, with chips of different values. It's the easiest way to play casino roulette for free, with no risk.",
    ],
    faq: [
      {
        q: "How do I play free online roulette?",
        a: "Pick a table, place your chips on numbers or outside bets (red/black, odd/even, dozens) and wait for the spin. If the ball lands on your bet, you're paid according to that bet type.",
      },
      {
        q: "How much does a straight-up bet pay?",
        a: "A straight-up bet (the exact number) pays 35 to 1. Red/black and odd/even pay 1 to 1, and dozens and columns pay 2 to 1.",
      },
      {
        q: "Is it European or American roulette?",
        a: "It's European roulette, with a single zero (0), the classic casino version.",
      },
      EN_FREE,
      EN_DEVICE,
    ],
  },
  "royal-poker": {
    about: [
      "Play free Texas Hold'em poker online at RoyalGames live tables. Each player gets two hole cards and builds the best hand by combining them with the five community cards on the table.",
      "You buy in to the table with your balance, play as many hands as you like, and when you leave, your table stack goes back to your account. There's chat to talk with the other players.",
    ],
    faq: [
      {
        q: "Where can I play free online poker?",
        a: "At RoyalGames you can play Texas Hold'em for free with gifted chips, right in your phone or computer browser, with nothing to download.",
      },
      {
        q: "How do you play Texas Hold'em?",
        a: "Each player gets 2 cards and 5 community cards are dealt in three stages (flop, turn and river). Each round you can check, call, raise or fold. The pot goes to the best 5-card hand, or to the last player left in the hand.",
      },
      {
        q: "Which poker hand wins?",
        a: "From highest to lowest: royal flush, straight flush, four of a kind, full house, flush, straight, three of a kind, two pair, one pair and high card.",
      },
      EN_FREE,
    ],
  },
  blackjack: {
    about: [
      "RoyalGames free online blackjack (21) is played at shared tables against the dealer. The goal is to beat the dealer's total without going over 21.",
      "You can hit, stand, double down and split pairs, and a natural blackjack pays 3 to 2. You play with other players at the same table, with chat.",
    ],
    faq: [
      {
        q: "How do you play online blackjack?",
        a: "Place a bet, get two cards and decide whether to hit or stand. Face cards are worth 10 and the ace is 1 or 11. You win if your total beats the dealer's without going over 21, or if the dealer busts.",
      },
      {
        q: "How much does blackjack pay?",
        a: "A blackjack (an ace plus a 10-value card) pays 3 to 2. A regular winning hand pays 1 to 1 and a tie returns your bet.",
      },
      EN_FREE,
      EN_DEVICE,
    ],
  },
  domino: {
    about: [
      "Play free online dominoes against real players: take a seat, the tiles are dealt, and the winner is whoever runs out of tiles first or has the fewest points when the game is blocked.",
      "There are rooms with different chip stakes, tables to play with friends and live chat. Quick games from your phone or computer.",
    ],
    faq: [
      {
        q: "Where can I play dominoes online with friends?",
        a: "At RoyalGames you can sit at the same dominoes table as your friends and play live with chat, from your phone or computer.",
      },
      {
        q: "What happens if the game is blocked?",
        a: "When nobody can play, the hand ends and the player with the fewest points in their remaining tiles wins.",
      },
      EN_FREE,
      EN_DEVICE,
    ],
  },
  buraco: {
    about: [
      "RoyalGames free online Buraco is played 1 vs 1 or in teams (2 vs 2) against real players. Build melds and canastas, pick up the dead pile and go out before your opponents.",
      "You can choose your table's rules and chat with the others in the live chat. It's the classic South American rummy-style card game, now online.",
    ],
    faq: [
      {
        q: "How do you play Buraco online?",
        a: "Each player builds melds (runs of the same suit or sets of the same rank). A meld of 7 cards becomes a canasta. When you run out of cards you pick up the dead pile and keep playing. To go out you must have taken the dead pile and have at least one clean canasta (no wild cards).",
      },
      {
        q: "Can I play Buraco in teams?",
        a: "Yes, there are 2 vs 2 team tables and 1 vs 1 tables.",
      },
      EN_FREE,
    ],
  },
  chinchon: {
    about: [
      "RoyalGames free online Chinchón is played with the 40-card Spanish deck against real players. Build runs of the same suit and sets of the same number, and go out with as few loose points as possible.",
      "The 1 of coins is the wild card. Each round adds the points left in your hand: whoever passes the limit is out and the last player standing wins. There's live chat to talk with the others.",
    ],
    faq: [
      {
        q: "How do you play Chinchón?",
        a: "On your turn, draw a card from the deck or the discard pile and discard one. The goal is to combine your cards into runs of the same suit (3 or more in a row) or sets of the same number (3 or 4). When your loose cards add up to few points, you can close the hand.",
      },
      {
        q: "What does making 'chinchón' mean?",
        a: "It's going out with a 7-card run of the same suit and no wild card: the best possible play, and it wins the game.",
      },
      EN_FREE,
      EN_DEVICE,
    ],
  },
  minas: {
    about: [
      "Mines is the casino game of tiles and bombs: choose how many mines are on the board and start revealing tiles. Every diamond you find raises the multiplier.",
      "Cash out whenever you want, or risk one more tile. It's fast, simple and free to play with chips.",
    ],
    faq: [
      {
        q: "How do you play Mines?",
        a: "Choose your bet and the number of mines, then tap tiles. A diamond raises the prize; a bomb loses the bet. You can cash out at any time.",
      },
      EN_FREE,
    ],
  },
  "royal-pachinka": {
    about: [
      "Royal Pachinka is free online pachinko: drop the balls from the top, watch them bounce off the pins and land in slots with different multipliers.",
    ],
    faq: [
      {
        q: "What is pachinko?",
        a: "It's a game from Japan where a ball bounces down through pins into a prize slot. In Royal Pachinka every slot has a multiplier on your bet.",
      },
      EN_FREE,
    ],
  },
};

const EN_SLOT = (name) => ({
  about: [
    `${name} is one of the free RoyalGames slot machines: it plays in your browser with no download, using the free chips in your account. Your wins count toward the slot leaderboards and tournaments.`,
  ],
  faq: [
    {
      q: `How do you play ${name}?`,
      a: `Choose your bet and tap spin. Matching symbols on the paylines or ways to win pay chips. Special symbols trigger the ${name} free spins and bonus features.`,
    },
    {
      q: `Can I play ${name} for free?`,
      a: `Yes. ${name} is played with free virtual chips on your phone or computer. Chips can't be exchanged for money: it's just for fun.`,
    },
  ],
});

// ======================= PORTUGUÊS (royalgames.lat) =======================

const PT_FREE = {
  q: "Joga-se com dinheiro real?",
  a: "Não. No RoyalGames tudo é jogado com fichas virtuais grátis, que não podem ser trocadas por dinheiro nem prêmios. Você ganha fichas de presente ao criar sua conta e pode resgatar um bônus diário todos os dias.",
};

const PT_DEVICE = {
  q: "Dá para jogar pelo celular?",
  a: "Sim. Joga-se direto no navegador do celular, do tablet ou do computador, sem baixar nem instalar nada.",
};

const PT = {
  bingo: {
    about: [
      "O bingo online do RoyalGames é jogado em salas ao vivo com outros jogadores e chat, como num bingo de verdade, mas de casa. Você compra suas cartelas com fichas, os números são cantados automaticamente e as cartelas são marcadas sozinhas, para você não perder nenhum.",
      "Há prêmios por linha, linha dupla e bingo (cartela cheia), o acumulado do Super Bingo, salas com diferentes valores de cartela e a opção de comprar cartelas automáticas em cada partida. É ideal para jogar bingo com amigos ou com a família e conversar enquanto as bolas saem.",
    ],
    faq: [
      {
        q: "Como jogar bingo online grátis?",
        a: "Crie sua conta, entre numa sala de bingo e compre cartelas com as fichas de presente. Os números saem sozinhos e as cartelas são marcadas automaticamente; se completar uma linha, uma linha dupla ou a cartela inteira (bingo), você ganha fichas.",
      },
      {
        q: "Posso jogar bingo com amigos?",
        a: "Sim. Entrando na mesma sala vocês jogam a mesma partida e podem conversar pelo chat ao vivo. Também é possível presentear cartelas entre jogadores.",
      },
      {
        q: "Preciso marcar os números à mão?",
        a: "Não, as cartelas são marcadas sozinhas conforme as bolas saem, então você pode jogar várias cartelas ao mesmo tempo sem perder nada.",
      },
      PT_FREE,
      PT_DEVICE,
    ],
  },
  royalslots: {
    about: [
      "O Royal Slots reúne todos os nossos caça-níqueis grátis num só lobby: temas de frutas, Egito, deuses gregos, Natal, doces, pesca, gatos e mais.",
      "Cada máquina tem suas próprias rodadas grátis, curingas (WILD), multiplicadores e bônus. Joga-se no navegador, sem baixar nada, e o que você ganha soma para os torneios semanais e mensais de slots.",
    ],
    faq: [
      {
        q: "Existem caça-níqueis grátis sem baixar?",
        a: "Sim. Todos os caça-níqueis do Royal Slots são jogados direto no navegador do celular ou do computador, sem baixar nada, com as fichas de presente da sua conta.",
      },
      {
        q: "O que são rodadas grátis e curingas?",
        a: "Rodadas grátis são giros que não descontam fichas e são ativados por símbolos especiais. O curinga (WILD) substitui outros símbolos para completar combinações vencedoras.",
      },
      {
        q: "Quais são os melhores caça-níqueis para começar?",
        a: "O Royal Joker é o clássico de frutas, ideal para começar. Se você gosta de bônus, experimente Fúria do Olimpo, Sweet Treats ou Royal Cats, que têm rodadas grátis com multiplicadores.",
      },
      PT_FREE,
    ],
  },
  "royal-ruleta": {
    about: [
      "A Royal Roleta é uma roleta europeia online grátis (um só zero) com mesas compartilhadas: você aposta junto com outros jogadores e todos veem a mesma roda girar.",
      "Aposte num número pleno, vermelho ou preto, par ou ímpar, dúzias, colunas e mais, com fichas de diferentes valores. É a forma mais simples de jogar roleta de cassino grátis, sem risco.",
    ],
    faq: [
      {
        q: "Como jogar roleta online grátis?",
        a: "Escolha uma mesa, coloque suas fichas nos números ou nas apostas externas (vermelho/preto, par/ímpar, dúzias) e espere o giro. Se a bola cair na sua aposta, você recebe conforme o que paga cada tipo de aposta.",
      },
      {
        q: "Quanto paga um pleno na roleta?",
        a: "Um pleno (acertar o número exato) paga 35 para 1. Vermelho ou preto e par ou ímpar pagam 1 para 1, e dúzias e colunas pagam 2 para 1.",
      },
      {
        q: "É roleta europeia ou americana?",
        a: "É roleta europeia, com um só zero (0), a versão clássica dos cassinos.",
      },
      PT_FREE,
      PT_DEVICE,
    ],
  },
  "royal-poker": {
    about: [
      "Jogue pôquer Texas Hold'em online grátis nas mesas ao vivo do RoyalGames. Cada jogador recebe duas cartas próprias e monta a melhor mão combinando-as com as cinco cartas comunitárias da mesa.",
      "Você compra fichas para a mesa com seu saldo, joga as mãos que quiser e, ao sair, o que tiver na mesa volta para a sua conta. Há chat para conversar com os outros jogadores.",
    ],
    faq: [
      {
        q: "Onde jogar pôquer online grátis?",
        a: "No RoyalGames você joga pôquer Texas Hold'em grátis com fichas de presente, pelo navegador do celular ou do computador, sem baixar nada.",
      },
      {
        q: "Como se joga Texas Hold'em?",
        a: "Cada jogador recebe 2 cartas e são distribuídas 5 cartas comunitárias em três etapas (flop, turn e river). Em cada rodada você pode passar, pagar, aumentar ou desistir. Ganha o pote quem formar a melhor mão de 5 cartas ou quem ficar sozinho na mão.",
      },
      {
        q: "Qual mão ganha no pôquer?",
        a: "Da maior para a menor: royal flush, straight flush, quadra, full house, flush, sequência, trinca, dois pares, um par e carta alta.",
      },
      PT_FREE,
    ],
  },
  blackjack: {
    about: [
      "O blackjack (ou 21) online grátis do RoyalGames é jogado em mesas compartilhadas contra o crupiê. O objetivo é somar mais que a banca sem passar de 21.",
      "Você pode pedir carta, parar, dobrar e dividir pares, e um blackjack natural paga 3 para 2. Joga junto com outros jogadores na mesma mesa, com chat.",
    ],
    faq: [
      {
        q: "Como jogar blackjack online?",
        a: "Você aposta, recebe duas cartas e decide se pede mais ou para. As figuras valem 10 e o ás vale 1 ou 11. Você ganha se somar mais que o crupiê sem passar de 21, ou se ele estourar.",
      },
      {
        q: "Quanto paga o blackjack?",
        a: "Um blackjack (ás mais uma carta de valor 10) paga 3 para 2. Uma mão vencedora comum paga 1 para 1 e o empate devolve a aposta.",
      },
      PT_FREE,
      PT_DEVICE,
    ],
  },
  domino: {
    about: [
      "Jogue dominó online grátis contra jogadores reais: você senta numa mesa, as pedras são distribuídas e ganha quem ficar sem pedras primeiro ou somar menos pontos quando o jogo trancar.",
      "Há salas com diferentes apostas em fichas, mesas para jogar com amigos e chat ao vivo. Partidas rápidas pelo celular ou pelo computador.",
    ],
    faq: [
      {
        q: "Onde jogar dominó online com amigos?",
        a: "No RoyalGames você pode sentar na mesma mesa de dominó que seus amigos e jogar ao vivo com chat, pelo celular ou pelo computador.",
      },
      {
        q: "O que acontece se o dominó trancar?",
        a: "Quando ninguém consegue jogar, a mão termina e ganha quem tiver menos pontos somando suas pedras.",
      },
      PT_FREE,
      PT_DEVICE,
    ],
  },
  buraco: {
    about: [
      "O buraco online grátis do RoyalGames é jogado 1 contra 1 ou em duplas (2 contra 2) com jogadores reais. Monte jogos e canastras, pegue o morto e bata antes dos seus adversários.",
      "Você pode escolher as regras da sua mesa e conversar com os outros pelo chat ao vivo. É o clássico jogo de cartas de mesa da América do Sul, agora online.",
    ],
    faq: [
      {
        q: "Como jogar buraco online?",
        a: "Cada jogador monta jogos de cartas (sequências do mesmo naipe ou trincas do mesmo número). Ao completar 7 cartas num jogo forma-se uma canastra. Quando suas cartas acabam, você pega o morto e continua jogando. Para bater é preciso ter pegado o morto e ter pelo menos uma canastra limpa (sem curingas).",
      },
      {
        q: "Dá para jogar buraco em duplas?",
        a: "Sim, há mesas 2 contra 2 em duplas e mesas 1 contra 1.",
      },
      PT_FREE,
    ],
  },
  chinchon: {
    about: [
      "O chinchón online grátis do RoyalGames é jogado com o baralho espanhol de 40 cartas contra jogadores reais. Monte sequências do mesmo naipe e grupos de cartas do mesmo número, e feche a mão com o menor número de pontos soltos.",
      "O 1 de ouros é o curinga. Cada rodada soma os pontos que ficam na sua mão: quem passa do limite está fora e ganha o último que continua na mesa. Há chat ao vivo para conversar com os outros.",
    ],
    faq: [
      {
        q: "Como se joga chinchón?",
        a: "Na sua vez, compre uma carta do monte ou do descarte e descarte uma. O objetivo é combinar suas cartas em sequências do mesmo naipe (3 ou mais seguidas) ou em grupos do mesmo número (3 ou 4). Quando as cartas soltas somam poucos pontos, você pode fechar a mão.",
      },
      {
        q: "O que é fazer chinchón?",
        a: "É fechar com uma sequência de 7 cartas do mesmo naipe sem curinga: a melhor jogada possível, que ganha a partida.",
      },
      PT_FREE,
      PT_DEVICE,
    ],
  },
  minas: {
    about: [
      "Minas (Mines) é o jogo de cassino das casas e das bombas: você escolhe quantas minas há no tabuleiro e vai revelando casas. Cada diamante encontrado aumenta o multiplicador.",
      "Você pode parar quando quiser e receber o acumulado, ou arriscar mais uma casa. É rápido, simples e grátis com fichas.",
    ],
    faq: [
      {
        q: "Como jogar Minas (Mines)?",
        a: "Escolha sua aposta e a quantidade de minas e toque nas casas. Se sair um diamante, o prêmio sobe; se sair uma bomba, você perde a aposta. Dá para receber a qualquer momento.",
      },
      PT_FREE,
    ],
  },
  "royal-pachinka": {
    about: [
      "Royal Pachinka é um pachinko online grátis: solte as bolinhas do alto, elas quicam entre os pinos e caem em casas com diferentes multiplicadores.",
    ],
    faq: [
      {
        q: "O que é pachinko?",
        a: "É um jogo de origem japonesa em que uma bolinha desce quicando entre pinos até uma casa de prêmio. No Royal Pachinka cada casa tem um multiplicador sobre a sua aposta.",
      },
      PT_FREE,
    ],
  },
};

const PT_SLOT = (name) => ({
  about: [
    `${name} é um dos caça-níqueis grátis do RoyalGames: joga-se no navegador, sem baixar, com as fichas de presente da sua conta. O que você ganha soma para os rankings e os torneios de slots.`,
  ],
  faq: [
    {
      q: `Como jogar ${name}?`,
      a: `Escolha sua aposta e toque em girar. Combinações de símbolos iguais nas linhas ou formas de ganhar pagam fichas. Os símbolos especiais ativam as rodadas grátis e os bônus de ${name}.`,
    },
    {
      q: `Dá para jogar ${name} grátis?`,
      a: `Sim. ${name} é jogado com fichas virtuais grátis, pelo celular ou pelo computador. As fichas não são trocadas por dinheiro: é só diversão.`,
    },
  ],
});

const BY_LOCALE = {
  es: { games: ES, slot: ES_SLOT },
  en: { games: EN, slot: EN_SLOT },
  pt: { games: PT, slot: PT_SLOT },
};

/** Parrafos y preguntas extra de un juego en el idioma del sitio, o null si no tiene. */
export function gameFaqFor(game, locale = LOCALE) {
  if (!game) return null;
  const texts = BY_LOCALE[locale] || BY_LOCALE.es;
  if (texts.games[game.slug]) return texts.games[game.slug];
  if (game.category === "slots" && game.status === "active") return texts.slot(game.name);
  return null;
}
