const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const serviceAccount = require('./music-alchemy-firebase-adminsdk.json');
const bodyParser = require('body-parser');
const axios = require('axios');


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



const querystring = require('querystring');

const clientId = '57e35b7900e2473eb2c8a3dc6b3e68ce';
const clientSecret = 'ee8e317543da4aa59bb351217a476e14';
const redirectUri = 'http://localhost:3000/callback';

app.get('/login', (req, res) => {
  const scopes = 'user-read-private user-read-email'; // Add necessary scopes
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
    }));
});


let accessToken;

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      },
    });

    const accessToken = response.data.access_token;

    // Now you have the accessToken, you can use it in subsequent routes or functions
  

  } catch (error) {
    console.error('Error exchanging code for token:', error.message);
    res.status(500).send('Error exchanging code for token');
  }
});



app.get('/autocomplete', async (req, res) => {
  
  const query = req.query.q;
  
  try {
    const apiUrl = 'https://api.spotify.com/v1/search';
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      },
      params: {
        q: query,
        type: 'track',
      },
    });

    const tracks = response.data.tracks.items;
    res.json(tracks.map(track => track.name));
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.post('/create-track', async (req, res) => {
  
  const trackName = req.query.trackName;

  try {
    // Get access token from Spotify (you may need to implement this function
    const apiUrl = 'https://api.spotify.com/v1/search';
    // Make a request to Spotify API to search for the track
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': 'Bearer ' + accessToken,
      },
      params: {
        q: trackName,
        type: 'track',
      },
    });

    const track = response.data.tracks.items[0]; // Assuming you want only the first track

    if (track) {
      // Check if the track already exists in the 'Tracks' collection
      const trackId = track.id;
      const query = db.collection('Tracks').where('spotify_track_id', '==', trackId).limit(1);
      const existingTrackSnapshot = await query.get();
      const trackExists = !existingTrackSnapshot.empty;

      if (!trackExists) {
        // Process track data and add it to the 'Tracks' collection
        // ... (your existing track data processing code)
        const albumId = track.album.id;

        // Fetch audio features for the track
        const audioFeatures = await getAccessToken.getAudioFeaturesForTrack(trackId);

        const artistNames = [];
        const artistUrls = [];
        const artistIds = [];
        const artistImages = [];

        // Process each artist in the track
        for (const artist of track.artists) {
          artistNames.push(artist.name);
          artistUrls.push(artist.external_urls.spotify);
          artistIds.push(artist.id);

          // Fetch artist information to get images
          const artistInfo = await getAccessToken.getArtist(artist.id);
          artistImages.push(...artistInfo.body.images);
        }

        // Create the track data object
        const trackData = {
          album_type: track.album.album_type,
          album_URL: track.album.external_urls.spotify,
          album_name: track.album.name,
          album_release_date: track.album.release_date,
          album_images: track.album.images, // array
          spotify_album_id: albumId,
          artists: artistNames, // array
          artist_urls: artistUrls, // array
          artist_images: artistImages, // array
          spotify_artist_ids: artistIds, // array
          length_in_seconds: track.duration_ms / 1000,
          spotify_track_id: trackId,
          track_url: track.external_urls.spotify,
          track_name: track.name,
          rating: 0.0,
          like_count: 0,
          rating_count: 0,
          added_at: admin.firestore.FieldValue.serverTimestamp(),
          acousticness: audioFeatures.body.acousticness,
          danceability: audioFeatures.body.danceability,
          energy: audioFeatures.body.energy,
          instrumentalness: audioFeatures.body.instrumentalness,
          liveness: audioFeatures.body.liveness,
          loudness: audioFeatures.body.loudness,
          mode: audioFeatures.body.mode,
          tempo: audioFeatures.body.tempo,
          key: audioFeatures.body.key,
          valence: audioFeatures.body.valence,
        };

        // Add the track data to the 'Tracks' collection
        await db.collection('Tracks').add(trackData);
      }
    }

    res.json(trackData); // Adjust the response format as needed
  } catch (error) {
    console.error('Error searching for track:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
