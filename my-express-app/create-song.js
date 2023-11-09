const admin = require('firebase-admin');
const serviceAccount = require('./music-alchemy-firebase-adminsdk.json');
//initialize firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    //databaseURL: 'https://your-database-url.firebaseio.com' // Replace with your Firebase DB URL
  });
//set up express app
const app = express();
app.use(bodyParser.json());
console.log("  hello  youtube");
// endpoint song request
app.post('/song-request', async (req, res) => {
    console.log("Received Song Request:", req.body);
    const { songTitle, artist, album } = req.body; // Assuming the request body contains the song details
  
    // Add any necessary validation logic for the song request data here

    
    try {
      // Add logic here to save the song request to your database or perform any necessary operations
      // For example, you can use Firebase Firestore to store the song request details
     
      const songRequestRef = await db.collection('songRequests').add({ 
        songTitle: songTitle,
        artist: artist,
        album: album
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