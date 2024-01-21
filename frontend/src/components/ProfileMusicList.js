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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Stack,
  Avatar,
  useToast,
  HStack,
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
import React, { useEffect, useState } from "react";
import MusicListItem from "./MusicListItem";
import PlaylistListItem from "./PlaylistListItem";
import { fetchUserByID } from "../api/api";

const ProfileMusicList = ({
  tracks,
  non_rated,
  userID,
  playlists,
  setPlaylists,
  friends,
  username,
}) => {
  const [playlistName, setPlaylistName] = useState("");
  const toast = useToast();
  const [friendsList, setFriendsList] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState([]);
  const handlePlaylistNameChange = (event) => {
    setPlaylistName(event.target.value);
  };
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchFriendsDetails = async (friendIds) => {
    const detailsPromises = friendIds.map((id) => fetchUserByID(id));
    const friendsDetails = await Promise.all(detailsPromises);
    setFriendsList(friendsDetails.filter(Boolean)); // Filter out null values
  };

  const getRandomSongsFromArray = (array, count) => {
    const shuffledArray = array.slice(); // Create a shallow copy of the array
    let currentIndex = shuffledArray.length,
      randomIndex,
      temporaryValue;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      temporaryValue = shuffledArray[currentIndex];
      shuffledArray[currentIndex] = shuffledArray[randomIndex];
      shuffledArray[randomIndex] = temporaryValue;
    }

    return shuffledArray.slice(0, count);
  };

  const combineRandomSongArrays = (a, b, c, d, commonTimestamp) => {
    const timestamp = commonTimestamp;

    const combinedMap = new Map();

    // Helper function to add IDs to the map
    const addIdsToMap = (ids) => {
      ids.forEach((id) => {
        if (id) {
          combinedMap.set(id, { timestamp });
        }
      });
    };

    addIdsToMap(a);
    addIdsToMap(b);
    addIdsToMap(c);
    addIdsToMap(d);

    const combinedObject = {};
    combinedMap.forEach((value, key) => {
      combinedObject[key] = value;
    });

    return combinedObject;
  };

  const handleOnGenerate = async (friend) => {
    const friendDocRef = doc(db, "Users", friend.uid);
    const friendSnap = await getDoc(friendDocRef);
    const friendData = friendSnap.data();
    const friendLikedSongs = Object.keys(friendData.liked_song_list);
    const friendRatedSongs = Object.keys(friendData.rated_song_list);
    const userDocRef = doc(db, "Users", userID);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.data();
    const userLikedSongs = Object.keys(friendData.liked_song_list);
    const userRatedSongs = Object.keys(friendData.rated_song_list);

    const generatePlaylistName = friend.username + " + " + username;

    if (userData.playlists) {
      const playlistsCollectionRef = collection(db, "Playlists");
      const a = getRandomSongsFromArray(friendLikedSongs, 5);
      const b = getRandomSongsFromArray(friendRatedSongs, 5);
      const c = getRandomSongsFromArray(userLikedSongs, 5);
      const d = getRandomSongsFromArray(userRatedSongs, 5);
      const timestamp = new Date();

      const combinedArray = combineRandomSongArrays(a, b, c, d, timestamp);
      const playlistObject = {
        contributors: [friend.uid],
        name: generatePlaylistName,
        timestamp: timestamp,
        songs: combinedArray,
        createdBy: userID,
        description: `A combination of music for ${username} and ${friend.username}`,
        imgURL: "https://www.afrocharts.com/images/song_cover.png",
      };
      const newPlaylistRef = await addDoc(
        playlistsCollectionRef,
        playlistObject
      );
      const newPlaylistId = newPlaylistRef.id;
      playlistObject.id = newPlaylistId;
      await updateDoc(userDocRef, {
        playlists: arrayUnion(newPlaylistId),
      });
      await updateDoc(friendDocRef, {
        playlists: arrayUnion(newPlaylistId),
      });

      setPlaylists((prevPlaylists) => [playlistObject, ...prevPlaylists]);
    }
    console.log(playlistName);
    toast({
      title: "Playlist is created!",
      status: "success",
      position: "bottom",
      isClosable: "true",
    });
    onClose();
  };

  useEffect(() => {
    fetchFriendsDetails(friends);
  }, [friends]);

  const handleCreatePlaylist = async () => {
    if (playlistName.length === 0) {
      toast({
        title: "Playlist Name cannot be null!",
        status: "warning",
        position: "bottom",
        isClosable: "true",
      });
      return;
    }
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

            <HStack>
              <Button
                colorScheme="teal"
                size="lg"
                onClick={handleCreatePlaylist}
              >
                Create Playlist
              </Button>

              <Button colorScheme="yellow" size="lg" onClick={onOpen}>
                Generate Playlist with A Friend
              </Button>
              <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Modal Title</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <ModalBody>
                      {friendsList.map((friend) => (
                        <Button
                          colorScheme="yellow"
                          margin={1}
                          key={friend.uid}
                          onClick={() => {
                            setSelectedFriend(friend);
                          }}
                          variant={
                            selectedFriend && friend.uid === selectedFriend.uid
                              ? "solid"
                              : "outline"
                          }
                        >
                          {friend.username}
                        </Button>
                      ))}
                    </ModalBody>
                  </ModalBody>

                  <ModalFooter>
                    <Button
                      colorScheme="yellow"
                      mr={3}
                      onClick={() => handleOnGenerate(selectedFriend)}
                    >
                      Generate
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </HStack>

            <Grid templateColumns="repeat(4, 1fr)" gap={4}>
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
