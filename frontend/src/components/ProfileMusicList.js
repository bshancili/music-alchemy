import {
  Box,
  Grid,
  GridItem,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Input,
  Button,
  Text,
} from "@chakra-ui/react";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  addDoc,
  collection,
} from "firebase/firestore";
import { db } from "../firebase";
import React, { useState } from "react";
import MusicListItem from "./MusicListItem";
import PlaylistListItem from "./PlaylistListItem";

const ProfileMusicList = ({
  tracks,
  non_rated,
  userID,
  playlists,
  setPlaylists,
}) => {
  const [playlistName, setPlaylistName] = useState("");

  const handlePlaylistNameChange = (event) => {
    setPlaylistName(event.target.value);
  };

  const handleCreatePlaylist = async () => {
    try {
      const userRef = doc(db, "Users", userID);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      if (userData.playlists) {
        const playlistsCollectionRef = collection(db, "Playlists");

        const timestamp = new Date();
        const playlistObject = {
          name: playlistName,
          timestamp: timestamp,
          songs: [],
          createdBy: userID,
          description: "",
          imgURL: "https://www.afrocharts.com/images/song_cover.png",
        };
        const newPlaylistRef = await addDoc(
          playlistsCollectionRef,
          playlistObject
        );
        const newPlaylistId = newPlaylistRef.id;
        playlistObject.id = newPlaylistId;
        await updateDoc(userRef, {
          playlists: arrayUnion(newPlaylistId),
        });

        setPlaylists((prevPlaylists) => [playlistObject, ...prevPlaylists]);
      } else {
        await updateDoc(userRef, {
          playlists: [],
        });
      }
    } catch (error) {
      console.log(`Error Creating playlist: ${playlistName}`, error);
    }
  };
  return (
    <Box bg="#1D2123" padding="10px 96px">
      <Tabs colorScheme="yellow" variant="solid-rounded">
        <TabList>
          <Tab>Collection</Tab>
          <Tab>Non-Rated Songs</Tab>
          <Tab>Playlists</Tab>
        </TabList>

        <TabPanels textDecorationLine={"none"}>
          <TabPanel>
            <Grid templateColumns="repeat(5, 1fr)" gap={4}>
              {tracks.map((track) => (
                <GridItem key={track.id}>
                  <MusicListItem track={track} />
                </GridItem>
              ))}
            </Grid>
          </TabPanel>
          <TabPanel>
            <Grid templateColumns="repeat(5, 1fr)" gap={4}>
              {non_rated.map((track) => (
                <GridItem key={track.id}>
                  <MusicListItem track={track} />
                </GridItem>
              ))}
            </Grid>
          </TabPanel>
          <TabPanel>
            <Input
              placeholder="Enter Playlist Name"
              value={playlistName}
              onChange={handlePlaylistNameChange}
              mb={4}
              color={"white"}
            />

            <Button colorScheme="teal" size="lg" onClick={handleCreatePlaylist}>
              Create Playlist
            </Button>
            <Grid templateColumns="repeat(5, 1fr)" gap={4}>
              {playlists.map((playlist) => (
                <GridItem key={playlist.id}>
                  <PlaylistListItem playlist={playlist} />
                </GridItem>
              ))}
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default ProfileMusicList;
