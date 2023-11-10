import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Avatar,
  Text,
  Heading,
  Spinner,
  VStack,
  HStack,
  Button,
} from "@chakra-ui/react";
import useAuthStore from "../stores/authStore";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
} from "firebase/firestore";

function Profile() {
  const [track, setTrack] = useState(null);
  const [user, setUser] = useState();

  const { userID } = useAuthStore();

  const fetchUser = async () => {
    try {
      console.log(userID);
      const userDocRef = doc(db, "Users", "6ZfUPMC2RjO0oKJquEGIAJ7wV0r2");
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUser(userData);
        console.log("User data:", userData);
        // Do something with the user data, e.g., set it in the component state
      } else {
        console.log("User not found");
        // Handle the case where the user document does not exist
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      // Handle the error appropriately
    }
  };
  const fetchPost = async (trackName = "") => {
    const tracksCollection = collection(db, "Tracks");
    const q = query(tracksCollection, where("track_name", "==", trackName));
    try {
      const snap = await getDocs(q);
      const trackData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrack(trackData);
    } catch (error) {
      console.error("Error fetching tracks:", error);
    }
  };

  useEffect(() => {
    fetchPost("Strangers"); // Pass the track_name you want to search for
    fetchUser();
  }, []);

  if (!user) {
    return (
      <Container maxW="xl" mt={16}>
        <Box textAlign="center">
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="teal.500"
            size="xl"
          />
          <Text mt={4}>Loading...</Text>
        </Box>
      </Container>
    );
  }

  const isOwnProfile = userID === user?.uid;

  return (
    <Container maxW="xl" mt={16}>
      <Box p={4} boxShadow="base" bg="white" borderRadius="md">
        <Avatar
          size="xl"
          src={user?.profilepicurl !== null ? user?.profilepicurl : ""}
        />
        <Heading as="h2" size="lg" mt={4}>
          {user.username}
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

        {isOwnProfile && (
          <HStack spacing={4} mt={4}>
            <Button colorScheme="teal">Add Friend</Button>
            <Button variant="outline" colorScheme="teal">
              Message
            </Button>
          </HStack>
        )}
      </Box>
    </Container>
  );
}

export default Profile;
