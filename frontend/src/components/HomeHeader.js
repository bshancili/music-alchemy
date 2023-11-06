import React from "react";
import { Box, Heading, Button, Stack, useToast, Text } from "@chakra-ui/react";
import AddSongModal from "../components/Misc/AddSongModal";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";

const HomeHeader = () => {
  const { signout, isAuthenticated } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      signout();
      await auth.signOut();
      console.log("is Auth:", isAuthenticated);
      navigate("/login");
    } catch (error) {
      toast({
        title: "Could not sign out",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  return (
    <Box
      bgGradient="linear(to-b, #673653, #B0606D)"
      color="white"
      py={14}
      px={16}
      minH="75vh"
      display="flex"
      flexDir="row"
      justifyContent="space-between"
      alignItems="start"
    >
      <Stack direction="column">
        <Heading as="h2" fontSize="3xl" fontWeight="bold">
          Welcome to Music Alchemy
        </Heading>
      </Stack>

      <Stack direction="row" spacing={4}>
        <Button colorScheme="yellow" size="lg" border="1px solid black">
          Learn More
        </Button>
      </Stack>
      <AddSongModal />

      <Button
        backgroundColor="#DE8275"
        border="1px solid black"
        _hover={{
          backgroundColor: "#a6466e",
          color: "#FFC154",
        }}
        color="#fff"
        size="lg"
        onClick={handleSignOut}
      >
        Sign out
      </Button>
    </Box>
  );
};

export default HomeHeader;
