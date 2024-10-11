import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJERSr9NJsL4IccZ9-8Jle01a8tOlPiGE",
  authDomain: "eduflux-bbe14.firebaseapp.com",
  projectId: "eduflux-bbe14",
  storageBucket: "eduflux-bbe14.appspot.com",
  messagingSenderId: "784797909165",
  appId: "1:784797909165:web:05e71c1c84347098378624",
  measurementId: "G-EBNN5E9VF5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth using the initialized app
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
