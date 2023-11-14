// TopChartItem.js

import React from "react";
import { Box, Text, IconButton, VStack, Image, HStack } from "@chakra-ui/react";
import heart from "../utils/heart.svg";
const TopChartItem = ({ track }) => {
  const t = {
    album_images: [
      {
        height: 640,
        url: "https://i.scdn.co/image/ab67616d0000b273904445d70d04eb24d6bb79ac",
        width: 640,
      },
    ],
    album_name: "1989 (Taylor's Version)",
    artists: ["Taylor Swift"],
    track_name: "Out Of The Woods (Taylor's Version)",
    spotify_track_id: "64LU4c1nfjz1t4VnGhagcg",
    id: "05tVryr3s4GtbGMjLyB7",
  };

  return (
    <Box
      width="560px"
      height="96px"
      borderRadius="20px"
      backgroundColor="#1A1E1F"
      display="flex"
      p="10px 30px"
      alignItems="center"
      flexDir="row"
      justifyContent="space-between"
      mb={5}
    >
      <HStack>
        <Image
          borderRadius="17px"
          width="73px"
          height="73px"
          src={track.album_images[0].url}
        />

        <VStack alignItems="start">
          <Text
            fontFamily="Quicksand"
            fontSize="17px"
            fontWeight="400"
            color="#FFFFFF"
          >
            {track.track_name}
          </Text>
          <Text
            fontFamily="Quicksand"
            fontSize="12px"
            fontWeight="400"
            lineHeight="14px"
            color="#FFFFFF80" // Adjusted for alpha transparency
          >
            {track.artists[0]}
          </Text>
        </VStack>
      </HStack>

      <IconButton
        width="48px"
        height="48px"
        borderRadius="15px"
        bg="#33373B5E"
        icon={<Image src={heart} />}
        onClick={() => {
          // Handle like button click logic here
        }}
      ></IconButton>
    </Box>
  );
};

export default TopChartItem;
