import React, { useEffect, useState } from "react";
import { Box, List, ListItem, Button, Spinner } from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import MusicListItem from "../components/MusicListItem";
import Header from "../components/Header";
const RecommendPage = () => {
  const userID = localStorage.getItem("userID");
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTrackDetails = async (id) => {
    const trackRef = doc(db, "Tracks", id);
    try {
      const trackSnap = await getDoc(trackRef);
      console.log(id);
      if (trackSnap.exists()) {
        const trackDetails = {
          id: trackSnap.id,
          ...trackSnap.data(),
        };
        return trackDetails;
      } else {
        console.error("Track not found");
        return null;
      }
    } catch (error) {
      console.error("Error fetching track details:", error);
      return null;
    }
  };
  const getRecommendedSongs = async () => {
    setLoading(true);
    const response = await fetch(
      "http://localhost:3000/find_recommended_tracks",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any additional headers if needed
        },
        body: JSON.stringify({ uid: userID }),
      }
    );
    if (!response.ok) {
      setLoading(false);
      throw new Error("500 internal server error");
    }
    const trackIds = await response.json();
    const tracks = await Promise.all(
      trackIds.map((trackId) => fetchTrackDetails(trackId.track_id))
    );
    console.log(tracks);
    setRecommendedTracks(tracks);
    setLoading(false);
  };
  useEffect(() => {
    getRecommendedSongs();
  }, []);

  return (
    <Box>
      <Header />
      <Box p="4" textAlign="center">
        {loading ? (
          <Box>
            <Spinner size="xl" />
            <p>Recommending for your music taste...</p>
          </Box>
        ) : (
          <Box
            textAlign="center"
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <List spacing={3}>
              {recommendedTracks.map((track) => (
                <ListItem key={track.id}>
                  <MusicListItem track={track} />
                </ListItem>
              ))}
            </List>
            <Button mt={6} onClick={getRecommendedSongs}>
              Get Recommendations
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RecommendPage;
