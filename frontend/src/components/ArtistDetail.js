import React from "react";
import {
  Box,
  Text,
  Flex,
  Image,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import share from "../utils/share.svg";
import spotify_logo from "../utils/spotify_logo.png";

const ArtistDetail = ({ t }) => {
  const handleExternalLink = () => {
    window.open(t?.artist_url, "_blank");
  };

  return (
    <Flex
      align="top"
      margin="0px "
      bg="#1D2123"
      color="#FFF"
      gap={4}
      padding="10px 100px"
      width="100%" // Set width to 100%
    >
      <Image
        src={t?.artist_images?.[0]}
        h="300"
        w="300px"
        borderRadius="16px"
      />
      <Box ml={5}>
        <Text fontSize="48px" fontWeight="bold" lineHeight="120%">
          {t?.artist_name || "Artist Name Not Available"}
        </Text>
        <Text fontSize="24px" lineHeight="120%">
          {t?.artist_genres[0] || "Genre Not Available"}
        </Text>

        <HStack mt={6} spacing={4}>
          <IconButton
            borderRadius="15px"
            w="158x"
            h="64px"
            bg="#1DB954"
            p={4}
            icon={<Image src={spotify_logo} />}
            _hover={{ bg: "#147040" }}
            onClick={handleExternalLink}
          />
          <IconButton
            borderRadius="15px"
            w="64px"
            h="64px"
            bg="#33373b5e"
            icon={<Image src={share} />}
            _hover={{ bg: "#000" }}
          />
        </HStack>
      </Box>
    </Flex>
  );
};

export default ArtistDetail;
