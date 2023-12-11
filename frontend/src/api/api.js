import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { api } from "./axios";

const fetchTrackDetails = async (id) => {
  const trackRef = doc(db, "Tracks", id);
  try {
    const trackSnap = await getDoc(trackRef);
    if (trackSnap.exists()) {
      const trackDetails = {
        id: trackSnap.id,
        ...trackSnap.data(),
      };
      return trackDetails;
    } else {
      console.error(trackSnap.id, "Track not found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching track details:", error);
    return null;
  }
};
const fetchFriendRecommendations = async (
  userID,
  setFriendRecSongs,
  loading,
  setLoading
) => {
  setLoading(true);
  try {
    const response = await fetch(
      "http://localhost:3000/friends_recommendation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any additional headers if needed
        },
        body: JSON.stringify({ uid: userID }),
      }
    );
    const trackIds = await response.json();
    if (Array.isArray(trackIds) && trackIds.length > 0) {
      // Filter out items without track_id property

      const tracks = await Promise.all(
        trackIds.map((trackId) => fetchTrackDetails(trackId.track_id))
      );
      setFriendRecSongs(tracks);
      setLoading(false);
    }
  } catch (error) {
    console.log("zortladik");
    setLoading(false);
  }
};

const fetchTemp = async (userID, setTempRecSongs, loading, setLoading) => {
  console.log("clicked");

  setLoading(true);
  try {
    const response = await fetch(
      "http://localhost:3000/temporal_recommendation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any additional headers if needed
        },
        body: JSON.stringify({ uid: userID }),
      }
    );
    const trackIds = await response.json();
    console.log(trackIds);
    if (Array.isArray(trackIds) && trackIds.length > 0) {
      // Filter out items without track_id property
      const validTrackIds = trackIds.filter(
        (trackId) => trackId && trackId.track_id
      );

      const tracks = await Promise.all(
        validTrackIds.map((trackId) => fetchTrackDetails(trackId.track_id))
      );
      setTempRecSongs(tracks);
      console.log(tracks);
      setLoading(false);
    } else if (Array.isArray(trackIds) === 0) {
      fetchTemp(userID, setTempRecSongs, loading, setLoading);
    }
  } catch (error) {
    console.log("bir daha dene");
    setLoading(false);
  }
};

const fetchAllLikedSongs = async (userId, setLikedSongs) => {
  try {
    const userDocRef = doc(db, "Users", userId);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const likedSongs = Object.keys(userData.liked_song_list || {});
      const tracksDetails = await Promise.all(
        likedSongs.map((trackId) => fetchTrackDetails(trackId))
      );

      setLikedSongs(tracksDetails);
    }
  } catch (error) {
    console.error("Error fetching liked songs:", error);
  }
};

const fetchLikedSongTimestamps = async (userId, setLikedSongs) => {
  try {
    const userDocRef = doc(db, "Users", userId);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const likedSongs = userData.liked_song_list;
      const songCountByDate = Object.values(likedSongs).reduce(
        (acc, songData) => {
          // Firebase timestamp structure
          const { seconds, nanoseconds } = songData.timestamp;

          // Combine seconds and nanoseconds to create a timestamp in milliseconds
          const timestampInMillis = seconds * 1000 + nanoseconds / 1e6;

          // Create a JavaScript Date object from the timestamp
          const date = new Date(timestampInMillis);

          // Extract date without time information
          const dateWithoutTime = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );
          // Get the start of the week for the current date
          const weekStart = new Date(dateWithoutTime);
          weekStart.setDate(
            dateWithoutTime.getDate() - dateWithoutTime.getDay()
          );

          // Format week start as a string
          const weekStartString = weekStart.toISOString().split("T")[0];

          // Increment the count for the week start date or initialize it to the rating
          const existingEntry = acc.find(
            (entry) => entry.date === weekStartString
          );
          if (existingEntry) {
            existingEntry.sum += songData.rating;
            existingEntry.count += 1;
          } else {
            acc.push({ date: weekStartString, sum: songData.rating, count: 1 });
          }

          return acc;
        },
        []
      );
      // Set likedSongs state with the array of counts
      const sortedSongCountByDate = songCountByDate.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      console.log(sortedSongCountByDate);

      setLikedSongs(sortedSongCountByDate);
    }
  } catch (error) {
    console.error("Error fetching liked songs:", error);
  }
};

const fetchCreatedSongData = async (userId, setCreatedSongs) => {
  const userDocRef = doc(db, "Users", userId);
  const userSnap = await getDoc(userDocRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const createdSongs = userData.created_songs;
    const songCountByDate = Object.values(createdSongs).reduce(
      (acc, songData) => {
        // Firebase timestamp structure
        const { seconds, nanoseconds } = songData.timestamp;
        // Combine seconds and nanoseconds to create a timestamp in milliseconds
        const timestampInMillis = seconds * 1000 + nanoseconds / 1e6;

        // Create a JavaScript Date object from the timestamp
        const date = new Date(timestampInMillis);

        // Extract date without time information
        const dateWithoutTime = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );

        // Get the start of the week for the current date
        const weekStart = new Date(dateWithoutTime);
        weekStart.setDate(dateWithoutTime.getDate() - dateWithoutTime.getDay());

        // Format week start as a string
        const weekStartString = weekStart.toISOString().split("T")[0];

        // Increment the count for the week start date or initialize it to 1
        const existingEntry = acc.find(
          (entry) => entry.date === weekStartString
        );
        if (existingEntry) {
          existingEntry.count += 1;
        } else {
          acc.push({ date: weekStartString, count: 1 });
        }

        return acc;
      },
      []
    );

    // Set likedSongs state with the array of counts
    const sortedSongCountByDate = songCountByDate.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    console.log(sortedSongCountByDate);

    setCreatedSongs(sortedSongCountByDate);
  }
};

const fetchRatingCounts = async (userId, setRatingCounts) => {
  try {
    const userDocRef = doc(db, "Users", userId);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const ratedSongs = userData.rated_song_list;

      const ratingCounts = Array(10).fill(0); // Initialize an array to store counts for each rating (1-10)

      Object.values(ratedSongs).forEach((songData) => {
        const rating = songData.rating;

        // Increment the count for the corresponding rating
        if (rating >= 1 && rating <= 10) {
          ratingCounts[rating - 1] += 1;
        }
      });

      // Create an array of objects with rating and count
      const ratingCountsData = ratingCounts.map((count, index) => ({
        rating: index + 1,
        count: count,
      }));

      console.log(ratingCountsData);
      setRatingCounts(ratingCountsData);
    }
  } catch (error) {
    console.error("Error fetching rating counts:", error);
  }
};

const fetchAverageRatingByTime = async (userId, setRatedSongs) => {
  try {
    const userDocRef = doc(db, "Users", userId);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const ratedSongs = userData.rated_song_list;

      const ratingCountByDate = Object.values(ratedSongs).reduce(
        (acc, songData) => {
          // Firebase timestamp structure
          const { seconds, nanoseconds } = songData.timestamp;

          // Combine seconds and nanoseconds to create a timestamp in milliseconds
          const timestampInMillis = seconds * 1000 + nanoseconds / 1e6;

          // Create a JavaScript Date object from the timestamp
          const date = new Date(timestampInMillis);

          // Extract date without time information
          const dateWithoutTime = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );

          // Get the start of the week for the current date
          const weekStart = new Date(dateWithoutTime);
          weekStart.setDate(
            dateWithoutTime.getDate() - dateWithoutTime.getDay()
          );

          // Format week start as a string
          const weekStartString = weekStart.toISOString().split("T")[0];

          // Increment the count for the week start date or initialize it to the rating
          const existingEntry = acc.find(
            (entry) => entry.date === weekStartString
          );
          if (existingEntry) {
            existingEntry.sum += songData.rating;
            existingEntry.count += 1;
          } else {
            acc.push({ date: weekStartString, sum: songData.rating, count: 1 });
          }

          return acc;
        },
        []
      );

      // Calculate the average rating for each week
      const averageRatingByDate = ratingCountByDate.map((entry) => ({
        date: entry.date,
        averageRating: entry.sum / entry.count,
      }));
      const sortedAverageRateByDate = averageRatingByDate.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );
      console.log(sortedAverageRateByDate);
      setRatedSongs(sortedAverageRateByDate);
    }
  } catch (error) {
    console.error("Error fetching rated songs:", error);
  }
};

const fetchTemporalRecommendation = async (userID, setTempRecSongs) => {
  console.log("clicked");
  try {
    const response = await api.post("/temporal_recommendation", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: userID,
      }),
    });
    console.log(response.data);
    if (false) {
      const recommendations = response.data;
      const trackIds = recommendations.map(
        (recommendation) => recommendation.track_id
      );
      const tracks = await Promise.all(
        trackIds.map((trackId) => fetchTrackDetails(trackId.track_id))
      );
      console.log(tracks);
      setTempRecSongs(tracks);
    }
  } catch (error) {}
};

export {
  fetchAllLikedSongs,
  fetchTrackDetails,
  fetchLikedSongTimestamps,
  fetchAverageRatingByTime,
  fetchTemporalRecommendation,
  fetchCreatedSongData,
  fetchTemp,
  fetchFriendRecommendations,
  fetchRatingCounts,
};