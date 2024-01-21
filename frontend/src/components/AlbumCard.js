import { Box, Image, Text } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";

const AlbumCardItem = ({ album }) => {
  const navigate = useNavigate();
  const handleItemClick = () => {
    navigate(`/album/${album.firebase_id}`, {
      state: { albumData: album },
    });
  };
  return (
    <Box
      maxW="180px"
      borderWidth="1px"
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
        // God know why we need that question mark
        src={album.album_images[0]}
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
        {album.album_name}
      </Text>

    </Box>
  );
};

export default AlbumCardItem;
