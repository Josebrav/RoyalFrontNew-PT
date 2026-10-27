import React from "react";
import { useSelector } from "react-redux";
import GameFrame from "../GameFrame/gameFrame";
import useChatToken from "../../../utils/useChatToken";

const Bingo = () => {
  const currentUser = useSelector((state) => state.currentUser);
  const userId = currentUser?.id || "default-id";
  const chat = useChatToken(currentUser?.id);
  const gameURL = `https://bingoroyal.s3.us-east-2.amazonaws.com/Bingo/index.html?userId=${userId}&chatToken=${encodeURIComponent(chat.token)}`;

  return <GameFrame src={userId && chat.ready ? gameURL : null} title="Royal Bingo" nativeWidth={1920} nativeHeight={1080} />;
};

export default Bingo;
