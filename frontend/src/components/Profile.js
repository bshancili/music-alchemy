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
import settings from "../utils/settings.svg";
import friend from "../utils/addFriend.png";
import cross from "../utils/cross.png";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

function Profile({
  user,
  onaddFriend,
  onunfriend,
  isUserProfile, friends,
  id,
  isPrivate,
}) {
  const navigate = useNavigate();
  const [showLogoutButton, setShowLogoutButton] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const isFriendCheck = () => {
    return setIsFriend(friends.some((friend) => user.id === friend));
  };
  const [Isprivate, setIsPrivate] = useState(isPrivate);
  const toast = useToast();

  const handleSettingsClick = () => {
    setShowLogoutButton(!showLogoutButton);
  };

  const handleAddFriend = () => {
    onaddFriend();
    setIsFriend(!isFriend);
  };

  const handleUnfriend = () => {
    onunfriend();
    setIsFriend(!isFriend);
  };
  useEffect(() => {
    isFriendCheck();
  }, []);

  const handleLogout = () => {
    navigate("/login");
    localStorage.clear();
  };

  const handleTogglePrivacy = async () => {
    // Ensure userID and id are valid

    setIsPrivate(!Isprivate);

    // Update the database with the new privacy setting
    try {
      const userDocRef = doc(db, "Users", id);
      await updateDoc(userDocRef, {
        Isprivate: Isprivate ? 0 : 1,
      });

      console.log(Isprivate);

      toast({
        title: `Profile is now ${Isprivate ? "private" : "public"}`,

        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: `Profile is now ${Isprivate ? "public" : "private"}`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      // Revert the state if the update fails
      setIsPrivate(!Isprivate);
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
        {isUserProfile ? null : isFriend ? (
          <IconButton
            bg="#33373B5E"
            _hover={{ bg: "#000" }}
            color="#FFFFFF"
            w="64px"
            h="64px"
            icon={<Image src={cross} />}
            onClick={handleUnfriend}
          />
        ) : (
          <IconButton
            bg="#33373B5E"
            _hover={{ bg: "#000" }}
            color="#FFFFFF"
            w="64px"
            h="64px"
            icon={<Image src={friend} />}
            onClick={handleAddFriend}
          />
        )}
        <Box>
          {isUserProfile && (
            <Button
              bg={Isprivate ? "#F44336" : "#4CAF50"}
              _hover={{ bg: Isprivate ? "#e57373" : "#45a049" }}
              color="#FFFFFF"
              w="64px"
              h="64px"
              icon={<Image src={cross} />}
              onClick={handleUnfriend}
            />
          </Box>
        )}
        <Box>
          {isUserProfile && (
            <Button
              bg={Isprivate ? "#F44336" : "#4CAF50"}
              _hover={{ bg: Isprivate ? "#e57373" : "#45a049" }}
              color="#FFFFFF"
              onClick={handleTogglePrivacy}
            >
              {Isprivate ? "Private" : "Public"}
            </Button>
          )}
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
