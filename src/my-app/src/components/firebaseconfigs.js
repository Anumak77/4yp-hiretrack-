/*// Import the functions you need from the SDKs you need
import { initializeApp} from "firebase/app";
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import 'firebase/database';
import { getFirestore, collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
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
  databaseURL: "https://hiretrack-7b035-default-rtdb.europe-west1.firebasedatabase.app/",
  appId: "1:417237368630:web:265291601dc29ae73a7d97",
  measurementId: "G-8V01GJZLN4"
};

// Initialize Firebase
export const firebaseapp = initializeApp(firebaseConfig);

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const db = getFirestore(app)

export { database, ref, get, auth, collection, query, where, onSnapshot, orderBy };
export{db}*/