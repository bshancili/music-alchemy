import {
  Box,
  Container,
  Text,
  Spinner,
  Flex,
  Spacer,
  Image,
  IconButton,
  Button,
  HStack,
  useToast, // Add this import for 'toast'
} from "@chakra-ui/react";
import useAuthStore from "../stores/authStore";
import settings from "../utils/settings.svg";
import friend from "../utils/addFriend.png";
import cross from "../utils/cross.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function Profile({ user, onaddFriend, onunfriend, isUserProfile, id }) {
  const { userID } = useAuthStore();
  const navigate = useNavigate();
  const [showLogoutButton, setShowLogoutButton] = useState(false);
  const [Isprivate, setIsPublic] = useState(user?.Isprivate);
  const toast = useToast();

  const handleSettingsClick = () => {
    setShowLogoutButton(!showLogoutButton);
  };

  const handleAddFriend = () => {
    onaddFriend();
  };

  const handleUnfriend = () => {
    onunfriend();
  };

  const handleLogout = () => {
    navigate("/login");
    localStorage.clear();
  };

  const handleTogglePrivacy = async () => {
    // Ensure userID and id are valid

    // Toggle the state immediately
    const newIsPublic = !Isprivate;
    setIsPublic(newIsPublic);

    // Update the database with the new privacy setting
    try {
      const userDocRef = doc(db, "Users", id);
      await updateDoc(userDocRef, {
        Isprivate: newIsPublic,
      });

      console.log(newIsPublic);

      toast({
        title: `Profile is now ${newIsPublic ? "public" : "private"}`,

        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: `Profile is now ${newIsPublic ? "public" : "private"}`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      // Revert the state if the update fails
      setIsPublic(!newIsPublic);
      throw error;
    }
  };

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
      width="100%"
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
        <Box>
          <Box>
            <Button
              bg={Isprivate ? "#4CAF50" : "#F44336"}
              _hover={{ bg: Isprivate ? "#45a049" : "#e57373" }}
              color="#FFFFFF"
              onClick={handleTogglePrivacy}
            >
              {Isprivate ? "Public" : "Private"}
            </Button>
          </Box>
        </Box>
      </Box>

      <Spacer />
      <HStack align="start">
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: "#000" }}
          color="#FFFFFF"
          w="64px"
          h="64px"
          icon={<Image src={settings} />}
          onClick={() => navigate("/stats")}
        />
        {isUserProfile && (
          <>
            {!showLogoutButton && (
              <IconButton
                bg="#33373B5E"
                _hover={{ bg: "#000" }}
                color="#FFFFFF"
                w="64px"
                h="64px"
                icon={<Image src={settings} />}
                onClick={handleSettingsClick}
              />
            )}
            {showLogoutButton && (
              <Button
                mt={2}
                bg="#33373B5E"
                _hover={{ bg: "#000" }}
                color="#FFFFFF"
                onClick={handleLogout}
              >
                Logout
              </Button>
            )}
          </>
        )}
      </HStack>
    </Flex>
  );
}

export default Profile;
