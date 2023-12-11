import { Box, Text, Button, useToast, Image } from "@chakra-ui/react";
import React from "react";
import { pythonApi } from "../api/axios";

import { db } from "../firebase";
import {
  collection,
  where,
  query,
  getDocs,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

const CreateSongResult = ({ track }) => {
  const userID = localStorage.getItem("userID");
  const toast = useToast();

  const addSongToDB = async () => {
    const userRef = doc(db, "Users", userID);
    const userDoc = await getDoc(userRef);
    const createdSongsArray = userDoc.data().created_songs || [];
    console.log(track);

    try {
      const response = await pythonApi.post("/create_song", {
        track_spotify_id: track.spotify_track_id,
      });
      const tracksCollection = collection(db, "Tracks");
      const q = query(
        tracksCollection,
        where("track_name", "==", track.track_name)
      );
      const querySnap = await getDocs(q);
      console.log("Song ID:", querySnap.docs[0].id);
      const timestamp = new Date();
      const updatedCreatedSongs = {
        ...createdSongsArray,
        [querySnap.docs[0].id]: { timestamp },
      };
      const likedSongsArray = userDoc.data().liked_song_list || [];
      const updatedLikedSongs = {
        ...likedSongsArray,
        [querySnap.docs[0].id]: { timestamp },
      };
      await updateDoc(userRef, {
        created_songs: updatedCreatedSongs,
      });

      if (response.data.success) {
        const songRef = doc(db, "Tracks", querySnap.docs[0].id);
        await updateDoc(songRef, {
          like_count: 1,
        });
        await updateDoc(userRef, {
          liked_song_list: updatedLikedSongs,
        });
        toast({
          title: `${track.track_name} added to database`,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      } else {
        toast({
          title: `${track.track_name} is already in the database`,
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    } catch (error) {
      toast({
        title: `track.track_name could not be added to database`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  return (
    <Box
      borderWidth="1px"
      borderRadius="20px"
      overflow="hidden"
      position="relative"
      transition="transform 0.2s ease-in-out"
      _hover={{
        transform: "scale(1.08)",
      }}
      onClick={addSongToDB}
      cursor="pointer"
    >
      <Image
        // God know why we need that question mark
        src={track.album_images[1]?.url}
        alt="Album Cover"
        w="183px"
        h="183px"
        objectFit="cover"
        transition="transform 0.2s ease-in-out"
        _hover={{
          transform: "scale(1.4)",
        }}
      />
      <Text
        position="absolute"
        bottom="6"
        left="2"
        fontSize="md"
        color="white"
        fontWeight="bold"
        lineHeight={1.3}
        mb={1.5}
        transition="bottom 0.2s ease-in-out"
      >
        {track.track_name}
      </Text>
      <Text
        position="absolute"
        bottom="2"
        left="3"
        fontSize="sm"
        fontWeight="w.300"
        color="white"
      >
        {track["artist(s)"][0]}
      </Text>
    </Box>
  );
};

export default CreateSongResult;
