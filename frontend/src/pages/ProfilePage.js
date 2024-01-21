import { useEffect, useState } from "react";
import { Text, Box, useToast } from "@chakra-ui/react"; // Add Text to the import statement
import Header from "../components/Header";
import Profile from "../components/Profile";
import ProfileMusicList from "../components/ProfileMusicList";
import { db } from "../firebase";
import { useParams } from "react-router-dom";
import {
  fetchTrackDetails,
  fetchAllLikedSongs,
  fetchPlaylists,
} from "../api/api";
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
  const [playlists, setPlaylists] = useState([]);
  const [isFriend, setIsFriend] = useState(false);
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
        const friendsL = userData.friends_list;
        setUser(userData);
        setFriends(friendsL);
        setIsFriend(userData.friends_list.includes(userID));
      } else {
        console.log("User not found");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchNonRatedSongs = async (userId) => {
    try {
      const userDocRef = doc(db, "Users", userId);
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
    const fetchData = async () => {
      await fetchUser();
      await fetchNonRatedSongs(id); // Pass the viewed user's ID
      await fetchAllLikedSongs(id, setLikedSongs); // Pass the viewed user's ID
      //await fetchFriends();
      await fetchPlaylists(id, setPlaylists);
    };
    //console.log(likedSongs.length);
    fetchData();
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
          isF={isFriend}
          id={id}
          isPrivate={user?.Isprivate}
          friends={friends}
          songCount={likedSongs.length}
        />
      )}
      {user && // Check if user is available before checking conditions
        (isFriend || isUserProfile || user?.Isprivate === 0) && (
          <ProfileMusicList
            tracks={likedSongs}
            non_rated={nonRatedSongs}
            userID={userID}
            playlists={playlists}
            setPlaylists={setPlaylists}
            friends={friends}
            username={user.username}
          />
        )}
    </Box>
  );
}

export default ProfilePage;
