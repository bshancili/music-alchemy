// Import necessary Chakra UI components
import React from "react";

import { Box, Flex, Text, extendTheme } from "@chakra-ui/react";
// Import your image files
import Header from "../components/Header";
import MainSection from "../components/MainSection";
import HomePageMusicList from "../components/HomePageMusicList";

// Extend the theme if needed
const theme = extendTheme(/* Your theme configurations here */);
// Header component with custom images as icons

// Homepage component
const Homepage = () => {
  return (
    <Box w="100%" display="flex" flexDirection="column">
      <Header />
      <MainSection />
      <HomePageMusicList />
    </Box>
  );
};

export default Homepage;
