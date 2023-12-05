import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import Fuse from 'fuse.js';
import MusicListItem from './MusicListItem';
import heart from '../utils/heart.svg';
import home from '../utils/home.svg';
import fire from '../utils/fire.svg';
import add from '../utils/add.svg';
import profile from '../utils/profile.svg';
import chat from '../utils/chat.svg';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import useAuthStore from '../stores/authStore';

const Header = () => {
  //const { userID } = useAuthStore();
  const userID = localStorage.getItem('userID');
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };
  const handleSearch = async () => {
    console.log('Search Query:', searchQuery);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const tracksCollection = collection(db, 'Tracks');
    const usersCollection = collection(db, 'Users');

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
        keys: ['track_name'],
        includeScore: true,
        threshold: 0.3,
      });

      const fuseUsers = new Fuse(allUsers, {
        keys: ['username'],
        includeScore: true,
        threshold: 0.3,
      });

      // Search using Fuse and get the results for both tracks and users
      const fuseResultsTracks = fuseTracks.search(searchQuery);
      const fuseResultsUsers = fuseUsers.search(searchQuery);

      // Extract the actual search results from the Fuse matches
      const resultsTracks = fuseResultsTracks.map((result) => ({
        type: 'track',
        ...result.item,
      }));
      const resultsUsers = fuseResultsUsers.map((result) => ({
        type: 'user',
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
          .search('some_default_query')
          .map((result) => ({ type: 'track', ...result.item }));
        const randomResults = allTracks
          .sort(() => 0.5 - Math.random())
          .slice(0, remainingResultsCount);

        remainingResults.push(...closeMatches, ...randomResults);
      }

      console.log('Fetched Results:', allResults);
      setSearchResults(allResults.concat(remainingResults).slice(0, 10));
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleResultClick = (result, type) => {
    // Implement what happens when a search result is clicked
    console.log('Clicked on result:', result);
    if (type === 'user') {
      navigate(`/profile/${result.id}`);
    }
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
          _hover={{ bg: '#000' }}
          color="#FFFFFF"
          w="64px"
          h="64px"
          icon={<Image src={home} />}
          onClick={() => {
            navigate('/home');
          }}
        />
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: '#000' }}
          color="#FFFFFF"
          w="64px"
          h="64px"
          icon={<Image src={fire} />}
        />
      </Flex>

      {/* Center of the header with a search bar */}
      <Box flex="1" ml="4">
        <Flex flexDirection="row" align="center">
          <Input
            ml={4}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={handleSearch}
            onKeyPress={handleKeyPress} // Trigger search on blur (you can change this behavior)
            variant="unstyled"
            placeholder="Search..."
            _focus={{ outline: 'none' }}
          />
          <IconButton
            bg="#33373B5E"
            _hover={{ bg: '#000' }}
            w="64px"
            h="64px"
            icon={<SearchIcon />}
            onClick={handleSearch} // Trigger search on button click
          />
        </Flex>
        {/* Dropdown Menu for search results */}
        {searchResults.length > 0 && (
          <Menu>
            <SimpleGrid
              columns={5}
              spacing={1}
              position="absolute"
              bg="#1A1E1F"
              borderRadius="md"
              p={0}
            >
              {/* Display User results */}
              {searchResults
                .filter((result) => result.type === 'user')
                .map((userResult) => (
                  <MenuItem
                    key={userResult.id}
                    onClick={() => handleResultClick(userResult, 'user')}
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
                      _hover={{ transform: 'scale(1.05)' }}
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
                .filter((result) => result.type === 'track')
                .map((songResult) => (
                  <MenuItem
                    key={songResult.id}
                    onClick={() => handleResultClick(songResult)}
                  >
                    <MusicListItem track={songResult} />
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
          _hover={{ bg: '#000' }}
          color="#FFFFFF"
          w="64px"
          h="64px"
          icon={<Image src={add} />}
          onClick={() => {
            navigate('/recommend_songs');
          }}
        />
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: '#000' }}
          color="#FFFFFF"
          w="64px"
          h="64px"
          icon={<Image src={chat} />}
        />
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: '#000' }}
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
