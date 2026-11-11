// Royal Slots: el lobby (/game/royalslots) no tiene los juegos adentro. Al elegir una slot, el
// lobby (Unity) le pide a la pagina que muestre el build propio de esa slot en el mismo marco, sin
// salir de /game/royalslots (queda ?juego=<slug> para que al recargar vuelva a la misma slot).
// Los slugs tienen que coincidir con SlotHub.Open(...) en RoyalSlots/Assets/Scripts/Open*.cs.

const withPlayer = (base) => (jugadorID) => `${base}?jugadorID=${jugadorID}`;

export const ROYAL_SLOTS_LOBBY = {
  title: "Royal Slots",
  url: withPlayer("https://royalslots.s3.us-east-2.amazonaws.com/RoyalSlots/index.html"),
};

export const HUB_SLOTS = {
  royaljoker: {
    title: "Royal Joker",
    url: withPlayer("https://royaljoker1.s3.us-east-2.amazonaws.com/Royaljoker/index.html"),
  },
  santawilds: {
    title: "Santa Wilds",
    url: withPlayer("https://santawilds.s3.us-east-2.amazonaws.com/SantaWilds/index.html"),
  },
  sugarcalavera: {
    title: "Sugar Calavera",
    url: withPlayer("https://sugarcalavera.s3.us-east-1.amazonaws.com/calavera/index.html"),
  },
  furiaolimpo: {
    title: "Furia del Olimpo",
    url: withPlayer("https://furiadelolimpo.s3.us-east-2.amazonaws.com/olimpo/index.html"),
  },
  gildedcobra: {
    title: "Gilded Cobra",
    url: withPlayer("https://gildedcobra.s3.us-east-2.amazonaws.com/gildedcobra/index.html"),
  },
  jokerwilds: {
    title: "Joker Wilds",
    url: withPlayer("https://jokerwilds.s3.us-east-2.amazonaws.com/jokerwilds/index.html"),
  },
  sweettreats: {
    title: "Sweet Treats",
    url: withPlayer("https://sweettreats.s3.us-east-2.amazonaws.com/sweettreats/index.html"),
  },
  gemaofgold: {
    title: "Gema of Gold",
    url: withPlayer("https://gemaofgold.s3.us-east-2.amazonaws.com/Gemaofgold/index.html"),
  },
};

// Solo se aceptan pedidos del lobby o de las slots (otros sitios no pueden mover el marco).
export const HUB_ORIGINS = new Set(
  [ROYAL_SLOTS_LOBBY, ...Object.values(HUB_SLOTS)].map((game) => new URL(game.url("x")).origin),
);
