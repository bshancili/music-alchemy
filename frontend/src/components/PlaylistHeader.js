import {
  Box,
  Image,
  Flex,
  Text,
  Input,
  Textarea,
  Button,
  HStack,
  Spacer,
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
} from "@chakra-ui/react";

import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  where,
  query,
  getDocs,
} from "firebase/firestore";
import { fetchUserByID } from "../api/api";
import { useNavigate } from "react-router-dom";

const PlaylistHeader = ({ playlist }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(playlist?.name || "");
  const [friends, setFriends] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const userID = localStorage.getItem("userID");
  const toast = useToast();
  const navigate = useNavigate();
  const isCurrentUserCreator = playlist?.createdBy === userID;

  const handleLeaveClick = async () => {
    try {
      // Assuming you want to implement logic for leaving the playlist
      // You might want to remove the user ID from the contributors array and playlists array

      const playlistRef = doc(db, "Playlists", playlist.id);
      const playlistSnap = await getDoc(playlistRef);
      const existingContributors = playlistSnap.data().contributors || [];

      // Remove the current user ID from contributors
      const updatedContributors = existingContributors.filter(
        (id) => id !== userID
      );

      // Update the playlist document with the updated contributors
      await updateDoc(playlistRef, {
        contributors: updatedContributors,
      });

      // Also, remove the playlist ID from the user's playlists array
      const userDocRef = doc(db, "Users", userID);
      const userSnap = await getDoc(userDocRef);
      const existingPlaylists = userSnap.data()?.playlists || [];

      // Remove the playlist ID from user's playlists
      const updatedPlaylists = existingPlaylists.filter(
        (id) => id !== playlist.id
      );

      // Update the user document with the updated playlists array
      await updateDoc(userDocRef, {
        playlists: updatedPlaylists,
      });
      navigate(`/profile/${userID}`);
      toast({
        title: "User left the playlist successfully.",
        status: "success",
        position: "bottom",
        isClosable: "true",
      });
    } catch (error) {
      console.error("Error leaving playlist:", error);
    }
  };
  const onInvite = async (userIdToAdd) => {
    // Handle the invite logic for the selected friend
    const playlistRef = doc(db, "Playlists", playlist.id);
    const playlistSnap = await getDoc(playlistRef);
    const existingContributors = playlistSnap.data().contributors || [];
    const newContributors = [...existingContributors, userIdToAdd];
    await updateDoc(playlistRef, {
      contributors: newContributors, // Replace userIdToAdd with the actual user ID
    });
    const userDocRef = doc(db, "Users", userIdToAdd);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.data();
    const existingPlaylists = userData.playlists;
    const newPlaylists = [...existingPlaylists, playlist.id];
    // Update the user document with the updated playlists array
    await updateDoc(userDocRef, {
      playlists: newPlaylists,
    });
  };

  const [editedDescription, setEditedDescription] = useState(
    playlist?.description || ""
  );

  const removePlaylist = async (contributors) => {
    try {
      // Step 1: Remove the playlist from the Playlists collection
      const playlistDocRef = collection(db, "Playlists");
      const querySnapshot = await getDocs(
        query(playlistDocRef, where("name", "==", playlist.name))
      );
      const playlistId = querySnapshot.docs[0].id;
      console.log(playlistId);

      await deleteDoc(doc(db, "Playlists", playlistId));

      // Step 2: Remove the playlist from each contributor's playlists array
      for (const contributorId of contributors) {
        if (contributors.length === 0) {
          break;
        }
        const contributorDocRef = doc(db, "Users", contributorId);
        const contributorSnap = await getDoc(contributorDocRef);
        const contributorData = contributorSnap.data();

        if (contributorData && contributorData.playlists) {
          const updatedPlaylists = contributorData.playlists.filter(
            (id) => id !== playlistId
          );

          // Update the contributor's playlists array
          await updateDoc(contributorDocRef, { playlists: updatedPlaylists });
        }
      }
      const userDocRef = doc(db, "Users", userID);
      const userSnap = await getDoc(userDocRef);
      const userData = userSnap.data();
      console.log(userData.playlists);
      if (userData && userData.playlists) {
        const updatedPlaylists = userData.playlists.filter(
          (id) => id !== playlistId
        );

        // Update the contributor's playlists array
        await updateDoc(userDocRef, { playlists: updatedPlaylists });
      }
      console.log(`Playlist with ID ${playlistId} removed successfully.`);
    } catch (error) {
      console.error("Error removing playlist:", error);
    }
  };

  const fetchFriends = async () => {
    try {
      const userDocRef = doc(db, "Users", userID);
      const userSnap = await getDoc(userDocRef);
      if (userSnap) {
        const userData = userSnap.data();
        //console.log(userData);
        const friends = userData.friends_list;
        const friendsPromises = friends.map(async (friendId) => {
          return await fetchUserByID(friendId);
        });

        // Wait for all friends data to be fetched
        const friendsData = await Promise.all(friendsPromises);

        // Filter out any null values (friends not found)
        const validFriendsData = friendsData.filter(
          (friend) => friend !== null
        );

        // Set the friends state with the valid friends data
        setFriends(validFriendsData);
      }
    } catch (error) {}
  };
  const fetchHeader = async () => {
    const playlistRef = doc(db, "Playlists", playlist.id);
    const playlistSnap = await getDoc(playlistRef);
    const data = playlistSnap.data();
    setEditedName(data.name);
    setEditedDescription(data.description);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    // Update playlist data in Firestore
    const playlistRef = doc(db, "Playlists", playlist.id);
    await updateDoc(playlistRef, {
      name: editedName,
      description: editedDescription,
    });

    // Update local state
    setIsEditing(false);
  };

  useEffect(() => {
    fetchHeader();
    fetchFriends();
  }, []);

  return (
    <Flex
      align="top"
      margin="0px "
      bg="#1D2123"
      color="#FFF"
      direction="column"
      gap={4}
      padding="10px 100px"
      width="100%"
    >
      <HStack alignItems="flex-start">
        <Image src={playlist.imgURL} h="256px" w="256px" borderRadius="9px" />
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Box>
            <Text fontSize="2xl" fontWeight="bold">
              {isEditing ? (
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  fontSize="2xl"
                  fontWeight="bold"
                />
              ) : (
                editedName
              )}
            </Text>
            <Text color="white" fontSize="md">
              {isEditing ? (
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  fontSize="md"
                />
              ) : (
                editedDescription
              )}
            </Text>
          </Box>
        </Box>
        <Spacer />
        {isEditing ? (
          <Button colorScheme="yellow" onClick={handleSaveClick}>
            Save
          </Button>
        ) : (
          <Button colorScheme="yellow" onClick={handleEditClick}>
            Edit
          </Button>
        )}
        <Button onClick={onOpen}>Invite Friends!</Button>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Modal Title</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                {friends.map((friend) => (
                  <Box
                    key={friend.uid}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    borderBottom="1px solid #ccc"
                    py={2}
                  >
                    <Stack direction="row" align="center">
                      <Avatar
                        src={friend.profile_picture_url}
                        name={friend.username}
                      />
                      <Box ml={3}>{friend.username}</Box>
                    </Stack>
                    <Button
                      colorScheme="blue"
                      onClick={() => onInvite(friend.uid)}
                    >
                      Invite
                    </Button>
                  </Box>
                ))}
              </Stack>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
              <Button variant="ghost">Secondary Action</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        {!isCurrentUserCreator && (
          <Button colorScheme="red" onClick={handleLeaveClick}>
            Leave
          </Button>
        )}
        {isCurrentUserCreator && (
          <Button
            colorScheme="red"
            onClick={() => removePlaylist(playlist.contributors)}
          >
            Delete Playlist
          </Button>
        )}
      </HStack>
    </Flex>
  );
};

export default PlaylistHeader;
