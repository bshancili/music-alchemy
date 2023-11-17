import { Box, Image, Text } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";

const MusicListItem = ({ track }) => {
  const navigate = useNavigate();
  const handleItemClick = () => {
    navigate(`/music/${track.id}`, {
      state: { trackData: track },
    });
  };
  return (
    <Box
      maxW="234px"
      borderRadius="20px"
      overflow="hidden"
      position="relative"
      transition="transform 0.2s ease-in-out"
      _hover={{
        transform: "scale(1.08)",
      }}
      onClick={handleItemClick}
    >
      <Image
        src={track.album_images[0].url}
        alt="Album Cover"
        w="234px"
        h="213px"
        objectFit="cover"
        transition="transform 0.2s ease-in-out"
        _hover={{
          transform: "scale(1.4)",
        }}
      />
      <Text
        position="absolute"
        bottom="6"
        left="3"
        fontSize="md"
        color="white"
        fontWeight="bold"
        lineHeight={1.3}
        mb={1.5}
        transition="bottom 0.2s ease-in-out"
      >
        {track.track_name}
      </Text>
      <Text
        position="absolute"
        bottom="2"
        left="3"
        fontSize="sm"
        fontWeight="w.300"
        color="white"
      >
        {track.artists[0]}
      </Text>
    </Box>
  );
};

export default MusicListItem;
