import { useEffect, useState } from "react";
import { Text, Box, useToast } from "@chakra-ui/react"; // Add Text to the import statement
import Header from "../components/Header";
import Profile from "../components/Profile";
import ProfileMusicList from "../components/ProfileMusicList";
import { db } from "../firebase";
import { useParams } from "react-router-dom";
import { fetchTrackDetails, fetchAllLikedSongs } from "../api/api";
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
  const [nonRatedSongs, setNonRatedSongs] = useState([]);
  const [friends, setFriends] = useState([]);
  const { id } = useParams();
  const userID = localStorage.getItem("userID");
  const isUserProfile = id === userID;

  const toast = useToast();

  const fetchUser = async () => {
    try {
      // Ensure id is validIs
      if (!id) {
        console.error("Invalid user ID");
        return;
      }

      const userDocRef = doc(db, "Users", id);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setUser(userData);
      } else {
        console.log("User not found");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };
  const fetchFriends = async () => {
    try {
      const userDocRef = doc(db, "Users", userID);
      const userSnap = await getDoc(userDocRef);
      if (userSnap) {
        const userData = userSnap.data();
        console.log(userData);
        const friends = userData.friends_list;
        setFriends(friends);
      }
    } catch (error) {}
  };
  const fetchNonRatedSongs = async () => {
    try {
      const userDocRef = doc(db, "Users", id);
      const userSnap = await getDoc(userDocRef);
      if (userSnap) {
        const userData = userSnap.data();
        const likedSongs = Object.keys(userData.liked_song_list || {});
        const ratedSongs = Object.keys(userData.rated_song_list || {});

        const nonRated = likedSongs.filter(
          (likedSong) => !ratedSongs.includes(likedSong)
        );

        const tracksDetails = await Promise.all(
          nonRated.map((trackId) => fetchTrackDetails(trackId))
        );
        setNonRatedSongs(tracksDetails);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const addFriend = async () => {
    try {
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
    fetchUser();
    fetchNonRatedSongs();
    fetchAllLikedSongs(userID, setLikedSongs);
    console.log(user?.Isprivate);
    fetchFriends();
  }, [id]);

  return (
    <Box display="flex" flexDirection="column" h="100vh" bg="#1D2123">
      <Header />
      {user && (
        <Profile
          user={user}
          onaddFriend={addFriend}
          onunfriend={unfriend}
          isUserProfile={isUserProfile}
          friends={friends}
          id={id}
          isPrivate={user?.Isprivate}
        />
      )}
      {(user?.Isprivate === 0 ||
        user?.friends_list?.includes(userID) ||
        isUserProfile) &&
        user && (
          <ProfileMusicList tracks={likedSongs} non_rated={nonRatedSongs} />
        )}
    </Box>
  );
}

export default ProfilePage;
