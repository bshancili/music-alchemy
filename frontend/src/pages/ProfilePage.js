import React, { useEffect, useState } from "react";
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
import { db } from "../firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

function ProfilePage() {
  const [track, setTrack] = useState(null);
  const [tracks, setTracks] = useState([]);

  const { user, userID } = useAuthStore();

  const fetchPost = async (trackName = "") => {
    const tracksCollection = collection(db, "Tracks");
    const q = await query(
      tracksCollection,
      where("track_name", "==", trackName)
    );
    try {
      const snap = await getDocs(q);
      const trackData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrack(trackData);
      setTracks(track);
      console.log(trackData);
    } catch (error) {
      console.error("Error fetching tracks:", error);
    }
  };

  useEffect(() => {
    fetchPost("Strangers"); // Pass the track_name you want to search for
  }, []);
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
        <div>
          <h1>Track Information</h1>
          <ul>
            {tracks.map((track) => (
              <li key={track.id}>
                <strong>Track Name:</strong> {track.track_name}
                <br />
                <strong>Artists:</strong>{" "}
                {track.artists && track.artists.join(", ")}
                {/* Add more fields as needed */}
              </li>
            ))}
          </ul>
        </div>
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
