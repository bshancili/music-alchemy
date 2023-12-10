const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./music-alchemy-firebase-adminsdk.json");
const bodyParser = require("body-parser");
const axios = require("axios");
const FIREBASE_API_KEY = "AIzaSyDoWU1lhDCZnwWYGIxH2Zqz5CimeTbTFS0";

const OpenAIApi = require("openai");

const openai = new OpenAIApi({
  apiKey: "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",
});

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Function to validate password
function validatePassword(password) {
  const re =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&=+#])[A-Za-z\d@$!%*?&=+#]{8,}$/;
  const testResult = re.test(String(password));
  console.log("Password Test Result:", testResult);
  if (!testResult) {
    console.log("Failed on lowercase:", /^(?=.*[a-z])/.test(password));
    console.log("Failed on uppercase:", /^(?=.*[A-Z])/.test(password));
    console.log("Failed on number:", /^(?=.*\d)/.test(password));
    console.log(
      "Failed on special character:",
      /^(?=.*[@$!%*?&+])/.test(password)
    );
    console.log(
      "Failed on overall format:",
      /^[A-Za-z\d@$!%*?&+]{8,}$/.test(password)
    );
  }
  return testResult;
}

// Email and Password Signup
app.post("/signup", async (req, res) => {
  console.log("Received Request:", req.body);
  const { email, password } = req.body;

  if (!validatePassword(password)) {
    return res.status(400).send("Password does not meet requirements.");
  }

  try {
    const userRecord = await admin.auth().createUser({ email, password });
    console.log("User created:", userRecord.uid);
    res.status(201).send({ uid: userRecord.uid });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// Email and Password Signin
app.post("/signin", async (req, res) => {
  console.log("Received Sign-in Request:", req.body);
  const { email, password } = req.body;

  // Call the Firebase Auth REST API to verify the email and password
  const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

  try {
    // Perform the REST API call to Firebase to verify the user's email and password
    const signInResponse = await axios.post(signInUrl, {
      email: email,
      password: password,
      returnSecureToken: true,
    });

    // If successful, response with the ID token and other details
    const idToken = signInResponse.data.idToken;

    // Use ID token to get the user record or create a custom token if needed
    const userRecord = await admin.auth().verifyIdToken(idToken);

    res.status(200).send({
      customToken: idToken,
      status: "Successfully signed in with email!",
      uid: userRecord.uid,
    });
  } catch (error) {
    // This checks if error.response exists before trying to access error.response.data
    if (error.response) {
      // print detailed error message
      console.error("Sign-in Error:", error.response.data);
      res.status(error.response.status).send({
        status: "Authentication failed",
        error: error.response.data.error.message,
      });
    } else {
      // Error details are not available here because there was no HTTP response
      console.error("Error details:", error.message);
      res
        .status(500)
        .send({ status: "Authentication failed", error: error.message });
    }
  }
});
////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
app.post("/search_songs", async (req, res) => {
  const data = req.body;
  const tracks = data.tracks;

  if (!tracks) {
    return res.status(400).json({ error: "No tracks provided" });
  }

  const allResults = [];

  for (const track of tracks) {
    const trackName = track.track_name;
    const artistName = track.artist_name;

    if (trackName && artistName) {
      const results = await searchInFirestore(trackName, artistName);
      allResults.push(...results);
    } else {
      allResults.push({
        error: `Missing track_name or artist_name for track ${JSON.stringify(
          track
        )}`,
      });
    }
  }
  // If the allResults array is empty, return a 204 No Content status
  if (allResults.length === 0) {
    return res.status(204).json({
      message:
        "Not a lucky time! Please try again!!Recommended songs are not matched in Tracks. The list is empty!",
    });
  }

  // If there are results, return them with a 200 OK status
  return res.status(200).json({ results: allResults });
});

async function searchInFirestore(trackName, artistName) {
  // Perform a case-insensitive search in the 'Tracks' collection
  const trackNameLowerCase = trackName.toLowerCase();
  const artistNameLowerCase = artistName.toLowerCase();
  const results = [];

  const tracksRef = db.collection("Tracks");
  const querySnapshot = await tracksRef
    .where("lowercased_track_name", "==", trackNameLowerCase)
    .where("lowercased_artists", "array-contains", artistNameLowerCase)
    .limit(10)
    .get();

  querySnapshot.forEach((doc) => {
    results.push({
      track_id: doc.id,
    });
  });

  return results;
}

app.post("/retrieve_user_tracks", async (req, res) => {
  try {
    const uid = req.body["uid"];
    const songsSnapshot = await db.collection("Users").get();
    const songsList = [];
    songsSnapshot.forEach((doc) => {
      if (doc.data()["uid"] == uid) {
        songsList.push({
          id: doc.data()["uid"],
          rated_songs: doc.data()["rated_song_list"],
          liked_songs: doc.data()["liked_song_list"],
        });
      }
    });
    res.status(200).send(songsList);
  } catch (error) {
    console.error("Error retrieving songs: ", error);
    res.status(500).send(error);
  }
});

app.post("/recent_liked_songs", async (req, res) => {
  try {
    const uid = req.body["uid"];
    const querySnapshot = await db.collection("Users").get();
    const songs = [];

    querySnapshot.forEach((doc) => {
      if (doc.data()["uid"] == uid) {
        const likedSongs = doc.data()["liked_song_list"];
        for (const songId in likedSongs) {
          const timestamp = likedSongs[songId].timestamp;
          const date = new Date(
            timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000
          );
          date.setHours(date.getHours() + 3);

          songs.push({
            songid: songId,
            timestamp: date,
          });
        }
      }
    });
    //console.log("Before sorting:", songs);
    songs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // sort by timestamp
    //console.log("After sorting:", songs);
    const recentSongs = songs.slice(0, 5); // most recent 5 songs
    //console.log("Recent 5 songs:", recentSongs);
    res.status(200).send(recentSongs);
  } catch (error) {
    console.error("Error fetching recent songs: ", error);
    res.status(500).send("Error fetching recent songs");
  }
});

app.post("/get_track_artist", async (req, res) => {
  const docId = req.body["docId"];
  try {
    const docRef = db.collection("Tracks").doc(docId);
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      const artists = data["artists"];
      res.status(200).send({ artist: artists[0] });
    } else {
      res.status(404).send({ message: "Document not found" });
    }
  } catch (error) {
    console.error("Error retrieving document: ", error);
    res.status(500).send({ message: "Error retrieving document", error });
  }
});

app.post("/find_song_name", async (req, res) => {
  const docId = req.body["docId"];
  try {
    const docRef = db.collection("Tracks").doc(docId);
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      const name = data["track_name"];
      res.status(200).send({ name });
    } else {
      res.status(404).send({ message: "Document not found" });
    }
  } catch (error) {
    console.error("Error retrieving document: ", error);
    res.status(500).send({ message: "Error retrieving document", error });
  }
});

app.post("/retrieve_friend_list", async (req, res) => {
  try {
    const uid = req.body["uid"];
    const querySnapshot = await db.collection("Users").get();
    const friends = [];
    querySnapshot.forEach((doc) => {
      if (doc.data()["uid"] == uid) {
        friends.push({
          friends_list: doc.data()["friends_list"],
        });
      }
    });
    res.status(200).send(friends);
  } catch (error) {
    console.error("Error retrieving songs: ", error);
    res.status(500).send(error);
  }
});

app.post("/get_privacy_value", async (req, res) => {
  try {
    const uid = req.body["uid"];
    if (!uid) {
      return res.status(400).json({ error: "No UID provided" });
    }
    const userRef = db.collection("Users").doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    const userData = doc.data();
    const isPrivate = userData.Isprivate === 1;

    return res.status(200).json({ isPrivate });
  } catch (error) {
    console.error("Error retrieving privacy value: ", error);
    res
      .status(500)
      .json({ error: "Error retrieving privacy value", details: error });
  }
});

async function find_recommended_track(prompt_chatgpt) {
  let tracks = prompt_chatgpt.split("\n").map((line) => {
    let parts = line.split(" - ");
    return {
      track_name: parts[0] ? parts[0].trim() : "",
      artist_name: parts[1] ? parts[1].trim() : "",
    };
  });

  try {
    let response = await axios.post("http://localhost:3000/search_songs", {
      tracks,
    });
    if (response.data && response.data.results) {
      console.log(response.data.results);
      return response.data.results;
    }
  } catch (error) {
    console.error("Error fetching data for tracks:", error);
  }

  return [];
}

app.post("/find_recommended_tracks", async (req, res) => {
  const userUid = req.body["uid"];

  try {
    const userData = { uid: userUid };
    const response = await axios.post(
      "http://localhost:3000/retrieve_user_tracks",
      userData
    );
    const rated_songs = response.data[0]["rated_songs"];
    const liked_songs = response.data[0]["liked_songs"];
    console.log(rated_songs);
    console.log(liked_songs);
    let songIdList = await Promise.all(
      Object.keys(rated_songs).map(async (songId) => {
        const songData = { docId: songId };
        const songName = await axios.post(
          "http://localhost:3000/find_song_name",
          songData
        );
        const artistName = await axios.post(
          "http://localhost:3000/get_track_artist",
          songData
        );
        //console.log(songName.data);
        return `${songName.data["name"]} - rated by ${rated_songs[songId].rating} - sang by ${artistName.data["artist"]}`;
      })
    );
    let lsongIdlist = await Promise.all(
      Object.keys(liked_songs).map(async (songId) => {
        const songData = { docId: songId };
        const songName = await axios.post(
          "http://localhost:3000/find_song_name",
          songData
        );
        const artistName = await axios.post(
          "http://localhost:3000/get_track_artist",
          songData
        );
        //console.log(songName.data);
        return `${songName.data["name"]} - sang by ${artistName.data["artist"]}`;
      })
    );

    let combinedList = songIdList.concat(lsongIdlist);
    let myList = combinedList.join("\n");

    const prompt =
      "I would like you to give me 10 song reccomendations with name of the artist according to my list which includes rated and liked songs by me." +
      'Please just provide name of the songs and artist names "-" between them and do not quote the name of the songs or put anything unrelated like' +
      '"sang by" or anyting else here is the example format: All I want - Adele:\n' +
      myList;
    const openai_response = await openai.chat.completions.create({
      model: "gpt-4", // or another model
      messages: [{ role: "user", content: prompt }],
    });

    console.log(openai_response["choices"][0]["message"]["content"]);
    //res.status(200).send(openai_response['choices'][0]['message']['content']);
    const recommendations = await find_recommended_track(
      openai_response["choices"][0]["message"]["content"]
    );
    res.status(200).send(recommendations);
  } catch (error) {
    // Handle errors
    console.error("Error when trying to retrieve user tracks:", error);
    res
      .status(error.response?.status || 500)
      .json({ message: "Error retrieving user tracks" });
  }
});

function removeEmptyLines(text) {
  const lines = text.split("\n");
  const filteredLines = lines.filter((line) => line.trim() !== "");
  return filteredLines.join("\n");
}

app.post("/temporal_recommendation", async (req, res) => {
  const userUid = req.body["uid"];
  try {
    const userData = { uid: userUid };
    const response = await axios.post(
      "http://localhost:3000/recent_liked_songs",
      userData
    );

    console.log(response.data);
    // Extract song IDs from the response
    const songIds = response.data.map((item) => item.songid);
    console.log(songIds);

    let songDetailsList = await Promise.all(
      songIds.map(async (songId) => {
        const songData = { docId: songId };
        const songNameResponse = await axios.post(
          "http://localhost:3000/find_song_name",
          songData
        );
        const artistNameResponse = await axios.post(
          "http://localhost:3000/get_track_artist",
          songData
        );

        return `${songNameResponse.data["name"]} - sang by ${artistNameResponse.data["artist"]}`;
      })
    );

    let myList = songDetailsList.join("\n");
    //console.log(myList);
    const prompt =
      "I will provide list of songs find the albums which these songs belong then recommend all of the songs from these albums for each five song in my list.If there are songs sang by same artist in my list do not duplicate yourself, then recommend another 5 songs of artist from another albums different then you recommended" +
      "Also do not put anything unrelated numbers or explanations or space between sections just prompt list of formatted songs as I indicated." +
      'Please just provide name of the songs and artist names "-" between them and do not quote the name of the songs or put anything unrelated like "sang by" or the name of the album here is teh example of the format, name of the song - name of the artist: \n' +
      myList;
    const openai_response = await openai.chat.completions.create({
      model: "gpt-4", // or another model
      messages: [{ role: "user", content: prompt }],
    });
    result = removeEmptyLines(
      openai_response["choices"][0]["message"]["content"]
    );
    console.log(result);
    const recommendations = await find_recommended_track(result);
    res.status(200).send(recommendations);
  } catch (error) {
    console.error("Error when trying to retrieve user tracks:", error);
    res
      .status(error.response?.status || 500)
      .json({ message: "Error retrieving user tracks" });
  }
});

app.post("/friends_recommendation", async (req, res) => {
  const userUid = req.body["uid"];
  try {
    const userData = { uid: userUid };
    const friendsResponse = await axios.post(
      "http://localhost:3000/retrieve_friend_list",
      userData
    );
    const friendsList = friendsResponse.data[0]["friends_list"];

    let allSongsFriends = [];
    let userLikedSongs = [];
    const response = await axios.post(
      "http://localhost:3000/retrieve_user_tracks",
      userData
    );
    const liked_songs = response.data[0]["liked_songs"];
    let lsongIdlist = await Promise.all(
      Object.keys(liked_songs).map(async (songId) => {
        const songData = { docId: songId };
        const songName = await axios.post(
          "http://localhost:3000/find_song_name",
          songData
        );
        const artistName = await axios.post(
          "http://localhost:3000/get_track_artist",
          songData
        );
        //console.log(songName.data);
        userLikedSongs.push(
          `${songName.data["name"]} - ${artistName.data["artist"]}`
        );
      })
    );

    for (const friendUid of friendsList) {
      const friendData = { uid: friendUid };
      const friendprivacyResponse = await axios.post(
        "http://localhost:3000/get_privacy_value",
        { uid: friendUid }
      );

      if (friendprivacyResponse.data["isPrivate"] === false) {
        console.log(friendUid);
        const friendTracksResponse = await axios.post(
          "http://localhost:3000/retrieve_user_tracks",
          friendData
        );
        const likedSongs = friendTracksResponse.data[0]["liked_songs"];
        console.log(likedSongs);

        for (const songId in likedSongs) {
          const songNameResponse = await axios.post(
            "http://localhost:3000/find_song_name",
            { docId: songId }
          );
          const artistNameResponse = await axios.post(
            "http://localhost:3000/get_track_artist",
            { docId: songId }
          );
          allSongsFriends.push(
            `${songNameResponse.data["name"]} - ${artistNameResponse.data["artist"]}`
          );
        }
      }
    }

    // Remove duplicates and prepare prompt for recommendation
    allSongsFriends = [...new Set(allSongsFriends)].join("\n");
    //console.log(allSongsFriends);
    const prompt =
      "Here is my list of the songs I liked: " +
      userLikedSongs +
      "Also here is list of songs that my friends like: " +
      allSongsFriends +
      "Please compare the list of songs my friends liked with my list if there are at least 5 different songs print those songs otherwise recommend songs with similar genres." +
      'Please just provide name of the songs and artist names "-" between them and do not quote the name of the songs or put anything unrelated like' +
      '"sang by" or anyting else here is the example format: All I want - Adele. The output should be list of songs with provided format.\n';
    const openai_response = await openai.chat.completions.create({
      model: "gpt-4", // or another model
      messages: [{ role: "user", content: prompt }],
    });

    console.log(openai_response["choices"][0]["message"]["content"]);
    //res.status(200).send(openai_response['choices'][0]['message']['content']);
    const recommendations = await find_recommended_track(
      openai_response["choices"][0]["message"]["content"]
    );
    res.status(200).send(recommendations);
  } catch (error) {
    console.error("Error in /friends_recommendation:", error);
    res
      .status(error.response?.status || 500)
      .json({ message: "Error retrieving friends' recommendations" });
  }
});
