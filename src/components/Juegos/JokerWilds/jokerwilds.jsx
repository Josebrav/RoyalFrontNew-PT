import React from "react";
import { useSelector } from "react-redux";
import GameFrame from "../GameFrame/gameFrame";
import { HUB_SLOTS } from "../../../data/slotHub";

// El build de Joker Wilds tiene la resolucion del panel del juego (1860x845).
const JokerWilds = () => {
  const currentUser = useSelector((state) => state.currentUser);
  const jugadorID = currentUser?.id || "default-id";
  const game = HUB_SLOTS.jokerwilds;

  return <GameFrame src={jugadorID ? game.url(jugadorID) : null} title={game.title} nativeWidth={1860} nativeHeight={845} />;
};

export default JokerWilds;
