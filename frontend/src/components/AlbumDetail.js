import React from "react";
import { Box, Text, Image } from "@chakra-ui/react";

const AlbumDetail = ({ t }) => {
  return (
    <Box display="flex" flexDir="column" alignItems="center" mt={8} mb={8}>
      <span onClick={() => handleExternalLink(t.album_url)}>
        <Image
          borderRadius="full"
          boxSize="150px"
          src={t.album_images[0].url} 
          alt={t.album_name} 
          mb={4}
          cursor="pointer"
        />
        <Text color="white" fontSize="xl" fontWeight="bold" textAlign="center" cursor="pointer">
          {t.album_name} 
        </Text>
      </span>
    </Box>
  );
};

export default AlbumDetail;