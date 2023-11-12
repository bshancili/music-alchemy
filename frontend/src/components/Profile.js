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
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

function Profile() {
  const [track, setTrack] = useState(null);
  const [user, setUser] = useState();

  const { userID, isAuthenticated } = useAuthStore();

  const searchUserByUsername = async (username) => {
    try {
      const usersRef = collection(db, "Users");
      const querySnapshot = await getDocs(
        query(usersRef, where("username", "==", username))
      );

      const matchingUsers = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        matchingUsers.push({ uid: doc.id, ...userData });
      });

      return matchingUsers;
    } catch (error) {
      console.error("Error searching for user:", error);
      throw error;
    }
  };

  const fetchUser = async () => {
    try {
      const userDocRef = doc(db, "Users", "p1u0qWTtY4NgE0KWAO8wYKIX2t92");
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
    //const q = query(tracksCollection, where("track_name", "==", trackName));
    const q = query(
      tracksCollection,
      where("artists", "array-contains", "Taylor Swift")
    );

    try {
      const snap = await getDocs(q);
      const trackData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(trackData);
      setTrack(trackData);
    } catch (error) {
      console.error("Error fetching tracks:", error);
    }
  };

  const addFriend = async () => {
    try {
      // Add friendUid to the current user's friend list
      const userDocRef = doc(db, "Users", user.uid);
      await updateDoc(userDocRef, {
        friend_list: arrayUnion("p1u0qWTtY4NgE0KWAO8wYKIX2t92"),
      });

      console.log("Friend added successfully!");
    } catch (error) {
      console.error("Error adding friend:", error);
      throw error;
    }
  };

  const removeFriend = async () => {
    try {
      // Add friendUid to the current user's friend list
      const userDocRef = doc(db, "Users", userID);
      await updateDoc(userDocRef, {
        friend_list: arrayRemove("p1u0qWTtY4NgE0KWAO8wYKIX2t92"),
      });

      console.log("Friend deleted successfully!");
    } catch (error) {
      console.error("Error deleting  friend:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchUser();
    fetchPost("Strangers");
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
          src={
            user?.profile_picture_url !== null ? user?.profile_picture_url : ""
          }
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

        {!isOwnProfile && (
          <HStack spacing={4} mt={4}>
            <Button colorScheme="teal" onClick={addFriend}>
              Add Friend
            </Button>
          </HStack>
        )}
      </Box>
    </Container>
  );
}

export default Profile;
