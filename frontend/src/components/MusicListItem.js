import { Box, Image, Text } from "@chakra-ui/react";
import React from "react";

const MusicListItem = (track) => {
  const t = {
    album_images: {
      height: 640,
      url: "https://i.scdn.co/image/ab67616d0000b273904445d70d04eb24d6bb79ac",
      width: 640,
    },
    album_name: "1989 (Taylor's Version)",
    artists: ["Taylor Swift"],
    track_name: "Out Of The Woods (Taylor's Version)",
  };
  return (
    <Box
      maxW="234px"
      borderWidth="1px"
      borderRadius="20px"
      overflow="hidden"
      position="relative"
    >
      <Image
        src={t.album_images.url}
        alt="Album Cover"
        w="234px"
        h="213px"
        objectFit="cover"
      />
      <Text position="absolute" bottom="6" left="2" fontSize="md" color="white">
        {t.track_name}
      </Text>
      <Text
        position="absolute"
        bottom="2"
        left="2"
        fontSize="sm"
        fontWeight="bold"
        color="white"
      >
        {t.artists[0]}
      </Text>
    </Box>
  );
};

export default MusicListItem;
