// Import necessary Chakra UI components
import React from "react";

import { Box, Flex, Text, extendTheme } from "@chakra-ui/react";
// Import your image files
import homeIcon from "../utils/home.svg";
import musicIcon from "../utils/fire.svg";
import penIcon from "../utils/add.svg";
import envelopeIcon from "../utils/chat.svg";
import userIcon from "../utils/profile.svg";
import Header from "../components/Header";
import MainSection from "../components/MainSection";

// Extend the theme if needed
const theme = extendTheme(/* Your theme configurations here */);
// Header component with custom images as icons

// Footer component
const Footer = () => (
  <Flex
    as="footer"
    align="center"
    justify="center"
    p="4"
    bg="#1A1E1F"
    color="white"
    style={{
      width: "1165px",
      height: "236px",
      top: "606px",
      left: "138px",
      padding: "0px 0px 2px 0px",
      position: "absolute",
    }}
  >
    <Text
      style={{
        width: "64px",
        height: "29px",

        fontFamily: "Quicksand",
        fontSize: "24px",
        fontWeight: 700,
        lineHeight: "29px",
        letterSpacing: "0em",
        textAlign: "left-bottom",
        color: "#EFEEE0",
      }}
    >
      Music
    </Text>

    <Flex
      style={{
        width: "100%",
        justifyContent: "space-between",
        gap: "5px",
        position: "absolute",
        top: "41px",
      }}
    >
      {/* Replace this with your list of songs */}
      {[1, 2, 3, 4].map((songIndex) => (
        <Box
          key={songIndex}
          style={{
            width: "153px",
            height: "193px",
            gap: "5px",
          }}
        >
          {/* Add content for each song as needed */}
        </Box>
      ))}
    </Flex>
  </Flex>
);

// Homepage component
const Homepage = () => {
  return (
    <Box w="100%" display="flex" flexDirection="column">
      <Header />
      <MainSection />
    </Box>
  );
};

export default Homepage;
