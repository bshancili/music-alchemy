import { Grid, GridItem, Button, Box, Text } from "@chakra-ui/react";
import React from "react";
import AlbumCardItem from "./AlbumCardItem";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  collection,
  getDocs,
  limit,
  query,
  startAfter,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

const HomePageMusicList = () => {
  const [allTracks, setAllTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const observer = useRef();

  const fetchAllTracks = async (startAfterDoc) => {
    //const tracksCollection = collection(db, "Tracks");
    let queryOptions = query(
      collection(db, "Tracks"),
      limit(42),
      orderBy("rating", "desc")
    );

    if (startAfterDoc && !setLoading) {
      queryOptions = query(
        collection(db, "Tracks"),
        orderBy("rating", "desc"),
        startAfter(startAfterDoc),
        limit(12)
      );
    }
    setLoading(true);

    try {
      const snap = await getDocs(queryOptions);
      const trackData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllTracks((prevTracks) => [...prevTracks, ...trackData]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tracks:", error);
    }
  };

  const lastTrack = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchAllTracks(allTracks[allTracks.length - 1]);
        }
      });
      if (node) observer.current.observe(node);
      console.log(node);
    },
    [loading, allTracks]
  );

  useEffect(() => {
    fetchAllTracks();
  }, []);

  return (
    <Box bg="#1D2123" padding="50px 96px" flexDirection={"column"}>
      <Text
        bottom="12px"
        left="3"
        fontSize="md"
        color="white"
        fontWeight="bold"
        lineHeight={1.3}
        mb={1.5}
      >
        Music
      </Text>
      <Grid templateColumns="repeat(6, 1fr)" gap={6}>
        {allTracks.map((track, index) => {
          if (allTracks.length === index + 1) {
            return (
              <GridItem ref={lastTrack} key={track.id}>
                <AlbumCardItem track={track} />
              </GridItem>
            );
          } else {
            return (
              <GridItem key={track.id}>
                <AlbumCardItem track={track} />
              </GridItem>
            );
          }
        })}
      </Grid>
    </Box>
  );
};

export default HomePageMusicList;
