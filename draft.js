import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

//import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';


const firebaseConfig = {
  apiKey: "AIzaSyDoWU1lhDCZnwWYGIxH2Zqz5CimeTbTFS0",
  authDomain: "music-alchemy.firebaseapp.com",
  projectId: "music-alchemy",
  storageBucket: "music-alchemy.appspot.com",
  messagingSenderId: "910312247053",
  appId: "1:910312247053:web:df6624364aff8accc1ea44",
  measurementId: "G-LZ8HG1S1CR"
};

const app = initializeApp(firebaseConfig);

// Sign up new users
const auth1 = getAuth();
createUserWithEmailAndPassword(auth1, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
  });

// Sign in new users
const auth2 = getAuth();
signInWithEmailAndPassword(auth2, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });

// Sign in existing users
const auth3 = getAuth();
signInWithEmailAndPassword(auth3, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });
/* 
// Testing the database connection
// Get a list of cities from your database
//const db = getFirestore(app);
async function getCities(db) {
  const citiesCol = collection(db, 'cities');
  const citySnapshot = await getDocs(citiesCol);
  const cityList = citySnapshot.docs.map(doc => doc.data());
  console.log("hehe");
  return cityList;
}

getCities(db).then(cities => {
  console.log("Cities:", cities);})
*/