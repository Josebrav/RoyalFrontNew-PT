import React from "react";
import { useSelector } from "react-redux";
import GameFrame from "../GameFrame/gameFrame";
import useChatToken from "../../../utils/useChatToken";

// Trivia Royal va en 2377x1080 (juego + chat) y se publica en su propio bucket (triviaroyal).
const Trivia = () => {
  const currentUser = useSelector((state) => state.currentUser);
  const jugadorID = currentUser?.id || "default-id";
  const chat = useChatToken(currentUser?.id);
  const gameURL = `https://triviaroyal.s3.us-east-2.amazonaws.com/trivia/index.html?jugadorID=${jugadorID}&chatToken=${encodeURIComponent(chat.token)}`;

  return <GameFrame src={jugadorID && chat.ready ? gameURL : null} title="Trivia Royal" nativeWidth={2377} nativeHeight={1080} />;
};

export default Trivia;
