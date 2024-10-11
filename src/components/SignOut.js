// src/components/SignOut.js
import React from 'react';
import { signOut } from '../firebase/authService'; // Import the signOut function

const SignOut = () => {
  const handleSignOut = async () => {
    try {
      await signOut();
      alert('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
};

export default SignOut;
