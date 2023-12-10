import { Box } from "@chakra-ui/react";
import React from "react";
import Header from "../components/Header";
import LikedSongsTimeGraph from "../components/LikedSongsTimeGraph";
const StatsPage = () => {
  //const [likedSongs, setLikedSongs] = useState([]);
  //const userID = localStorage.getItem("userID");

  return (
    <Box
      h="100%"
      bg="#1D2123"
      display="flex"
      flexDirection="column"
      overflowY="hidden"
    >
      <Header />
      <LikedSongsTimeGraph />
    </Box>
  );
};

export default StatsPage;
