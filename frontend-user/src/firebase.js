// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-O1Z47vOFV6r4vMPW1EKxzHQTOn_BWRU",
  authDomain: "kenya-earn.firebaseapp.com",
  projectId: "kenya-earn",
  storageBucket: "kenya-earn.firebasestorage.app",
  messagingSenderId: "315531432509",
  appId: "1:315531432509:web:e8090799ef1d61dab59054"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);
export const storage = getStorage(app);