import { Box, Grid, GridItem, Text } from "@chakra-ui/react";
import React, { useEffect, useState, useRef, useCallback } from "react";
import AlbumCardItem from "./AlbumCardItem";
import ArtistCardItem from "./ArtistCardItem";
import {
  collection,
  getDocs,
  limit,
  query,
  startAfter,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

const HomePageArtistList = () => {
  const [allArtists, setAllArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const observer = useRef();
  const [lastVisible, setLastVisible] = useState();
  const [hasMore, setHasMore] = useState(true);

  const fetchInitialArtists = async () => {
    let queryOptions = query(
      collection(db, "Artists"),
      limit(24),
    );
    try {
      const snap = await getDocs(queryOptions);
      const lastDoc = snap.docs[snap.docs.length - 1];

      if (!lastVisible || lastDoc.id !== lastVisible.id) {
        setLastVisible(lastDoc);
      }
      const artistData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllArtists((prevArtists) => [...prevArtists, ...artistData]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching artists:", error);
    }
  };

  const fetchAllArtists = async () => {
    if (loading || !lastVisible || !hasMore) return;

    let queryOptions = query(
      collection(db, "Artists"),
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
        const artistData = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllArtists((prevArtists) => [...prevArtists, ...artistData]);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching artists:", error);
    }
  };

  const lastArtist = useCallback(
    (node) => {
      if (!loading && node) {
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            fetchAllArtists();
          }
        });

        observer.current.observe(node);
      }
    },
    [loading, allArtists]
  );

  useEffect(() => {
    fetchInitialArtists();
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
        textColor="green"
      >
        Artists
      </Text>
      <Grid templateColumns="repeat(6, 1fr)" gap={6}>
        {allArtists.map((artist, index) => {
          if (allArtists.length === index + 1) {
            return (
              <GridItem ref={lastArtist} key={artist.id}>
                <ArtistCardItem artist={artist} />
              </GridItem>
            );
          } else {
            return (
              <GridItem key={artist.id}>
                <ArtistCardItem artist={artist} />
              </GridItem>
            );
          }
        })}
      </Grid>
    </Box>
  );
};

export default HomePageArtistList;
