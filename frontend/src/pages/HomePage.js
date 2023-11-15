// Import necessary Chakra UI components
import React, { useEffect, useState } from "react";

import { Box, Flex, Text, extendTheme } from "@chakra-ui/react";
// Import your image files
import Header from "../components/Header";
import MainSection from "../components/MainSection";
import HomePageMusicList from "../components/HomePageMusicList";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
// Homepage component
const Homepage = () => {
  const [allTracks, setAllTracks] = useState([]);

  const fetchAllTracks = async () => {
    const tracksCollection = collection(db, "Tracks");
    console.log(tracksCollection);

    try {
      const snap = await getDocs(tracksCollection);
      const trackData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllTracks(trackData);
    } catch (error) {
      console.error("Error fetching tracks:", error);
    }
  };

  useEffect(() => {
    fetchAllTracks();
  }, []);

  useEffect(() => {
    console.log(allTracks);
  }, []);

  return (
    <Box h="100vh" bg="#1D2123" display="flex" flexDirection="column">
      <Header />
      <MainSection topTracks={allTracks.slice(0, 3)} />
      <HomePageMusicList allTracks={allTracks} />
    </Box>
  );
};

export default Homepage;
