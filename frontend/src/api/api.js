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
};
