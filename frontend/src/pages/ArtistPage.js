import { Box, Text, Flex } from "@chakra-ui/react";
import React, { useMemo } from "react";
import Header from "../components/Header";
import ArtistDetail from "../components/ArtistDetail";
import { useLocation } from "react-router-dom";

import { fetchTrackDetails } from "../api/api";
import AlbumCardItem from "../components/AlbumCardItem";

const ArtistDetailPage = () => {
  const location = useLocation();
  const artistData = useMemo(
    () => location.state?.artistData || {},
    [location.state?.artistData]
  );

  
  const [tracksDetails, setTracksDetails] = React.useState([]);

  React.useEffect(() => {
    const fetchDetails = async () => {
      const details = await Promise.all(
        artistData.existing_tracks.map((trackId) => fetchTrackDetails(trackId))
      );
      setTracksDetails(details);
    };

    if (artistData.existing_tracks && artistData.existing_tracks.length > 0) {
      fetchDetails();
    }
  }, [artistData.existing_tracks]);


  return (
    <Box display="flex" flexDir="column" h="100vh" bg="#1D2123">
      <Header />
      <ArtistDetail t={artistData} />
      <Box mt={4} ml={40}> 
        <Text color="white" fontSize="lg" fontWeight="bold">
          This Artist's Songs:
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

export default ArtistDetailPage;
