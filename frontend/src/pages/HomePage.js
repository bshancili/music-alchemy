import React, { useEffect } from "react";
import useAuthStore from "../stores/authStore";
import { Box, Heading, Text, Button, Stack, Center } from "@chakra-ui/react";
import HomeHeader from "../components/HomeHeader";
import { Outlet, Navigate } from "react-router-dom";
const HomePage = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Box>
      {isAuthenticated ? <Outlet /> : <Navigate to={"/login"} />}
      <HomeHeader />

      {/* Features Section */}
      <Box bg="gray.100" py={16} px={4} textAlign="center" minH="75vh">
        <Heading as="h2" fontSize="3xl">
          Key Features
        </Heading>
        <Stack
          display="flex"
          alignItems="center"
          justifyContent="center"
          direction={{ base: "column", md: "row" }}
          spacing={8}
          mt={8}
        >
          <Box>
            <Heading as="h3" fontSize="xl" mt={4}>
              Personalized Recommendations
            </Heading>
            <Text>
              Discover new music tailored to your taste and preferences.
            </Text>
          </Box>
          <Box>
            <Heading as="h3" fontSize="xl" mt={4}>
              Create Playlists
            </Heading>
            <Text>Build and manage playlists with your favorite tracks.</Text>
          </Box>
          <Box>
            <Heading as="h3" fontSize="xl" mt={4}>
              Music Library
            </Heading>
            <Text>
              Access a vast library of songs and albums at your fingertips.
            </Text>
          </Box>
        </Stack>
      </Box>

      {/* Footer */}
      <Center bg="teal.500" py={16} minH="40vh">
        <Button colorScheme="whiteAlpha" size="lg">
          Get Started Now
        </Button>
      </Center>
    </Box>
  );
};

export default HomePage;
