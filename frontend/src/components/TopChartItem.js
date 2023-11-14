// TopChartItem.js

import React from "react";
import { Box, Text, IconButton, VStack, Image } from "@chakra-ui/react";

const TopChartItem = ({ mainText, smallText, cover }) => {
  return (
    <Box
      width="550px"
      height="96px"
      borderRadius="20px"
      backgroundColor="#1A1E1F"
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box display="flex" flexDir="row" gap={5}>
        <Box width="63px" height="63px" borderRadius="10px">
          {cover}
        </Box>
        <VStack>
          <Text
            width="144px"
            height="20px"
            fontFamily="Quicksand"
            fontSize="17px"
            fontWeight="400"
            color="#FFFFFF" // Assuming white text color
          >
            {mainText}
          </Text>
          <Text
            width="144px"
            height="14px"
            fontFamily="Quicksand"
            fontSize="12px"
            fontWeight="400"
            lineHeight="14px"
            color="#FFFFFF80" // Adjusted for alpha transparency
          >
            {smallText}
          </Text>
        </VStack>
      </Box>
      <IconButton
        width="48px"
        height="48px"
        borderRadius="15px"
        aria-label="Like button"
        onClick={() => {
          // Handle like button click logic here
        }}
      >
        {/* Use an Image component as the icon */}
        <Image src="./assets/like_icon.png" alt="Like icon" />
      </IconButton>
    </Box>
  );
};

export default TopChartItem;
