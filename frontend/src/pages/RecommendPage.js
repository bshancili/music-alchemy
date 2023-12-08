import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Button,
  Grid,
  GridItem,
  Spinner,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import MusicListItem from "../components/MusicListItem";
import Header from "../components/Header";
import { fetchTemporalRecommendation } from "../api/api";
const RecommendPage = () => {
  const userID = localStorage.getItem("userID");
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [tempRecSongs, setTempRecSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTrackDetails = async (id) => {
    const trackRef = doc(db, "Tracks", id);
    try {
      const trackSnap = await getDoc(trackRef);
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
  const fetchTemp = async () => {
    console.log("clicked");
    if (loading) return;
    setLoading(true);
    const response = await fetch(
      "http://localhost:3000/temporal_recommendation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any additional headers if needed
        },
        body: JSON.stringify({ uid: userID }),
      }
    );
    const trackIds = await response.json();
    console.log(trackIds);
    if (Array.isArray(trackIds) && trackIds.length > 0) {
      // Filter out items without track_id property
      const validTrackIds = trackIds
        .filter((item) => item.track_id !== undefined && item.track_id !== null)
        .map((item) => item.track_id);

      const tracks = await Promise.all(
        validTrackIds.map((trackId) => fetchTrackDetails(trackId.track_id))
      );
      setTempRecSongs(tracks);
      console.log(tracks);
      setLoading(false);
    } else if (Array.isArray(trackIds) === 0) {
      fetchTemp();
    }
  };
  const getRecommendedSongs = async () => {
    try {
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
      //console.log(tracks);
      setRecommendedTracks(tracks);
      setLoading(false);
    } catch (error) {
      console.error("zortladik");
    }
  };
  useEffect(() => {
    getRecommendedSongs();
    fetchTemp();
    //fetchTemporalRecommendation(userID, setTempRecSongs);
  }, []);

  return (
    <Box bg="#1D2123" h="100vh">
      <Header />
      <Box p="4" color="white" textAlign="center">
        <Tabs colorScheme="yellow" align="center">
          <TabList>
            <Tab>Activity Recommendations</Tab>
            <Tab>Friend Recommendations</Tab>
            <Tab>Temporal Recommendations</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {loading ? (
                <Box>
                  <Spinner size="xl" />
                  <Text>Recommending for your music taste...</Text>
                </Box>
              ) : (
                <Box
                  textAlign="center"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                >
                  <Grid templateColumns="repeat(4, 1fr)" gap={3}>
                    {recommendedTracks.map((track) => (
                      <GridItem key={track.id}>
                        <MusicListItem track={track} />
                      </GridItem>
                    ))}
                  </Grid>
                  <Button mt="30px" onClick={getRecommendedSongs}>
                    Get Recommendations
                  </Button>
                </Box>
              )}
            </TabPanel>
            <TabPanel>{}</TabPanel>
            <TabPanel>
              {" "}
              {loading ? (
                <Box>
                  <Spinner size="xl" />
                  <Text>Recommendations from Past...</Text>
                </Box>
              ) : (
                <Box
                  textAlign="center"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                >
                  <Grid templateColumns="repeat(4, 1fr)" gap={3}>
                    {tempRecSongs.map((track) => (
                      <GridItem key={track.id}>
                        <MusicListItem track={track} />
                      </GridItem>
                    ))}
                  </Grid>
                  <Button mt="30px" onClick={fetchTemp}>
                    Get Temporal Recommendations
                  </Button>
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default RecommendPage;
