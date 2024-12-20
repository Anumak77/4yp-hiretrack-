// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8Utor-iMusnKdg5bcRFUU2zpt_AHduFU",
  authDomain: "hiretrack-7b035.firebaseapp.com",
  projectId: "hiretrack-7b035",
  storageBucket: "hiretrack-7b035.firebasestorage.app",
  messagingSenderId: "417237368630",
  appId: "1:417237368630:web:265291601dc29ae73a7d97",
  measurementId: "G-8V01GJZLN4"
};

// Initialize Firebase
export const firebaseapp = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);