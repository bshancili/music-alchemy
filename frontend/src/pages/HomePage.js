// Import necessary Chakra UI components
import React, { useEffect, useState } from "react";

import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
// Import your image files
import Header from "../components/Header";
import MainSection from "../components/MainSection";
import HomePageMusicList from "../components/HomePageMusicList";
import HomePageAlbumList from "../components/HomePageAlbumList";
import HomePageArtistList from "../components/HomePageArtistList";
import { db } from "../firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";

const Homepage = () => {
  const [allTracks, setAllTracks] = useState([]);
  const [allAlbums, setAllAlbums] = useState([]);
  const [allArtists, setAllArtists] = useState([]);

  const fetchAllTracks = async () => {
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

  const fetchAllAlbums = async () => {
    // Add logic to fetch albums from the database
    // Example:
     const albumsCollection = collection(db, "Albums");
     const albumsQuery = query(albumsCollection, limit(12));
     try {
       const snap = await getDocs(albumsQuery);
       const albumData = snap.docs.map((doc) => ({
         id: doc.id,
         ...doc.data(),
       }));
       setAllAlbums(albumData);
     } catch (error) {
       console.error("Error fetching albums:", error);
     }
  };

  const fetchAllArtists = async () => {
    // Add logic to fetch artists from the database
    // Example:
     const artistsCollection = collection(db, "Artists");
     const artistsQuery = query(artistsCollection, limit(12));
     try {
       const snap = await getDocs(artistsQuery);
       const artistData = snap.docs.map((doc) => ({
         id: doc.id,
         ...doc.data(),
       }));
       setAllArtists(artistData);
     } catch (error) {
       console.error("Error fetching artists:", error);
     }
  };

  useEffect(() => {
    fetchAllTracks();
    fetchAllAlbums();
    fetchAllArtists();
  }, []);

  return (
    <Box bg="#1D2123" h="100vh" display="flex" flexDirection="column">
    
      <Header />
      <MainSection topTracks={allTracks.slice(0, 3)} />
      <Box
      w="100%"
      backgroundColor="#1D2123"
      display="flex"
      flexDir="row"
      padding="10px 100px"
      justifyContent="space-between"
    > 
          <Tabs colorScheme="yellow" borderBottom="none">
          <TabList>
          <Tab _selected={{ color: "teal", bg: "#1D2123", borderBottomColor:"teal" }} _active={{ color: "white", bg: "#1D2123" }} _hover={{ color: "white", bg: "#1D2123" }} color="white" >Music</Tab>
          <Tab _selected={{ color: "yellow", bg: "#1D2123", borderBottomColor:"yellow" }} _active={{ color: "gray.500", bg: "#2D3338" }} _hover={{ color: "white", bg: "#2D3338" }} color="white" >Albums</Tab>
        <Tab _selected={{ color: "green", bg: "#1D2123", borderBottomColor:"green" }} _active={{ color: "gray.500", bg: "#2D3338" }} _hover={{ color: "white", bg: "#2D3338" }} color="white">Artists</Tab>
      </TabList>

      <TabPanels colorScheme="yellow">
        <TabPanel>
          <HomePageMusicList />
        </TabPanel>
        <TabPanel>
          <HomePageAlbumList albums={allAlbums} />
        </TabPanel>
        <TabPanel>
          <HomePageArtistList artists={allArtists} />
        </TabPanel>
      </TabPanels>
    </Tabs>
    </Box>

    </Box>
  );
};

export default Homepage;
