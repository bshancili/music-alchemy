import { Box, Text, Image } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";

const PlaylistListItem = ({ playlist }) => {
  const navigate = useNavigate();
  return (
    <Box
      backgroundColor={"#33373B5E"}
      w="274px"
      borderRadius="20px"
      overflow="hidden"
      position="relative"
      display="flex"
      flexDir="column"
      alignItems="center"
      justifyContent="space-around"
      pt={5}
      pb={5}
      mt={4}
      onClick={() => {
        navigate(`/playlists/${playlist.id}`, {
          state: { playlistData: playlist },
        });
      }}
    >
      <Image
        borderRadius="md"
        w="213px"
        h="213px"
        objectFit="cover"
        transition="transform 0.2s ease-in-out"
        _hover={{
          transform: "scale(1.05)",
        }}
        src={playlist.imgURL}
        boxShadow="4px 8px 10px rgba(0, 0, 0, 0.9)"
      />
      <Text mt={1} color={"white"}>
        {playlist.name}
      </Text>
    </Box>
  );
};

export default PlaylistListItem;
