import { Box } from "@chakra-ui/react";
import React from "react";
import Header from "../components/Header";
import MusicDetail from "../components/MusicDetail";
import Comments from "../components/Comments";

const MusicDetailPage = () => {
  return (
    <Box display="flex" flexDir="column">
      <Header />
      <MusicDetail />
      <Comments />
    </Box>
  );
};

export default MusicDetailPage;
