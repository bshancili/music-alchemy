import React, { useState } from "react";
import {
  Input,
  Button,
  Flex,
  Text,
  Box,
  Grid,
  GridItem,
  useToast,
  VStack,
  HStack,
} from "@chakra-ui/react";
import CreateSongResult from "./CreateSongResult";

const AddSong = () => {
  const [songName, setSongName] = useState("");
  const [songResults, setSongResults] = useState([]);
  const [isSearched, setIsSearched] = useState(false);
  const toast = useToast();
  const searchSpotify = async () => {
    const requestURL = `http://127.0.0.1:8080/autocomplete?song=${songName}`;
    const response = await fetch(requestURL);
    const data = await response.json();
    setSongResults(data.suggestions);
  };
  const handleSearch = async () => {
    if (songName === "") {
      toast({
        title: "Please enter a songname to search",
        status: "warning",
        position: "bottom",
        isClosable: "true",
      });
      return;
    }
    searchSpotify();
    setIsSearched(true);
  };
  const handleEnterKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
  return (
    <Box display="flex" flexDirection="column">
      <HStack>
        <Input
          width="100%"
          colorScheme="white"
          textColor="white"
          type="text"
          placeholder="Enter song name"
          value={songName}
          focusBorderColor="yellow.500"
          onChange={(e) => setSongName(e.target.value)}
          onKeyDown={handleEnterKeyPress}
        />
        <Button colorScheme="yellow" onClick={handleSearch}>
          Search
        </Button>
      </HStack>

      {isSearched && (
        <Box>
          <Text color="white" fontWeight="bold" fontSize="2xl" mb={6} mt={6}>
            Which Song Do You Want To Add?
          </Text>

          <Grid templateColumns="repeat(5, 1fr)" gap={4}>
            {songResults.map((result, index) => (
              <GridItem>
                <CreateSongResult key={index} track={result} />
              </GridItem>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default AddSong;
