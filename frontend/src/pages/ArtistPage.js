import { Box, Text } from "@chakra-ui/react";
import React, { useMemo } from "react";
import Header from "../components/Header";
import ArtistDetail from "../components/ArtistDetail";
import { useLocation } from "react-router-dom";

const ArtistDetailPage = () => {
  const location = useLocation();
  const artistData = useMemo(
    () => location.state?.artistData || {},
    [location.state?.artistData]
  );

  return (
    <Box display="flex" flexDir="column" h="100vh" bg="#1D2123">
      <Header />
      <ArtistDetail t={artistData} />
 
    </Box>
  );
};

export default ArtistDetailPage;
