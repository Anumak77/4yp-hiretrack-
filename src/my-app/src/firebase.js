// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Add Firebase Storage
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJg8KZArrxfX6xSCJLm-f4IaBCAY0S6Ks",
  authDomain: "hiretrack-3d405.firebaseapp.com",
  projectId: "hiretrack-3d405",
  storageBucket: "hiretrack-3d405.appspot.com",
  messagingSenderId: "730450872917",
  appId: "1:730450872917:web:5e961ed1ab755b355322dc",
  measurementId: "G-3R4RQPCQ9V",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage(app); 

export { auth, storage };