const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./music-alchemy-firebase-adminsdk.json');
const bodyParser = require('body-parser');


// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //databaseURL: 'https://your-database-url.firebaseio.com' // Replace with your Firebase DB URL
});

const app = express();
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
  console.log(req.body)
  const email = req.body.email;
  const pass = req.body.password;

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const customToken = await admin.auth().createCustomToken(userRecord.uid);
 
    res.status(200).send({ customToken: customToken, status: 'Successfully signed in with email!', uid: userRecord.uid });
} catch (error) {
    // Token verification failed or user not found
    res.status(401).send({ status: 'Authentication failed', error: error.message });
}
});
// Google Signin 
app.post('/signin-google', async (req, res) => {
  const idToken = req.body.idToken;  // Assuming the client sends the ID token in the request body

  try {
      // Verify the token against Firebase
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // also check if this user exists in your database or any other checks

      res.status(200).send({ status: 'Successfully signed in with Google!', uid: decodedToken.uid });
  } catch (error) {
      // Token verification failed
      res.status(401).send({ status: 'Authentication failed', error: error.message });
  }
});
  
  // Apple Signin 
  app.post('/signin-apple', (req, res) => {
    // use the Firebase Admin SDK to create a user or sign them in.
    res.status(200).send({ status: 'Successfully signed in with Apple!' });
  });
  
  // Start the server
  app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000/');
  });
