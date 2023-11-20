import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Flex,
  Icon,
  Image,
  HStack,
  IconButton,
  useToast,
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
import { getDoc, doc, updateDoc } from "firebase/firestore";
import RatingStars from "./RatingStars";

const MusicDetail = ({ t }) => {
  //const { userID } = useAuthStore();
  const [isLiked, setIsLiked] = useState(false);
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const handleStarClick = (star) => {
    setRating(star);
  };
  const userID = localStorage.getItem("userID");
  const handleRateButtonClick = async () => {
    if (userID && !loading) {
      setLoading(true);
      const userRef = doc(db, "Users", userID);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      const songRef = doc(db, "Tracks", t.id);
      const songDoc = await getDoc(songRef);
      const trackData = songDoc.data();

      const updatedRatedSongList = { ...(userData.rated_song_list || {}) };

      const timestamp = new Date();

      if (updatedRatedSongList[t.id]) {
        const currentUserRating = updatedRatedSongList[t.id].rating;
        const currentTrackRating = trackData.rating;
        const ratingCount = trackData.rating_count;
        const newRating =
          (currentTrackRating * ratingCount - currentUserRating + rating) /
          ratingCount;

        setRating(newRating.toFixed(1));
        await updateDoc(songRef, {
          rating: newRating.toFixed(1),
        });
        updatedRatedSongList[t.id].rating = rating;
        updatedRatedSongList[t.id].timestamp = timestamp;
        await updateDoc(userRef, {
          rated_song_list: updatedRatedSongList,
        });
        toast({
          title: `${t.track_name} is re-rated ${rating}`,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
      } else {
        // Calculate the new average rating
        const currentRating = trackData.rating || 0;
        const currentCount = trackData.rating_count || 0;

        const newCount = currentCount + 1;
        const newRating = (currentRating * currentCount + rating) / newCount;

        // Update the track data in the database
        await updateDoc(songRef, {
          rating: newRating.toFixed(1),
          rating_count: newCount,
        });

        const updatedRatedSongList = {
          ...userData.rated_song_list,
          [t.id]: { rating, timestamp },
        };
        await updateDoc(userRef, {
          rated_song_list: updatedRatedSongList,
        });
        toast({
          title: `${t.track_name} has rated ${rating}`,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
      }
    }
  };

  const likeSong = async () => {
    if ((userID || !isLiked) && !loading) {
      setLoading(true);
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

      toast({
        title: "Song is liked",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      // Now, update the like_count field
      const songRef = doc(db, "Tracks", t.id);
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

      if (likedSongsArray[t.id]) {
        delete likedSongsArray[t.id];
      }

      await updateDoc(userRef, {
        liked_song_list: likedSongsArray,
      });

      const songRef = doc(db, "Tracks", t.id);
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
      if (likedSongList[t.id]) {
        setIsLiked(true);
      }
    }
  };
  const fetchStarsAndLikes = async () => {
    if (userID) {
      const userRef = doc(db, "Users", userID);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const ratedSongList = { ...(userData.rated_song_list || {}) };
      if (ratedSongList[t.id]) {
        setRating(ratedSongList[t.id].rating);
      }
    }
    if (t.id) {
      const trackRef = doc(db, "Tracks", t.id);
      const trackDoc = await getDoc(trackRef);
      const trackData = trackDoc.data();
      const lC = trackData.like_count;
      setLikeCount(lC);
    }
  };

  useEffect(() => {
    fetchStarsAndLikes();
    fetchIsLiked();
  }, []);

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
        <HStack
          width="100%"
          mt={6}
          spacing={4}
          display="flex"
          justifyContent="space-around"
        >
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
              {t.rating}
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
              {likeCount}
            </Text>
          </Box>
          <RatingStars
            rating={rating}
            onStarClick={handleStarClick}
            onRateButtonClick={handleRateButtonClick}
          />
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
            bg={isLiked ? "#147040" : "#151c18"}
            icon={<Image src={isLiked ? heart : lined_heart} />}
            _hover={{ bg: isLiked ? "#085e32" : "#000" }}
            onClick={isLiked ? unlikeSong : likeSong}
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
