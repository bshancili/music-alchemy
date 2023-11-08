import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDoWU1lhDCZnwWYGIxH2Zqz5CimeTbTFS0",
  authDomain: "music-alchemy.firebaseapp.com",
  databaseURL:
    "https://music-alchemy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "music-alchemy",
  storageBucket: "music-alchemy.appspot.com",
  messagingSenderId: "910312247053",
  appId: "1:910312247053:web:df6624364aff8accc1ea44",
  measurementId: "G-LZ8HG1S1CR",
};

const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const auth = getAuth(app);
export { auth };
