import React from "react";
import { useSelector } from "react-redux";
import GameFrame from "../GameFrame/gameFrame";

const GemaOfGold = () => {
  const currentUser = useSelector((state) => state.currentUser);
  const jugadorID = currentUser?.id || "default-id";
  const gameURL = `https://gemaofgold.s3.us-east-2.amazonaws.com/Gemaofgold/index.html?jugadorID=${jugadorID}`;

  return <GameFrame src={jugadorID ? gameURL : null} title="Gema of Gold" nativeWidth={1920} nativeHeight={1080} />;
};

export default GemaOfGold;
