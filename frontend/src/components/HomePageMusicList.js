import {
  Grid,
  GridItem,
  Select,
  Box,
  Text,
  FormLabel,
  FormControl,
} from "@chakra-ui/react";
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
  const [lastVisible, setLastVisible] = useState();
  const [hasMore, setHasMore] = useState(true); // New state variable
  const [sortOption, setSortOption] = useState("rating");

  const fetchInitialTracks = async () => {
    let sortOrder = "desc"; // Default sorting order
    if (sortOption === "track_name") {
      sortOrder = "asc"; // Change sorting order to ascending for track names
    }
    let queryOptions = query(
      collection(db, "Tracks"),
      limit(24),
      orderBy(sortOption, sortOrder)
    );
    try {
      const snap = await getDocs(queryOptions);
      const lastDoc = snap.docs[snap.docs.length - 1];

      if (!lastVisible || lastDoc.id !== lastVisible.id) {
        setLastVisible(lastDoc);
      }
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

  const fetchAllTracks = async () => {
    if (loading || !lastVisible | !hasMore) return;
    let sortOrder = "desc"; // Default sorting order
    if (sortOption === "track_name") {
      sortOrder = "asc"; // Change sorting order to ascending for track names
    }
    let queryOptions = query(
      collection(db, "Tracks"),
      orderBy(sortOption, sortOrder),
      limit(18),
      startAfter(lastVisible)
    );

    setLoading(true);

    try {
      const snap = await getDocs(queryOptions);
      if (snap.docs.length === 0) {
        setHasMore(false);
      } else {
        const lastDoc = snap.docs[snap.docs.length - 1];

        if (!lastVisible || lastDoc.id !== lastVisible.id) {
          setLastVisible(lastDoc);
        }
        const trackData = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllTracks((prevTracks) => [...prevTracks, ...trackData]);
        console.log(allTracks);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching tracks:", error);
    }
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
    setAllTracks([]);
    setLastVisible(null);
    setHasMore(true);
  };

  const lastTrack = useCallback(
    (node) => {
      if (!loading && node) {
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            fetchAllTracks();
          }
        });

        observer.current.observe(node);
      }
    },
    [loading, allTracks]
  );

  useEffect(() => {
    fetchInitialTracks();
  }, [sortOption]);

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
        textColor="teal"
      >
        Music
      </Text>

      <FormControl>
        <FormLabel color="white">Sort by:</FormLabel>
        <Select
          color="white"
          value={sortOption}
          onChange={handleSortChange}
          width="150px"
        >
          <option value="rating">Rating</option>
          <option value="like_count">Like Count</option>
          <option value="track_name">Track Name</option>
        </Select>
      </FormControl>

      <Grid mt={3} templateColumns="repeat(6, 1fr)" gap={6}>
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
