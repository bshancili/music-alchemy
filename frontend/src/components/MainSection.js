import React from "react";
import { Box, Flex, Text, extendTheme } from "@chakra-ui/react";
import TopChartItem from "./TopChartItem";

const MainSection = ({ topTracks }) => {
  return (
    <Box
      w="100%"
      backgroundColor="#1D2123"
      display="flex"
      flexDir="row"
      padding="10px 100px"
      justifyContent="space-between"
    >
      <Box
        style={{
          width: "686px",
          height: "377px",
          backgroundColor: "#33373B",
          borderRadius: "40px",
        }}
      >
        {/* Add content for the black rectangle if needed */}
      </Box>
      <Flex direction="column">
        <Text
          fontSize="md"
          color="white"
          fontWeight="bold"
          lineHeight={1.3}
          mb={1.5}
          font-family="Quicksand"
          text-align="left"
        >
          Top Charts
        </Text>
        {topTracks.map((track) => (
          <TopChartItem track={track} key={track.id} />
        ))}
      </Flex>
    </Box>
  );
};

export default MainSection;
