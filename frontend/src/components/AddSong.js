import React, { useState } from "react";
import { Input, Button, Flex, Text, Box } from "@chakra-ui/react";
import CreateSongResult from "./CreateSongResult";

const AddSong = () => {
  const [songName, setSongName] = useState("");
  const [songResults, setSongResults] = useState([]);
  const [isSearched, setIsSearched] = useState(false);
  const searchSpotify = async () => {
    const requestURL = `http://127.0.0.1:8080/autocomplete?song=${songName}`;
    const response = await fetch(requestURL);
    const data = await response.json();
    setSongResults(data.suggestions);
  };
  const handleSearch = () => {
    searchSpotify(songName);
    setIsSearched(true);
    console.log(songResults);
  };
  const handleEnterKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
  return (
    <div>
      <Flex direction="row" gap={10} margin="0 auto" width="40%">
        <Input
          colorScheme="white"
          textColor="white"
          type="text"
          placeholder="Enter song name"
          value={songName}
          focusBorderColor="yellow.500"
          onChange={(e) => setSongName(e.target.value)}
          mb={4}
          onKeyDown={handleEnterKeyPress}
        />
        <Button colorScheme="yellow" onClick={handleSearch}>
          Search
        </Button>
      </Flex>
      {isSearched && (
        <Box display="flex" alignItems="center" flexDirection="column" gap={5}>
          <Text color="white">Which Song Do You Want To Add?</Text>
          {songResults.map((result, index) => (
            <CreateSongResult key={index} track={result} />
          ))}
        </Box>
      )}
    </div>
  );
};

export default AddSong;
