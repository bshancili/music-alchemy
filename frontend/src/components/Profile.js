import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Text,
  Spinner,
  Flex,
  Spacer,
  Image,
  IconButton,
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
import settings from "../utils/settings.svg";

function Profile({ user }) {
  const [track, setTrack] = useState(null);
  const { userID } = useAuthStore();

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
      const userDocRef = doc(db, "Users", userID);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
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

  const addFriend = async () => {
    try {
      // Add friendUid to the current user's friend list
      const userDocRef = doc(db, "Users", user.uid);
      await updateDoc(userDocRef, {
        friends_list: arrayUnion("p1u0qWTtY4NgE0KWAO8wYKIX2t92"),
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
  }, []);

  if (!user) {
    return (
      <Container>
        <Box textAlign="center">
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="#FACD66"
            size="xl"
          />
          <Text mt={4}>Loading...</Text>
        </Box>
      </Container>
    );
  }

  return (
    <Flex
      align="top"
      margin="0px "
      bg="#1D2123"
      color="#FFF"
      gap={4}
      padding="10px 100px"
      width="100%" // Set width to 100%
    >
      <Image
        src={user.profile_picture_url}
        h="256px"
        w="256px"
        borderRadius="9px"
      />
      <Box pt={5}>
        <Text fontSize="lg" fontWeight="bold">
          {user?.username}
        </Text>
        <Text>@{user?.username}</Text>
      </Box>
      <Spacer />
      <IconButton
        bg="#33373B5E"
        _hover={{ bg: "#000" }}
        color="#FFFFFF"
        w="64px"
        h="64px"
        icon={<Image src={settings} />}
      />
    </Flex>
  );
}

export default Profile;
