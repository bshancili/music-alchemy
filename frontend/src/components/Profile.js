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
import stats from "../utils/stats.png";
import cross from "../utils/cross.png";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import badge1 from "../utils/badge1.png";
import badge2 from "../utils/badge2.png";
import badge3 from "../utils/badge3.png";
import badge4 from "../utils/badge4.png";

function Profile({
  user,
  onaddFriend,
  onunfriend,
  isUserProfile,
  isF,
  id,
  isPrivate,
  songCount,
}) {
  const navigate = useNavigate();
  const [showLogoutButton, setShowLogoutButton] = useState(false);
  const [isFriend, setIsFriend] = useState(isF);
  const [badge, setBadge] = useState("none");

  const [Isprivate, setIsPrivate] = useState(isPrivate);
  const toast = useToast();
  const userID = localStorage.getItem("userID");

  const handleSettingsClick = () => {
    setShowLogoutButton(true);
  };

  const handleAddFriend = () => {
    onaddFriend();
    setIsFriend(!isFriend);
  };

  const handleUnfriend = () => {
    onunfriend();
    setIsFriend(!isFriend);
  };

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
        title: `Profile is now ${Isprivate ? "public" : "private"}`,

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

  useEffect(() => {
    if (songCount >= 10 && songCount < 25) {
      setBadge(badge1);
    } else if (songCount >= 25 && songCount < 50) {
      setBadge(badge2);
    } else if (songCount >= 50 && songCount < 100) {
      setBadge(badge3);
    } else {
      setBadge(badge4);
    }
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
        justifyContent="space-between"
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
              onClick={handleTogglePrivacy}
            >
              {Isprivate ? "Private" : "Public"}
            </Button>
          )}
        </Box>
      </Box>
      <Image />
      {badge !== "none" && (
        <Image
          src={badge} // Update the path based on your badge images
          w={20}
          h={20}
          mt={2}
          borderRadius="50%" // Make it a circle if needed
          alt={`Badge ${badge}`}
        />
      )}
      <Spacer />
      <HStack align="start">
        <IconButton
          bg="#33373B5E"
          _hover={{ bg: "#111" }}
          color="#FFFFFF"
          w="64px"
          h="64px"
          icon={<Image color="white" src={stats} />}
          onClick={() => navigate(`/stats/${id}`)}
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
