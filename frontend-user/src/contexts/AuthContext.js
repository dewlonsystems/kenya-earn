// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null); // Django profile
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setCurrentUser(user);

          // Try to fetch Django profile
          const res = await axios.get('https://kenya-earn-backend.onrender.com/api/profile/');
          setProfile(res.data);
        } catch (error) {
          // Profile doesn't exist yet — that's OK
          setProfile(null);
        }
      } else {
        delete axios.defaults.headers.common['Authorization'];
        setCurrentUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, profile, setProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}