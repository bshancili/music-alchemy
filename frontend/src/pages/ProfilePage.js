import { useEffect, useState } from "react";
import Profile from "../components/Profile";
import { Box } from "@chakra-ui/react";
import Header from "../components/Header";
import ProfileMusicList from "../components/ProfileMusicList";
import useAuthStore from "../stores/authStore";
import { db } from "../firebase";
import {
  doc,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

function ProfilePage() {
  //const { userID } = useParams();
  const [user, setUser] = useState();
  const [likedSongs, setLikedSongs] = useState([]);
  const [tracks, setTracks] = useState([]);

  const { userID } = useAuthStore();

  const fetchUser = async () => {
    try {
      const userDocRef = doc(db, "Users", userID);
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

  const fetchPost = async (artistName = "") => {
    const tracksCollection = collection(db, "Tracks");
    //const q = query(tracksCollection, where("track_name", "==", trackName));
    const q = query(
      tracksCollection,
      where("artists", "array-contains", artistName)
    );

    try {
      const snap = await getDocs(q);
      const trackData = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTracks(trackData);
    } catch (error) {
      console.error("Error fetching tracks:", error);
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
      const userDocRef = doc(db, "Users", userID);
      const userSnap = await getDoc(userDocRef);
      if (userSnap) {
        const userData = userSnap.data();
        const likedSongs = Object.keys(userData.liked_song_list || {});
        const tracksDetails = await Promise.all(
          likedSongs.map((trackId) => fetchTrackDetails(trackId))
        );

        console.log(tracksDetails);
        setLikedSongs(tracksDetails);
      }
    } catch (error) {}
  };

  const addFriend = async () => {
    try {
      // Add friendUid to the current user's friend list
      const userDocRef = doc(db, "Users", userID);
      await updateDoc(userDocRef, {
        friends_list: arrayUnion("p1u0qWTtY4NgE0KWAO8wYKIX2t92"),
      });

      console.log("Friend added successfully!");
    } catch (error) {
      console.error("Error adding friend:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchUser();
    fetchAllLikedSongs();
  }, []);

  return (
    <Box display="flex" flexDirection="column" h="100vh" bg="#1D2123">
      <Header />
      <Profile user={user} />
      <ProfileMusicList tracks={likedSongs} />
    </Box>
  );
}

export default ProfilePage;
