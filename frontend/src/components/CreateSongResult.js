import { Box, Text, Button, Spacer, useToast } from "@chakra-ui/react";
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

    try {
      const response = await pythonApi.post("/create_song", {
        track_name: track.track_name,
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
      await updateDoc(userRef, {
        created_songs: updatedCreatedSongs,
      });
      if (response.data.success) {
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
    <Button
      display="flex"
      flexDirection="row"
      colorScheme="yellow"
      padding={6}
      gap={3}
      onClick={addSongToDB}
    >
      <Text>Album: {track.album_name}</Text>
      <Text>Song Name: {track.track_name} </Text>
      <Text>Artist: {track["artist(s)"][0]}</Text>
    </Button>
  );
};

export default CreateSongResult;
