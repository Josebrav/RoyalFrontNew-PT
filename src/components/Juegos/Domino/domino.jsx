import React from "react";
import { useSelector } from "react-redux";
import GameFrame from "../GameFrame/gameFrame";
import useChatToken from "../../../utils/useChatToken";

// Dominó va en 2377x1080 como Bingo, la ruleta y el blackjack (juego 1917 + chat 460).
const Domino = () => {
  const currentUser = useSelector((state) => state.currentUser);
  const jugadorID = currentUser?.id || "default-id";
  const chat = useChatToken(currentUser?.id);
  const gameURL = `https://dominoroyal.s3.us-east-2.amazonaws.com/domino/index.html?jugadorID=${jugadorID}&chatToken=${encodeURIComponent(chat.token)}`;

  return <GameFrame src={jugadorID && chat.ready ? gameURL : null} title="Dominó" nativeWidth={2377} nativeHeight={1080} />;
};

export default Domino;
