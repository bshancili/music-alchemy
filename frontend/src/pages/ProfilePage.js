import { useEffect, useState } from "react";
import Profile from "../components/Profile";
import { Box, useToast } from "@chakra-ui/react";
import Header from "../components/Header";
import ProfileMusicList from "../components/ProfileMusicList";
import useAuthStore from "../stores/authStore";
import { db } from "../firebase";
import { useParams } from "react-router-dom";

import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

function ProfilePage() {
  const [user, setUser] = useState();
  const [likedSongs, setLikedSongs] = useState([]);
  const { id } = useParams();
  const { userID } = useAuthStore();
  const isUserProfile = id === userID;
  const toast = useToast();
  const fetchUser = async () => {
    try {
      const userDocRef = doc(db, "Users", id);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUser(userData);
      } else {
        console.log("User not found");
        // Handle the case where the user document does not exist
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      // Handle the error appropriately
    }
  };

  const fetchTrackDetails = async (id) => {
    const trackRef = doc(db, "Tracks", id);
    try {
      const trackSnap = await getDoc(trackRef);

      if (trackSnap.exists()) {
        const trackDetails = {
          id: trackSnap.id,
          ...trackSnap.data(),
        };
        console.log(trackDetails);
        return trackDetails;
      } else {
        console.error("Track not found");
        return null;
      }
    } catch (error) {
      console.error("Error fetching track details:", error);
      return null;
    }
  };

  const fetchAllLikedSongs = async () => {
    try {
      const userDocRef = doc(db, "Users", id);
      const userSnap = await getDoc(userDocRef);
      if (userSnap) {
        const userData = userSnap.data();
        const likedSongs = Object.keys(userData.liked_song_list || {});
        const tracksDetails = await Promise.all(
          likedSongs.map((trackId) => fetchTrackDetails(trackId))
        );

        setLikedSongs(tracksDetails);
      }
    } catch (error) {}
  };

  const addFriend = async () => {
    try {
      // Add friendUid to the current user's friend list
      const userDocRef = doc(db, "Users", userID);
      await updateDoc(userDocRef, {
        friends_list: arrayUnion(id),
      });
      const friendDocRef = doc(db, "Users", id);
      await updateDoc(friendDocRef, {
        friends_list: arrayUnion(userID),
      });

      toast({
        title: "Friend Added Successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      console.error("Error adding friend:", error);
      throw error;
    }
  };
  const unfriend = async () => {
    try {
      // Remove friendUid from the current user's friend list
      const userDocRef = doc(db, "Users", userID);
      await updateDoc(userDocRef, {
        friends_list: arrayRemove(id),
      });
      const friendDocRef = doc(db, "Users", id);
      await updateDoc(friendDocRef, {
        friends_list: arrayRemove(userID),
      });
      toast({
        title: "Friend Removed Successfully!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      console.error("Error removing friend:", error);
      throw error;
    }
  };
  useEffect(() => {
    console.log(id);

    fetchUser();
    fetchAllLikedSongs();
  }, [id]);

  return (
    <Box display="flex" flexDirection="column" h="100vh" bg="#1D2123">
      <Header />
      <Profile
        user={user}
        onaddFriend={addFriend}
        onunfriend={unfriend}
        isUserProfile={isUserProfile}
      />

      <ProfileMusicList tracks={likedSongs} />
    </Box>
  );
}

export default ProfilePage;
