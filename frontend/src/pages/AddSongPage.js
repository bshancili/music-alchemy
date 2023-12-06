import { Box } from "@chakra-ui/react";
import React from "react";
import Header from "../components/Header";
import AddSong from "../components/AddSong";

const AddSongPage = () => {
  return (
    <Box height="100vh" bg="#1D2123" display="flex" flexDirection="column">
      <Header />
      <AddSong />
    </Box>
  );
};

export default AddSongPage;
