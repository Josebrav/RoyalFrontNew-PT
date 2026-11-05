import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Spinner, Center } from "@chakra-ui/react";
import axios from "axios";
import API_URL from "../../api/rutaApi";
import { tokenStore } from "../../api/tokenStore";

const RoyalStore = () => {
  const currentUser = useSelector((state) => state.currentUser);
  const jugadorID = currentUser?.id || "default-id";
  // El access token vive en memoria (tokenStore), no en localStorage — ver Tarea 10.
  // TODO: si en algún momento se puede actualizar la app del RoyalStore (S3, fuera de este
  // repo), migrar esto a un token corto scopeado vía POST /royalstore/session-token, igual
  // que hace Diamantes/Minas con /games/mines/session-token.
  const token = tokenStore.get() || "";

  // Token de juego: el servidor identifica al jugador al cobrar las compras por este token y no por
  // el jugadorID de la URL (igual que los juegos, ver GameFrame).
  const [gameToken, setGameToken] = useState({ value: "", ready: false });
  useEffect(() => {
    let cancelled = false;
    setGameToken({ value: "", ready: false });
    if (!currentUser?.id || !tokenStore.get()) {
      setGameToken({ value: "", ready: true });
      return undefined;
    }
    axios
      .post(`${API_URL}/games/session-token`, {})
      .then(({ data }) => !cancelled && setGameToken({ value: data?.token || "", ready: true }))
      .catch(() => !cancelled && setGameToken({ value: "", ready: true }));
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  // Build de Unity del Vestidor (va dentro de un iframe, no se ve en la barra de direcciones).
  const royalStoreURL = `https://baazaar.s3.us-east-2.amazonaws.com/vestidor/index.html?jugadorID=${jugadorID}&token=${encodeURIComponent(token)}&gameToken=${encodeURIComponent(gameToken.value)}`;

  return (
    <Box
      w="100%"
      h="calc(100vh - 80px)"
      bg="gray.900"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      {jugadorID && gameToken.ready ? (
        <Box
          flex="1"
          position="relative"
          w="100%"
          h="100%"
          bg="gray.800"
          overflow="hidden"
        >
          <iframe
            src={royalStoreURL}
            title="RoyalStore"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
            }}
          />
        </Box>
      ) : (
        <Center h="100%">
          <Spinner size={{ base: "md", md: "xl" }} color="teal.300" />
        </Center>
      )}
    </Box>
  );
};

export default RoyalStore;
