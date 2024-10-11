// src/components/AuthChecker.js
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from '../firebase/authService'; // Import the auth state checker

const AuthChecker = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Subscribe to the auth state change
    const unsubscribe = onAuthStateChanged((user) => {
      setUser(user);
    });

    // Clean up the subscription
    return () => unsubscribe();
  }, []);

  return (
    <div>
      {user ? <p>Welcome, {user.email}</p> : <p>Please sign in.</p>}
    </div>
  );
};

export default AuthChecker;
