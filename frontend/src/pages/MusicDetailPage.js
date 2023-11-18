import { Box } from "@chakra-ui/react";
import React, { useEffect, useMemo } from "react";
import Header from "../components/Header";
import MusicDetail from "../components/MusicDetail";
import Comments from "../components/Comments";
import { useLocation } from "react-router-dom";

const MusicDetailPage = () => {
  const location = useLocation();
  const trackData = useMemo(
    () => location.state?.trackData || {},
    [location.state?.trackData]
  );

  return (
    <Box display="flex" flexDir="column" h="100vh" bg="#1D2123">
      <Header />
      <MusicDetail t={trackData} />
      <Comments />
    </Box>
  );
};

export default MusicDetailPage;
