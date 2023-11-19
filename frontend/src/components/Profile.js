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
import friend from "../utils/addFriend.png";
import cross from "../utils/cross.png";

function Profile({ user, onaddFriend, onunfriend, isUserProfile }) {
  const { userID } = useAuthStore();

  const handleAddFriend = () => {
    onaddFriend();
  };
  const handleUnfriend = () => {
    onunfriend();
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
      <Box
        pt={5}
        display="flex"
        flexDirection="column"
        justifyContent={"space-between"}
      >
        <Box>
          <Text fontSize="lg" fontWeight="bold">
            {user?.username}
          </Text>
          <Text>@{user?.username}</Text>
        </Box>
        {isUserProfile ? null : (
          <Box>
            <IconButton
              bg="#33373B5E"
              _hover={{ bg: "#000" }}
              color="#FFFFFF"
              w="64px"
              h="64px"
              icon={<Image src={friend} />}
              onClick={handleAddFriend}
            />
            <IconButton
              ml={6}
              bg="#33373B5E"
              _hover={{ bg: "#000" }}
              color="#FFFFFF"
              w="64px"
              h="64px"
              icon={<Image src={cross} />}
              onClick={handleUnfriend}
            />
          </Box>
        )}
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
