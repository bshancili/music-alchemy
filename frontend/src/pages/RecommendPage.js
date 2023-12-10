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
import { fetchTemp, fetchFriendRecommendations } from "../api/api";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import MusicListItem from "../components/MusicListItem";
import Header from "../components/Header";
const RecommendPage = () => {
  const userID = localStorage.getItem("userID");
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [tempRecSongs, setTempRecSongs] = useState([]);
  const [loadingF, setLoadingF] = useState(false);
  const [loadingT, setLoadingT] = useState(false);
  const [loadingA, setLoadingA] = useState(false);

  const [friendRecTracks, setFriendRecSongs] = useState([]);
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
  const fetchRecommendedSongs = async () => {
    try {
      setLoadingA(true);
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

      const trackIds = await response.json();

      const tracks = await Promise.all(
        trackIds.map((trackId) => fetchTrackDetails(trackId.track_id))
      );
      console.log(tracks);
      setRecommendedTracks(tracks);
      setLoadingA(false);
    } catch (error) {
      console.error("zortladik");
    }
  };
  useEffect(() => {
    fetchRecommendedSongs();
    fetchTemp(userID, setTempRecSongs, loadingT, setLoadingT);
    fetchFriendRecommendations(
      userID,
      setFriendRecSongs,
      loadingF,
      setLoadingF
    );
  }, [fetchTemp]);

  return (
    <Box bg="#1D2123" h="100vh">
      <Header />
      <Box p="4" color="white" textAlign="center" bg="#1D2123">
        <Tabs colorScheme="yellow" align="center">
          <TabList>
            <Tab>Activity Recommendations</Tab>
            <Tab>Friend Recommendations</Tab>
            <Tab>Temporal Recommendations</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {loadingA ? (
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
                  <Button mt="30px" onClick={fetchRecommendedSongs}>
                    Get Recommendations
                  </Button>
                </Box>
              )}
            </TabPanel>
            <TabPanel>
              {loadingF ? (
                <Box>
                  <Spinner size="xl" />
                  <Text>Recommendations from Friends...</Text>
                </Box>
              ) : (
                <Box
                  textAlign="center"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                >
                  <Grid templateColumns="repeat(4, 1fr)" gap={3}>
                    {friendRecTracks.map((track) => (
                      <GridItem key={track.id}>
                        <MusicListItem track={track} />
                      </GridItem>
                    ))}
                  </Grid>
                  <Button
                    mt="30px"
                    onClick={() =>
                      fetchFriendRecommendations(
                        userID,
                        setFriendRecSongs,
                        loadingF,
                        setLoadingF
                      )
                    }
                  >
                    Get Friends Recommendations
                  </Button>
                </Box>
              )}
            </TabPanel>
            <TabPanel>
              {" "}
              {loadingT ? (
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
                  <Button
                    mt="30px"
                    onClick={() =>
                      fetchTemp(userID, setTempRecSongs, loadingT, setLoadingT)
                    }
                  >
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
