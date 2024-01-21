import { Box } from "@chakra-ui/react";
import React, { useMemo } from "react";
import Header from "../components/Header";
import AlbumDetail from "../components/AlbumDetail";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AlbumCardItem from "../components/AlbumCardItem";
import MusicListItem from "../components/MusicListItem";
const AlbumDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleItemClick = (track) => {
    navigate(`/music/${track.id}`, {
      state: { trackData: track },
    });
  };
  const albumData = useMemo(
    () => location.state?.albumData || {},
    [location.state?.albumData]
  );

  return (
    <Box display="flex" flexDir="column" h="100vh" bg="#1D2123">
      <Header />
      <AlbumDetail t={albumData} />
    
    </Box>
  );
};

export default AlbumDetailPage;
