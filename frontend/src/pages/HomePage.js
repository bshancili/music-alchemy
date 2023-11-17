// Import necessary Chakra UI components
import React, { useEffect, useState } from "react";

import { Box, Button } from "@chakra-ui/react";
// Import your image files
import Header from "../components/Header";
import MainSection from "../components/MainSection";
import HomePageMusicList from "../components/HomePageMusicList";
import { db } from "../firebase";
import { collection, getDocs, limit } from "firebase/firestore";
// Homepage component
const Homepage = () => {
  const [allTracks, setAllTracks] = useState([]);
  const [visibleTracks, setVisibleTracks] = useState(50);
  const fetchAllTracks = async () => {
    const tracksCollection = collection(db, "Tracks");

    try {
      const snap = await getDocs(tracksCollection, limit(50));
      const trackData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllTracks(trackData);
    } catch (error) {
      console.error("Error fetching tracks:", error);
    }
  };
  const loadMoreTracks = async () => {
    setVisibleTracks((prevVisibleTracks) => prevVisibleTracks + 50);
  };
  useEffect(() => {
    fetchAllTracks();
  }, [visibleTracks]);

  useEffect(() => {
    console.log(allTracks);
  }, []);

  return (
    <Box h="100vh" bg="#1D2123" display="flex" flexDirection="column">
      <Header />
      <MainSection topTracks={allTracks.slice(0, 3)} />
      <HomePageMusicList allTracks={allTracks} />
      {allTracks.length < visibleTracks && (
        <Button onClick={loadMoreTracks} mt={4} colorScheme="teal" size="lg">
          Load More
        </Button>
      )}
    </Box>
  );
};

export default Homepage;
