import React, { useState } from "react";
import { Input, Button, Flex, border } from "@chakra-ui/react";

const AddSong = () => {
  const [songName, setSongName] = useState("");

  const searchSpotify = () => {
    const requestURL = `http://127.0.0.1:8080/autocomplete?song=${songName}`;
    fetch(requestURL)
      .then((response) => response.json())
      .then((data) => console.log(data));
  };
  const handleSearch = () => {
    searchSpotify(songName);
  };
  return (
    <Flex direction="row" gap={10} margin="0 auto" width="40%">
      <Input
        colorScheme="white"
        textColor="white"
        type="text"
        placeholder="Enter song name"
        value={songName}
        focusBorderColor="yellow.500"
        onChange={(e) => setSongName(e.target.value)}
        mb={4} // margin-bottom
      />
      <Button colorScheme="yellow" onClick={handleSearch}>
        Search
      </Button>
    </Flex>
  );
};

export default AddSong;
