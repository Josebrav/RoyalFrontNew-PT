import { useSelector } from "react-redux";
import { Box, Spinner, Center } from "@chakra-ui/react";
import { tokenStore } from "../../api/tokenStore";

const RoyalStore = () => {
  const currentUser = useSelector((state) => state.currentUser);
  const jugadorID = currentUser?.id || "default-id";
  // El access token vive en memoria (tokenStore), no en localStorage — ver Tarea 10.
  // TODO: si en algún momento se puede actualizar la app del RoyalStore (S3, fuera de este
  // repo), migrar esto a un token corto scopeado vía POST /royalstore/session-token, igual
  // que hace Diamantes/Minas con /games/mines/session-token.
  const token = tokenStore.get() || "";
  // Build de Unity del Vestidor (va dentro de un iframe, no se ve en la barra de direcciones).
  const royalStoreURL = `https://baazaar.s3.us-east-2.amazonaws.com/vestidor/index.html?jugadorID=${jugadorID}&token=${encodeURIComponent(token)}`;

  return (
    <Box
      w="100%"
      h="calc(100vh - 80px)"
      bg="gray.900"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      {jugadorID ? (
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
