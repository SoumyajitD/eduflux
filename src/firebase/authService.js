// src/firebase/authService.js
import { auth } from './firebaseConfig'; // Ensure you are importing the auth instance
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged as firebaseOnAuthStateChanged } from 'firebase/auth';

// Sign up user with email and password
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password); // Pass 'auth' as the first argument
    return userCredential.user;
  } catch (error) {
    throw error; // Handle the error appropriately in your application
  }
};

// Sign in user with email and password
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password); // Pass 'auth' as the first argument
    return userCredential.user;
  } catch (error) {
    throw error; // Handle the error appropriately in your application
  }
};

// Sign out user
export const signOut = async () => {
  try {
    await firebaseSignOut(auth); // Pass 'auth' as the first argument
  } catch (error) {
    throw error; // Handle the error appropriately in your application
  }
};

// Check if user is authenticated
export const onAuthStateChanged = (callback) => {
  firebaseOnAuthStateChanged(auth, (user) => { // Pass 'auth' as the first argument
    callback(user);
  });
};
