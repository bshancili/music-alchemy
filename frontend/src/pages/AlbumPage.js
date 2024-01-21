import { Box, Text, Flex } from "@chakra-ui/react";
import React, { useMemo } from "react";
import Header from "../components/Header";
import AlbumDetail from "../components/AlbumDetail";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AlbumCardItem from "../components/AlbumCardItem";
import MusicListItem from "../components/MusicListItem";
// Import fetchTrackDetails from the correct file
import { fetchTrackDetails } from "../api/api";

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

  const [tracksDetails, setTracksDetails] = React.useState([]);

  React.useEffect(() => {
    const fetchDetails = async () => {
      const details = await Promise.all(
        albumData.existing_tracks.map((trackId) => fetchTrackDetails(trackId))
      );
      setTracksDetails(details);
    };

    if (albumData.existing_tracks && albumData.existing_tracks.length > 0) {
      fetchDetails();
    }
  }, [albumData.existing_tracks]);

  return (
    <Box display="flex" flexDir="column" h="100vh" bg="#1D2123">
      <Header />
      <AlbumDetail t={location.state?.albumData || {}} />

      <Box mt={4} ml={40}> 
        <Text color="white" fontSize="lg" fontWeight="bold">
          This Album's Songs:
        </Text>
        <Flex>
          {tracksDetails.length > 0 ? (
            tracksDetails.map((track) => (
              <Box key={track.id} color="white" mr={4}> 
                <AlbumCardItem track={track} />
              </Box>
            ))
          ) : (
            <Text color="white">No songs available for this album.</Text>
          )}
        </Flex>
      </Box>
    </Box>
  );
};

export default AlbumDetailPage;
