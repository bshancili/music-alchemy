import React from "react";
import { Container, Flex, Text, Spacer, Button, Image } from "@chakra-ui/react";
import { Link } from "react-router-dom"; // Import Link from your routing library

const HomePage = () => {
  return (
    <Container
      maxW="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Flex
        as="header"
        width="100%"
        justifyContent="space-between"
        bg="purple.500" // Background color set to purple
        color="yellow" // Text color set to yellow
        p={4}
        alignItems="center"
      >
        <Image src="/logo.png" alt="Music Alchemy Logo" boxSize="100px" />
        <Spacer />
        <Link to="/profile">
          <Button colorScheme="yellow" mr={2}>
            My Profile
          </Button>
        </Link>
      </Flex>

      <Flex flexDirection="row" alignItems="center" p={5}>
        <Flex flexDirection="column" alignItems="center" flex={1}>
          <Text fontSize="4xl" fontWeight="bold">
            Playlists for You
          </Text>
          {/* Add your playlist items here */}
        </Flex>

        <Flex flexDirection="column" alignItems="center" flex={5}>
          <Text fontSize="4xl" fontWeight="bold">
            Discover New Music
          </Text>
          <Text fontSize="xl" mt={2}>
            Explore a vast library of songs and artists.
          </Text>
          <Button colorScheme="yellow" size="lg" mt={4}>
            Get Started
          </Button>
        </Flex>

        <Flex flexDirection="column" alignItems="center" flex={3}>
          <Text fontSize="4xl" fontWeight="bold">
            Create Playlists
          </Text>
          <Text fontSize="xl" mt={2}>
            Build and share your favorite playlists.
          </Text>
        </Flex>

        <Flex flexDirection="column" alignItems="center" flex={3}>
          <Text fontSize="4xl" fontWeight="bold">
            Liked Songs
          </Text>
          <Text fontSize="xl" mt={2}>
            Explore your favorite liked songs.
          </Text>
        </Flex>
      </Flex>

      <Flex flexDirection="column" alignItems="down" p={5}>
        <Text fontSize="4xl" fontWeight="bold">
          Listen Anywhere
        </Text>
        <Text fontSize="xl" mt={2}>
          Enjoy music on all your devices.
        </Text>
      </Flex>
    </Container>
  );
};

export default HomePage;
