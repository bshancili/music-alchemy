import React from "react";
import {
  Box,
  Container,
  Avatar,
  Text,
  Heading,
  Badge,
  VStack,
  HStack,
  Button,
  Stack,
} from "@chakra-ui/react";
import useAuthStore from "../stores/authStore";

function ProfilePage() {
  const { user, userID } = useAuthStore();
  console.log(user);
  const getUser = () => {
    // send get request to get user info then proceed accordingly
  };
  return (
    <Container maxW="xl" mt={16}>
      <Box p={4} boxShadow="base" bg="white" borderRadius="md">
        <Avatar size="xl" src="https://example.com/your-profile-image.jpg" />
        <Heading as="h2" size="lg" mt={4}>
          John Doe
        </Heading>

        <VStack spacing={4} mt={4}>
          <Text fontSize="md">
            Hi, I'm John Doe, a passionate front-end developer with a strong
            focus on web technologies.
          </Text>
          <Text fontSize="md">
            Connect with me on social media to stay updated with my latest
            projects and thoughts on web development.
          </Text>
        </VStack>
        <HStack spacing={4} mt={4}>
          <Button colorScheme="teal">Add Friend</Button>
          <Button variant="outline" colorScheme="teal">
            Message
          </Button>
        </HStack>
      </Box>
    </Container>
  );
}

export default ProfilePage;
