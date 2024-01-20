import React from "react";
import { Box, Text, Image } from "@chakra-ui/react";

const ArtistDetail = ({ t, handleExternalLink }) => {
  return (
    <Box display="flex" flexDir="column" alignItems="center" mt={8} mb={8}>
      <span onClick={() => handleExternalLink(t.artist_url)}>
        <Image
          borderRadius="full"
          boxSize="150px"
          src={t.artist_images[0].url} 
          alt={t.artist_name} 
          mb={4}
          cursor="pointer"
        />
        <Text color="white" fontSize="xl" fontWeight="bold" textAlign="center" cursor="pointer">
          {t.artist_name} 
        </Text>
      </span>
    </Box>
  );
};

export default ArtistDetail;
