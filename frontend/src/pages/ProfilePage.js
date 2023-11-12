import { useEffect, useState } from "react";
import Profile from "../components/Profile";
import { Box, Container } from "@chakra-ui/react";
import Header from "../components/Header";

function ProfilePage() {
  return (
    <Box display="flex" flexDirection="column">
      <Header />
      <Profile />
    </Box>
  );
}

export default ProfilePage;
