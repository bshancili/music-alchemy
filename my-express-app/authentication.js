const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./music-alchemy-firebase-adminsdk.json');
const bodyParser = require('body-parser');
const axios = require('axios');
const FIREBASE_API_KEY = "AIzaSyDoWU1lhDCZnwWYGIxH2Zqz5CimeTbTFS0"

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
