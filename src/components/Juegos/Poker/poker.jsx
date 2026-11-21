import React from "react";
import { useSelector } from "react-redux";
import GameFrame from "../GameFrame/gameFrame";
import useChatToken from "../../../utils/useChatToken";

// Texas Hold'em: 2377x1080 como el blackjack (mesa 1920 + chat). Abierto a todos los que tienen sesion (RequireAuth en App.jsx).
const Poker = () => {
  const currentUser = useSelector((state) => state.currentUser);
  const jugadorID = currentUser?.id || "default-id";
  const chat = useChatToken(currentUser?.id);
  const gameURL = `https://pokertexas.s3.us-east-2.amazonaws.com/poker/index.html?jugadorID=${jugadorID}&chatToken=${encodeURIComponent(chat.token)}`;

  return <GameFrame src={jugadorID && chat.ready ? gameURL : null} title="Poker" nativeWidth={2377} nativeHeight={1080} />;
};

export default Poker;
