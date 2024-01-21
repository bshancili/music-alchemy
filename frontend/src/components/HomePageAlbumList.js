import { Box, Grid, GridItem, Text } from "@chakra-ui/react";
import React, { useEffect, useState, useRef, useCallback } from "react";
import AlbumCard from "./AlbumCard";
import {
  collection,
  getDocs,
  limit,
  query,
  startAfter,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

const HomePageAlbumList = () => {
  const [allAlbums, setAllAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const observer = useRef();
  const [lastVisible, setLastVisible] = useState();
  const [hasMore, setHasMore] = useState(true);

  const fetchInitialAlbums = async () => {
    let queryOptions = query(
      collection(db, "Albums"),
      limit(24),
    );
    try {
      const snap = await getDocs(queryOptions);
      const lastDoc = snap.docs[snap.docs.length - 1];

      if (!lastVisible || lastDoc.id !== lastVisible.id) {
        setLastVisible(lastDoc);
      }
      const albumData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllAlbums((prevAlbums) => [...prevAlbums, ...albumData]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching albums:", error);
    }
  };

  const fetchAllAlbums = async () => {
    if (loading || !lastVisible || !hasMore) return;

    let queryOptions = query(
      collection(db, "Albums"),
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
        const albumData = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllAlbums((prevAlbums) => [...prevAlbums, ...albumData]);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching albums:", error);
    }
  };

  const lastAlbum = useCallback(
    (node) => {
      if (!loading && node) {
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            fetchAllAlbums();
          }
        });

        observer.current.observe(node);
      }
    },
    [loading, allAlbums]
  );

  useEffect(() => {
    fetchInitialAlbums();
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
        textColor="yellow"
      >
        Albums
      </Text>
      <Grid templateColumns="repeat(6, 1fr)" gap={6}>
        {allAlbums.map((album, index) => {
          if (allAlbums.length === index + 1) {
            return (
              <GridItem ref={lastAlbum} key={album.id}>
                <AlbumCard album={album} />
              </GridItem>
            );
          } else {
            return (
              <GridItem key={album.id}>
                <AlbumCard album={album} />
              </GridItem>
            );
          }
        })}
      </Grid>
    </Box>
  );
};

export default HomePageAlbumList;
