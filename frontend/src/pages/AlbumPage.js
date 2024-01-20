import { Box } from "@chakra-ui/react";
import React, { useMemo } from "react";
import Header from "../components/Header";
import AlbumDetail from "../components/AlbumDetail";
import Comments from "../components/Comments";
import { useLocation } from "react-router-dom";

const AlbumDetailPage = () => {
  const location = useLocation();
  const trackData = useMemo(
    () => location.state?.trackData || {},
    [location.state?.trackData]
  );

  return (
    <Box display="flex" flexDir="column" h="100vh" bg="#1D2123">
      <Header />
      <AlbumDetail t={trackData} />
      <Comments track={trackData} />
    </Box>
  );
};

export default AlbumDetailPage;
