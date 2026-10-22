import React from "react";
import { useSelector } from "react-redux";
import GameFrame from "../GameFrame/gameFrame";

// La ruleta se diseñó en 2377x1080 (más ancha que los demás juegos, que son 1920x1080).
const RoyalRuleta = () => {
  const currentUser = useSelector((state) => state.currentUser);
  const jugadorID = currentUser?.id || "default-id";
  const gameURL = `https://royalruleta.s3.us-east-2.amazonaws.com/ruleta/index.html?jugadorID=${jugadorID}`;

  return <GameFrame src={jugadorID ? gameURL : null} title="Royal Ruleta" nativeWidth={2377} nativeHeight={1080} />;
};

export default RoyalRuleta;
