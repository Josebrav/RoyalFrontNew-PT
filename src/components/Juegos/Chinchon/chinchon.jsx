import React from "react";
import { useSelector } from "react-redux";
import GameFrame from "../GameFrame/gameFrame";
import useChatToken from "../../../utils/useChatToken";

// Chinchón va en 2377x1080 como el Buraco (mesa + chat); se publica en el bucket chinchon.
const Chinchon = () => {
  const currentUser = useSelector((state) => state.currentUser);
  const jugadorID = currentUser?.id || "default-id";
  const chat = useChatToken(currentUser?.id);
  const gameURL = `https://chinchon.s3.us-east-2.amazonaws.com/chinchon/index.html?jugadorID=${jugadorID}&chatToken=${encodeURIComponent(chat.token)}`;

  return <GameFrame src={jugadorID && chat.ready ? gameURL : null} title="Chinchón" nativeWidth={2377} nativeHeight={1080} />;
};

export default Chinchon;
