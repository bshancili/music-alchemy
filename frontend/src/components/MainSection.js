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
        <Flex width={123} height={29}>
          <Text
            fontFamily="Quicksand"
            fontSize={24}
            fontWeight={700}
            lineHeight={29}
            letterSpacing={0}
            textAlign="left"
          >
            Your Text Here
          </Text>
        </Flex>
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
          cover="/assets/tomorrows_tunes.jpg"
        />
      </Flex>
    </Box>
  );
};

export default MainSection;
