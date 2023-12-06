import { Box, Text, Button, Spacer, useToast } from "@chakra-ui/react";
import React from "react";
import pyhtonApi from "../api/axios";
import pythonApi from "../api/axios";

const CreateSongResult = ({ track }) => {
  const toast = useToast();
  const addSongToDB = async () => {
    try {
      const response = await pythonApi.post("/create_song", {
        track_name: track.track_name,
      });
      if (response) {
        toast({
          title: `track.track_name added to database`,
          status: "success",
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
