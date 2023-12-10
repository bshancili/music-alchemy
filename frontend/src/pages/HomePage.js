// Import necessary Chakra UI components
import React, { useEffect, useState } from "react";

import { Box } from "@chakra-ui/react";
// Import your image files
import Header from "../components/Header";
import MainSection from "../components/MainSection";
import HomePageMusicList from "../components/HomePageMusicList";
import { db } from "../firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";

const Homepage = () => {
  const [allTracks, setAllTracks] = useState([]);

  const fetchAllTracks = async () => {
    //const tracksCollection = collection(db, "Tracks");
    const first = query(collection(db, "Tracks"), limit(12));

    try {
      const snap = await getDocs(first);
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

  return (
    <Box h="100vh" bg="#1D2123" display="flex" flexDirection="column">
      <Header />
      <MainSection topTracks={allTracks.slice(0, 3)} />
      <HomePageMusicList />
    </Box>
  );
};

export default Homepage;
