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
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
const PlaylistHeader = ({ playlist }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(playlist?.name || "");
  const [editedDescription, setEditedDescription] = useState(
    playlist?.description || ""
  );

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
      </HStack>
    </Flex>
  );
};

export default PlaylistHeader;
