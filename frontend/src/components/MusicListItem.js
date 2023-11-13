import { Box, Image, Text } from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";

const MusicListItem = ({ track }) => {
  return (
    <Link to={`/music/${track.spotify_track_id}`}>
      <Box
        maxW="234px"
        borderWidth="1px"
        borderRadius="20px"
        overflow="hidden"
        position="relative"
        transition="transform 0.2s ease-in-out"
        _hover={{
          transform: "scale(1.08)",
        }}
      >
        <Image
          src={track.album_images.url}
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
    </Link>
  );
};

export default MusicListItem;
