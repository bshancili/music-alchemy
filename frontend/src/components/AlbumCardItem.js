import { Box, Image, Text } from "@chakra-ui/react";
import React from "react";
import "./AlbumCardItem.css"; // Import the CSS file for styling

const AlbumCardItem = ({ track }) => {
  const t = {
    album_images: {
      height: "153px",
      url: "https://i.scdn.co/image/ab67616d0000b273904445d70d04eb24d6bb79ac",
      width: "153px",
      borderRadius: "25px",
    },
    album_name: "1989 (Taylor's Version)",
    artists: ["Taylor Swift"],
    track_name: "Out Of The Woods (Taylor's Version)",
  };
  return (
    <Box
      className="album-card"
      maxW="153px"
      borderWidth="0px"
      borderRadius="20px"
      overflow="hidden"
      position="relative"
    >
      <Image src={t.album_images.url} alt="Album Cover" w="153px" h="153px" />
      <Text
        bottom="6"
        left="3"
        fontSize="md"
        color="white"
        fontWeight="bold"
        lineHeight={1.3}
        mb={1.5}
      >
        {t.track_name}
      </Text>
      <Text bottom="2" left="3" fontSize="sm" fontWeight="w.300" color="white">
        {t.artists[0]}
      </Text>
    </Box>
  );
};

export default AlbumCardItem;
