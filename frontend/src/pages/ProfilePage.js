import { useEffect, useState } from "react";
import Profile from "../components/Profile";
import { Box, Container } from "@chakra-ui/react";
import Header from "../components/Header";
import MusicListItem from "../components/MusicListItem";

function ProfilePage() {
  return (
    <Box display="flex" flexDirection="column">
      <Header />
      <Profile />
      <MusicListItem />
    </Box>
  );
}

export default ProfilePage;
