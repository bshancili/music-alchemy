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

async function getAccessToken(code) {
  const clientId = '046cbc3fe1ca4bef9a2578dbd5d219ec';
  const clientSecret = '8d90011f8474f0f933748c9b7d43b54';
  const redirectUri = 'http://localhost/';

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', null, {
      params: {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      },
      headers: {
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// endpoint song request
app.get('/autocomplete', async (req, res) => {
  const query = req.query.q;
  
  try {
    const accessToken = await getAccessToken();
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
