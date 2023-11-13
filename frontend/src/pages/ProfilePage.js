import { useEffect, useState } from "react";
import Profile from "../components/Profile";
import { Box, Button } from "@chakra-ui/react";
import Header from "../components/Header";
import MusicListItem from "../components/MusicListItem";
import ProfileMusicList from "../components/ProfileMusicList";

function ProfilePage() {
  return (
    <Box display="flex" flexDirection="column" h="100vh">
      <Header />
      <Profile />
      <ProfileMusicList />
    </Box>
  );
}

export default ProfilePage;
