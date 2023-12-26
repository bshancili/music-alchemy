import React from "react";
import { Box } from "@chakra-ui/react";
import Header from "../components/Header";
import PlaylistHeader from "../components/PlaylistHeader";
const PlaylistPage = () => {
  return (
    <Box display="flex" flexDir="column" h="100vh" bg="#1D2123">
      <Header />
      <PlaylistHeader />
    </Box>
  );
};
export default PlaylistPage;
