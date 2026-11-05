import React from "react";
import { useSelector } from "react-redux";
import GameFrame from "../GameFrame/gameFrame";
import useChatToken from "../../../utils/useChatToken";

const Domino = () => {
  const currentUser = useSelector((state) => state.currentUser);
  const jugadorID = currentUser?.id || "default-id";
  const chat = useChatToken(currentUser?.id);
  const gameURL = `https://dominoroyal.s3.us-east-2.amazonaws.com/domino/index.html?jugadorID=${jugadorID}&chatToken=${encodeURIComponent(chat.token)}`;

  return <GameFrame src={jugadorID && chat.ready ? gameURL : null} title="Dominó" nativeWidth={1920} nativeHeight={1080} />;
};

export default Domino;
