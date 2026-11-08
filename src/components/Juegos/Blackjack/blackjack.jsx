import React from "react";
import { useSelector } from "react-redux";
import GameFrame from "../GameFrame/gameFrame";
import useChatToken from "../../../utils/useChatToken";

// El blackjack se diseñó en 2377x1080 como la ruleta (mesa 1920 + chat), y se publica en el mismo bucket.
const Blackjack = () => {
  const currentUser = useSelector((state) => state.currentUser);
  const jugadorID = currentUser?.id || "default-id";
  const chat = useChatToken(currentUser?.id);
  const gameURL = `https://royalruleta.s3.us-east-2.amazonaws.com/blackjack/index.html?jugadorID=${jugadorID}&chatToken=${encodeURIComponent(chat.token)}`;

  return <GameFrame src={jugadorID && chat.ready ? gameURL : null} title="Blackjack" nativeWidth={2377} nativeHeight={1080} />;
};

export default Blackjack;
