import React, { useState, useRef } from "react";
import {
  Box,
  Flex,
  Input,
  IconButton,
  Image,
  Menu,
  MenuItem,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import Fuse from "fuse.js";
import MusicListItem from "./MusicListItem";
import home from "../utils/home.svg";
import fire from "../utils/fire.svg";
import add from "../utils/add.svg";
import profile from "../utils/profile.svg";
import chat from "../utils/chat.svg";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import { useEffect } from "react";

const useClickOutside = (ref, callback) => {
  const handleClick = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [ref, callback]);
};

const Header = () => {
  //const { userID } = useAuthStore();
  const userID = localStorage.getItem("userID");
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const dropdownRef = useRef(null);

  // Custom hook to handle clicks outside the dropdown
  useClickOutside(dropdownRef, () => {
    setIsSearchActive(false);
  });

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
  const handleSearch = async () => {
    console.log("Search Query:", searchQuery);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchActive(false); // Don't set isSearchActive to true when the query is empty
      return;
    }

    const tracksCollection = collection(db, "Tracks");
    const usersCollection = collection(db, "Users");

    try {
      const [tracksSnap, usersSnap] = await Promise.all([
        getDocs(tracksCollection),
        getDocs(usersCollection),
      ]);

      const allTracks = tracksSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const allUsers = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Create a new instance of Fuse with your tracks and users data and search options
      const fuseTracks = new Fuse(allTracks, {
        keys: ["track_name"],
        includeScore: true,
        threshold: 0.3,
      });

      const fuseUsers = new Fuse(allUsers, {
        keys: ["username"],
        includeScore: true,
        threshold: 0.3,
      });

      // Search using Fuse and get the results for both tracks and users
      const fuseResultsTracks = fuseTracks.search(searchQuery);
      const fuseResultsUsers = fuseUsers.search(searchQuery);

      // Extract the actual search results from the Fuse matches
      const resultsTracks = fuseResultsTracks.map((result) => ({
        type: "track",
        ...result.item,
      }));
      const resultsUsers = fuseResultsUsers.map((result) => ({
        type: "user",
        ...result.item,
      }));

      // Combine and fill in the remaining results as before
      const allResults = resultsTracks.concat(resultsUsers);
      const remainingResultsCount = 10 - allResults.length;
      const remainingResults = [];

      if (remainingResultsCount > 0) {
        // You can implement logic here to fill remaining results based on your requirements
        // For simplicity, this example fills the remaining results with close matches or random results
        const closeMatches = fuseTracks
          .search("some_default_query")
          .map((result) => ({ type: "track", ...result.item }));
        const randomResults = allTracks
          .sort(() => 0.5 - Math.random())
          .slice(0, remainingResultsCount);

        remainingResults.push(...closeMatches, ...randomResults);
      }

      console.log("Fetched Results:", allResults);
      setSearchResults(allResults.concat(remainingResults).slice(0, 10));
    } catch (error) {
      console.error("Error fetching search results:", error);
    }

    setIsSearchActive(true);
  };

  const handleResultClick = (result, type) => {
    // Implement what happens when a search result is clicked
    console.log("Clicked on result:", result);
    if (type === "user") {
      navigate(`/profile/${result.id}`);
    }

    setIsSearchActive(false);
  };

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      padding="40px 100px"
      bg="#1D2123"
      color="white"
      gap="10px"
      position="relative"
    >
      {/* Left side of the header with two buttons */}
      <Flex align="center" gap="12px">
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: "#000" }}
          color="#FFFFFF"
          w="64px"
          h="64px"
          icon={<Image src={home} />}
          onClick={() => {
            navigate("/home");
          }}
        />
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: "#000" }}
          color="#FFFFFF"
          w="64px"
          h="64px"
          icon={<Image src={fire} />}
          onClick={() => {
            navigate("/add_song");
          }}
        />
      </Flex>

      {/* Center of the header with a search bar */}
      <Box flex="1" ml="4">
        <Flex flexDirection="row" align="center" ref={dropdownRef}>
          <Input
            ml={4}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="unstyled"
            placeholder="Search..."
            _focus={{ outline: "none" }}
          />
          <IconButton
            bg="#33373B5E"
            _hover={{ bg: "#000" }}
            w="64px"
            h="64px"
            icon={<SearchIcon />}
            onClick={() => {
              handleSearch();
              setIsSearchActive(true); // Set isSearchActive to true only on button click
            }}
          />
        </Flex>
        {/* Dropdown Menu for search results */}
        {isSearchActive && (
          <Menu>
            <SimpleGrid
              columns={5}
              spacing={1}
              position="absolute"
              bg="#1A1E1F"
              borderRadius="md"
              p={0}
              zIndex={10} // Set a higher zIndex value
              left="100px" // Adjust the left position as needed
              top="120"
            >
              {/* Display User results */}
              {searchResults
                .filter((result) => result.type === "user")
                .map((userResult) => (
                  <MenuItem
                    key={userResult.id}
                    onClick={() => handleResultClick(userResult, "user")}
                  >
                    <Flex
                      direction="column"
                      align="center"
                      p={1}
                      bg="#1A1E1F"
                      borderRadius="md"
                      boxShadow="md"
                      cursor="pointer"
                      transition="transform 0.2s"
                      _hover={{ transform: "scale(1.05)" }}
                    >
                      {/* Category label for "User" */}
                      <Text
                        position="absolute"
                        top={1}
                        left={1}
                        fontSize="xs"
                        fontWeight="bold"
                        color="white"
                      >
                        User
                      </Text>
                      {/* Add the user's profile photo */}
                      <Image
                        src={userResult.profile_picture_url} // Replace with the actual URL of the user's profile photo
                        alt={userResult.username}
                        boxSize="170px"
                        borderRadius="full"
                        mb={4}
                      />
                      {/* Display the user's username with a dark text color */}
                      <Text fontWeight="bold" color="white">
                        {userResult.username}
                      </Text>
                      {/* Add other user information as needed */}
                    </Flex>
                  </MenuItem>
                ))}

              {/* Display Song results */}
              {searchResults
                .filter((result) => result.type === "track")
                .map((songResult) => (
                  <MenuItem
                    key={songResult.id}
                    onClick={() => handleResultClick(songResult)}
                  >
                    <Flex
                      direction="column"
                      align="center"
                      p={1}
                      bg="#1A1E1F"
                      borderRadius="md"
                      boxShadow="md"
                      cursor="pointer"
                      transition="transform 0.2s"
                      _hover={{ transform: "scale(1.05)" }}
                      position="relative"
                    >
                      {/* Category label for "Song" */}
                      <Text
                        position="absolute"
                        top={2}
                        left={2}
                        fontSize="xs"
                        fontWeight="bold"
                        color="white"
                        zIndex={1}
                        bg="#1A1E1F" // Set the correct background color
                        px={2} // Add some padding for better visibility
                        borderRadius="md" // Set border radius
                      >
                        Song
                      </Text>

                      {/* Use the existing MusicListItem component without modification */}
                      <MusicListItem track={songResult} />
                    </Flex>
                  </MenuItem>
                ))}
            </SimpleGrid>
          </Menu>
        )}
      </Box>

      {/* Right side of the header with three buttons */}
      <Flex align="center" gap="10px">
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: "#000" }}
          color="#FFFFFF"
          w="64px"
          h="64px"
          icon={<Image src={add} />}
          onClick={() => {
            navigate("/recommend_songs");
          }}
        />
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: "#000" }}
          color="#FFFFFF"
          w="64px"
          h="64px"
          icon={<Image src={chat} />}
        />
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: "#000" }}
          color="#FFFFFF"
          w="64px"
          h="64px"
          icon={<Image src={profile} />}
          onClick={() => {
            navigate(`/profile/${userID}`);
          }}
        />
      </Flex>
    </Flex>
  );
};

export default Header;
