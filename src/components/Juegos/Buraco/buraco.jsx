import React from "react";
import { useSelector } from "react-redux";
import GameFrame from "../GameFrame/gameFrame";
import useChatToken from "../../../utils/useChatToken";

// Buraco sale del proyecto del Dominó (1920x1080) y se publica en el bucket de la ruleta, como el blackjack.
const Buraco = () => {
  const currentUser = useSelector((state) => state.currentUser);
  const jugadorID = currentUser?.id || "default-id";
  const chat = useChatToken(currentUser?.id);
  const gameURL = `https://royalruleta.s3.us-east-2.amazonaws.com/buraco/index.html?jugadorID=${jugadorID}&chatToken=${encodeURIComponent(chat.token)}`;

  return <GameFrame src={jugadorID && chat.ready ? gameURL : null} title="Buraco" nativeWidth={1920} nativeHeight={1080} />;
};

export default Buraco;
