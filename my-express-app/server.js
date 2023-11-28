const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./music-alchemy-firebase-adminsdk.json');
const bodyParser = require('body-parser');
const axios = require('axios');
const FIREBASE_API_KEY = "AIzaSyDoWU1lhDCZnwWYGIxH2Zqz5CimeTbTFS0"

const OpenAIApi = require('openai');

const openai = new OpenAIApi({
  api_key: 'API_KEY_HERE'
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
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&=+#])[A-Za-z\d@$!%*?&=+#]{8,}$/;
    const testResult = re.test(String(password));
    console.log("Password Test Result:", testResult);
    if (!testResult) {
        console.log("Failed on lowercase:", /^(?=.*[a-z])/.test(password));
        console.log("Failed on uppercase:", /^(?=.*[A-Z])/.test(password));
        console.log("Failed on number:", /^(?=.*\d)/.test(password));
        console.log("Failed on special character:", /^(?=.*[@$!%*?&+])/.test(password));
        console.log("Failed on overall format:", /^[A-Za-z\d@$!%*?&+]{8,}$/.test(password));
    }
    return testResult;
  }
  
    
  // Email and Password Signup
  app.post('/signup', async (req, res) => {
  
      console.log("Received Request:", req.body);
      const { email, password } = req.body;
  
      if (!validatePassword(password)) {
        return res.status(400).send('Password does not meet requirements.');
      }
    
      try {
        const userRecord = await admin.auth().createUser({ email, password });
        console.log('User created:', userRecord.uid);
        res.status(201).send({ uid: userRecord.uid });
      } catch (e) {
        res.status(400).send(e.message);
      }
    });
  

// Email and Password Signin
app.post('/signin', async (req, res) => {
  console.log("Received Sign-in Request:", req.body);
  const { email, password } = req.body;

  // Call the Firebase Auth REST API to verify the email and password
  const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`; 

  try {
    // Perform the REST API call to Firebase to verify the user's email and password
    const signInResponse = await axios.post(signInUrl, {
      email: email,
      password: password,
      returnSecureToken: true
    });

    // If successful, response with the ID token and other details
    const idToken = signInResponse.data.idToken;

    // Use ID token to get the user record or create a custom token if needed
    const userRecord = await admin.auth().verifyIdToken(idToken);
    
    res.status(200).send({ 
      customToken: idToken, 
      status: 'Successfully signed in with email!', 
      uid: userRecord.uid 
    });

  } catch (error) {
    // This checks if error.response exists before trying to access error.response.data
    if (error.response) {
      // print detailed error message
      console.error('Sign-in Error:', error.response.data);
      res.status(error.response.status).send({ status: 'Authentication failed', error: error.response.data.error.message });
    } else {
      // Error details are not available here because there was no HTTP response
      console.error('Error details:', error.message);
      res.status(500).send({ status: 'Authentication failed', error: error.message });
    }
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.post('/retrieve_user_tracks', async (req,res) =>{
  try {
    const uid = req.body['uid']
    const songsSnapshot = await db.collection('Users').get();
    const songsList = [];
    songsSnapshot.forEach((doc) => {
      if (doc.data()['uid'] == uid){
        songsList.push({ id: doc.data()['uid'], rated_songs: doc.data()['rated_song_list'], liked_songs: doc.data()['liked_song_list'] });
      }
    });
    res.status(200).send(songsList);
  } catch (error) {
    console.error("Error retrieving songs: ", error);
    res.status(500).send(error);
  }
});

app.post('/get_track_artist', async (req,res) =>{
  const docId = req.body['docId']; // Get the document ID from the URL parameter
  try {
    const docRef = db.collection('Tracks').doc(docId); // Replace 'songs' with your collection name
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      const artists = data['artists']; // Assuming the field you want is named 'name'
      res.status(200).send({ artist: artists[0] });
    } else {
      res.status(404).send({ message: 'Document not found' });
    }
  } catch (error) {
    console.error("Error retrieving document: ", error);
    res.status(500).send({ message: 'Error retrieving document', error });
  }
});

app.post('/find_song_name', async (req,res) =>{
  const docId = req.body['docId']; // Get the document ID from the URL parameter

  try {
    const docRef = db.collection('Tracks').doc(docId); // Replace 'songs' with your collection name
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      const name = data['track_name']; // Assuming the field you want is named 'name'
      res.status(200).send({ name });
    } else {
      res.status(404).send({ message: 'Document not found' });
    }
  } catch (error) {
    console.error("Error retrieving document: ", error);
    res.status(500).send({ message: 'Error retrieving document', error });
  }
});

app.get('/find_recommended_tracks', async (req,res) =>{
  const userUid = req.body['uid']; // Extract the user's UID from the URL parameter

  try {
    // Replace with the actual URL of the 'retrieve_user_tracks' endpoint
    const userData = {
      uid: userUid
    };
    const response = await axios.post('http://localhost:3000/retrieve_user_tracks', userData);
    const rated_songs = response.data[0]['rated_songs'];
    const liked_songs = response.data[0]['liked_songs'];
    let songIdList = await Promise.all(Object.keys(rated_songs).map(async (songId) => {
      const songData = {docId: songId};
      const songName = await axios.post('http://localhost:3000/find_song_name', songData);
      const artistName = await axios.post('http://localhost:3000/get_track_artist', songData);
      //console.log(songName.data);
      return `${songName.data['name']} - rated by ${rated_songs[songId].rating} - sang by ${artistName.data['artist']}`;
    }));
    let lsongIdlist = await Promise.all(Object.keys(liked_songs).map(async (songId) => {
      const songData = {docId: songId};
      const songName = await axios.post('http://localhost:3000/find_song_name', songData);
      const artistName = await axios.post('http://localhost:3000/get_track_artist', songData);
      //console.log(songName.data);
      return `${songName.data['name']} - sang by ${artistName.data['artist']}`;
    }));

    let combinedList = songIdList.concat(lsongIdlist);
    let myList = combinedList.join('\n');


    const prompt = 'I want you to give me 10 songs according to my list of songs which some are rated by me some not. Here is list of songs of mine:\n' + myList;
    const openai_response = await openai.chat.completions.create({
      model: "gpt-4", // or another model
      messages: [{"role": "user", "content": prompt}],
    });

    //console.log(openai_response['choices'][0]['message']);
    res.status(200).send(openai_response['choices'][0]['message']['content']);
  } catch (error) {
    // Handle errors, such as if the 'retrieve_user_tracks' endpoint is not reachable
    console.error('Error when trying to retrieve user tracks:', error);
    res.status(error.response?.status || 500).json({ message: 'Error retrieving user tracks' });
  }
});

