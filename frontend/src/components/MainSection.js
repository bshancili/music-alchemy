import React from "react";
import { Box, Flex, Text, extendTheme } from "@chakra-ui/react";
import TopChartItem from "./TopChartItem";

const MainSection = () => {
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
          bottom="12px"
          left="3"
          fontSize="md"
          color="white"
          fontWeight="bold"
          lineHeight={1.3}
          mb={1.5}
          font-family="Quicksand"
          font-size="24px"
          font-weight="700"
          line-height="29px"
          letter-spacing="0em"
          text-align="left"
        >
          Top Charts
        </Text>
        <TopChartItem
          mainText="Golden age of 80s"
          smallText="Sean swadder"
          cover="./assets/golden_age.jpg"
        />
        <TopChartItem
          mainText='Raggae "n" blues'
          smallText="Dj YK mule"
          cover="./assets/raggae_n_blues.jpg"
        />
        <TopChartItem
          mainText="Tomorrow's tunes"
          smallText="Obi Datti"
          cover="./assets/tomorrows_tunes.jpg"
        />
      </Flex>
    </Box>
  );
};

export default MainSection;
