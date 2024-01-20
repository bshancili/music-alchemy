import { Box } from "@chakra-ui/react";
import React, { useMemo } from "react";
import Header from "../components/Header";
import ArtistDetail from "../components/ArtistDetail";
import Comments from "../components/Comments";
import { useLocation } from "react-router-dom";

const ArtistDetailPage = () => {
  const location = useLocation();
  const trackData = useMemo(
    () => location.state?.trackData || {},
    [location.state?.trackData]
  );

  return (
    <Box display="flex" flexDir="column" h="100vh" bg="#1D2123">
      <Header />
      <ArtistDetail t={trackData} />
      <Comments track={trackData} />
    </Box>
  );
};

export default ArtistDetailPage;
