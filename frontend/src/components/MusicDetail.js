import React, { useEffect } from "react";
import {
  Box,
  Text,
  Flex,
  Icon,
  Image,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import heart from "../utils/heart.svg";
import lined_heart from "../utils/lined_heart.svg";
import add2 from "../utils/add2.svg";
import share from "../utils/share.svg";
import comment from "../utils/comment.svg";
import bookmark from "../utils/bookmark.svg";
import spotify_logo from "../utils/spotify_logo.png";
import useAuthStore from "../stores/authStore";
import { db } from "../firebase";
import {
  getDoc,
  doc,
  arrayUnion,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
const MusicDetail = ({ t }) => {
  const { userID } = useAuthStore();

  const isSongLiked = () => {};

  const likeSong = async () => {
    if (userID) {
      const userRef = doc(db, "Users", userID);
      const userDoc = await getDoc(userRef);
      const likedSongsArray = userDoc.data().liked_song_list || [];

      const timestamp = new Date();
      const updatedLikedSongs = {
        ...likedSongsArray,
        [t.id]: { timestamp },
      };

      await updateDoc(userRef, {
        liked_song_list: updatedLikedSongs,
      });
    }
  };
  const unlikeSong = async () => {
    if (userID) {
      const userRef = doc(db, "Users", userID);
      const userDoc = await getDoc(userRef);
      const likedSongsArray = userDoc.data().liked_song_list || [];

      await updateDoc(userRef, {
        liked_song_list: arrayRemove(t.id),
      });
    }
  };

  return (
    <Flex
      align="top"
      margin="0px "
      bg="#1D2123"
      color="#FFF"
      gap={4}
      padding="10px 100px"
      width="100%" // Set width to 100%
    >
      <Image
        src={t.album_images[0].url}
        h="300"
        w="300px"
        borderRadius="16px"
      />
      <Box ml={5}>
        <Text
          fontSize="24px"
          fontWeight="w.600"
          lineHeight="120%"
          color="#fff"
          opacity={0.5}
        >
          {t?.album_name}
        </Text>

        <Text fontSize="48px" fontWeight="bold" lineHeight="120%">
          {t?.track_name}
        </Text>
        <Text fontSize="24px" fontWeight="w.600" lineHeight="120%">
          {t?.artists[0]}
        </Text>
        <HStack mt={6} spacing={4}>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            p={4}
            borderRadius="15px"
            bg="#33373b5e"
            gap={3}
          >
            <Icon as={StarIcon} boxSize={6} />
            <Text fontSize="24px" fontWeight="bold">
              7,4
            </Text>
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            p={4}
            borderRadius="15px"
            bg="#33373b5e"
            gap={3}
          >
            <Image src={heart} alt="Heart Icon" boxSize={6} />
            <Text fontSize="24px" fontWeight="bold">
              142
            </Text>
          </Box>
        </HStack>
        <HStack mt={6} spacing={4}>
          <IconButton
            borderRadius="15px"
            w="158x"
            h="64px"
            bg="#1DB954"
            p={4}
            icon={<Image src={spotify_logo} />}
            _hover={{ bg: "#147040" }}
          />
          <IconButton
            borderRadius="15px"
            w="64px"
            h="64px"
            bg="#33373b5e"
            icon={<Image src={lined_heart} />}
            _hover={{ bg: "#000" }}
            onClick={likeSong}
          />
          <IconButton
            borderRadius="15px"
            w="64px"
            h="64px"
            bg="#33373b5e"
            icon={<Image src={add2} />}
            _hover={{ bg: "#000" }}
          />
          <IconButton
            borderRadius="15px"
            w="64px"
            h="64px"
            bg="#33373b5e"
            icon={<Image src={comment} />}
            _hover={{ bg: "#000" }}
          />
          <IconButton
            borderRadius="15px"
            w="64px"
            h="64px"
            bg="#33373b5e"
            icon={<Image src={share} />}
            _hover={{ bg: "#000" }}
          />
          <IconButton
            borderRadius="15px"
            w="64px"
            h="64px"
            bg="#33373b5e"
            icon={<Image src={bookmark} />}
            _hover={{ bg: "#000" }}
          />
        </HStack>
      </Box>
    </Flex>
  );
};

export default MusicDetail;
