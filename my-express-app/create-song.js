const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const serviceAccount = require('./music-alchemy-firebase-adminsdk.json');
const bodyParser = require('body-parser');


//initialize firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    //databaseURL: 'https://your-database-url.firebaseio.com' // Replace with your Firebase DB URL
  });

  const db = admin.firestore(); 
//set up express app
const app = express();
app.use(bodyParser.json());
app.use(cors());


// endpoint song request
app.post('/song-request', async (req, res) => {
    console.log("Received Song Request:", req.body);
    

    const  acousticness= reqBody.acousticness || null;
    const album_URL = reqBody.album_URL || null;
    const album_release_date = reqBody.album_release_date || null;
    const album_type = reqBody.album_type || null;
    const album_images = reqBody.album_images || null;
    const danceability = reqBody.danceability || null;
    const  energy= reqBody.energy || null;
    const instrumentalness = reqBody.instrumentalness || null;
    const length_in_seconds = reqBody.length_in_seconds || null;
    const liveness = reqBody.liveness || null;
    const loudness = reqBody.loudness || null;
    const  mode= reqBody.mode || null;
    const rating = reqBody.rating || null;
    const spotify_album_id = reqBody.spotify_album_id || null;
    const spotify_track_id = reqBody.spotify_track_id || null;
    const tempo = reqBody.tempo || null;      
    const track_url = reqBody.track_url || null;
    const valence = reqBody.valence || null;
    
    const { songTitle, artist, album } = req.body; // Assuming the request body contains the song details
    


    
    try {
      // Add logic here to save the song request to your databmore than ase or perform any necessary operations
      // For example, you can use Firebase Firestore to store the song request details
     
      const songRequestRef = await db.collection('Tracks').add({ 
        track_name: songTitle,
        artists: artist,
        album_name: album,
        album_images: album_images,
        acousticness: acousticness,
        album_URL: album_URL,
        album_release_date: album_release_date,
        album_type: album_type,
        danceability: danceability,
        energy: energy,
        instrumentalness: instrumentalness,
        length_in_seconds: length_in_seconds,
        liveness: liveness,
        loudness: loudness,
        mode: mode,
        rating: rating,
        spotify_album_id: spotify_album_id,
        spotify_track_id: spotify_track_id,
        tempo: tempo,
        track_url: track_url,
        valence: valence
      });
      // Send a success response with the saved song request details
      res.status(201).send({ 
        status: 'Song request created successfully',
        songTitle: songTitle,
        artist: artist,
        album: album
      });
    } catch (error) {
      // If an error occurs during the process, send an appropriate error response
      res.status(500).send({ status: 'Error creating song request', error: error.message });
    }
  });