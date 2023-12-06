// TopChartItem.js

import { useState, useEffect } from "react";
import {
  Box,
  Text,
  IconButton,
  VStack,
  Image,
  HStack,
  useToast,
} from "@chakra-ui/react";
import heart from "../utils/heart.svg";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { getDoc, doc, updateDoc } from "firebase/firestore";
const TopChartItem = ({ track }) => {
  const navigate = useNavigate();
  const handleItemClick = () => {
    navigate(`/music/${track.id}`, {
      state: { trackData: track },
    });
  };
  const [isLiked, setIsLiked] = useState(false);
  const toast = useToast();

  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const userID = localStorage.getItem("userID");

  const likeSong = async () => {
    if ((userID || !isLiked) && !loading) {
      setLoading(true);
      const userRef = doc(db, "Users", userID);
      const userDoc = await getDoc(userRef);
      const likedSongsArray = userDoc.data().liked_song_list || [];

      const timestamp = new Date();
      const updatedLikedSongs = {
        ...likedSongsArray,
        [track.id]: { timestamp },
      };

      await updateDoc(userRef, {
        liked_song_list: updatedLikedSongs,
      });

      toast({
        title: "Song is liked",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      // Now, update the like_count field
      const songRef = doc(db, "Tracks", track.id);
      const songDoc = await getDoc(songRef);
      const currentLikes = songDoc.data().like_count || 0;
      setLikeCount(likeCount + 1);
      setIsLiked(true);
      await updateDoc(songRef, {
        like_count: currentLikes + 1,
      });
      setLoading(false);
    }
  };
  const unlikeSong = async () => {
    if ((userID || isLiked) && !loading) {
      setLoading(true);
      const userRef = doc(db, "Users", userID);
      const userDoc = await getDoc(userRef);
      const likedSongsArray = userDoc.data().liked_song_list || {};

      if (likedSongsArray[track.id]) {
        delete likedSongsArray[track.id];
      }

      await updateDoc(userRef, {
        liked_song_list: likedSongsArray,
      });
      toast({
        title: "Song is unliked",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      const songRef = doc(db, "Tracks", track.id);
      const songDoc = await getDoc(songRef);
      const currentLikes = songDoc.data().like_count || 0;
      setLikeCount(likeCount - 1);
      setIsLiked(false);

      await updateDoc(songRef, {
        like_count: currentLikes - 1,
      });
      setLoading(false);
    }
  };
  const fetchIsLiked = async () => {
    if (userID) {
      const userRef = doc(db, "Users", userID);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const likedSongList = { ...(userData.liked_song_list || {}) };
      if (likedSongList[track.id]) {
        setIsLiked(true);
      }
    }
  };

  useEffect(() => {
    fetchIsLiked();
    console.log(isLiked);
  }, [likeSong]);

  return (
    <Box
      width="560px"
      height="96px"
      borderRadius="20px"
      backgroundColor="#1A1E1F"
      display="flex"
      p="10px 30px"
      alignItems="center"
      flexDir="row"
      justifyContent="space-between"
      mb={5}
      onClick={handleItemClick}
      cursor="pointer"
      _hover={{
        backgroundColor: "#0a0a0a", // Change the background color on hover
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.8)", // Add a subtle box shadow on hover
      }}
    >
      <HStack>
        <Image
          borderRadius="17px"
          width="73px"
          height="73px"
          src={track.album_images[0].url}
        />

        <VStack alignItems="start">
          <Text
            fontFamily="Quicksand"
            fontSize="17px"
            fontWeight="400"
            color="#FFFFFF"
          >
            {track.track_name}
          </Text>
          <Text
            fontFamily="Quicksand"
            fontSize="12px"
            fontWeight="400"
            lineHeight="14px"
            color="#FFFFFF80" // Adjusted for alpha transparency
          >
            {track.artists[0]}
          </Text>
        </VStack>
      </HStack>

      <IconButton
        width="48px"
        height="48px"
        borderRadius="15px"
        position="relative"
        bg={isLiked ? "#085e32" : "#33373B5E"}
        icon={<Image src={heart} />}
        onClick={(e) => {
          // Handle like button click logic here
          e.stopPropagation();
          isLiked ? unlikeSong() : likeSong();
        }}
        _hover={{
          transform: "scale(1.25)",
        }}
      ></IconButton>
    </Box>
  );
};

export default TopChartItem;
