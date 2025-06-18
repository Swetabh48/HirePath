// Import the functions you need from the SDKs you need
import { initializeApp,getApp,getApps } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKxntB258GluCHez2aXxXYCYG-G6Ni0qc",
  authDomain: "hirepath-90aff.firebaseapp.com",
  projectId: "hirepath-90aff",
  storageBucket: "hirepath-90aff.firebasestorage.app",
  messagingSenderId: "236101445874",
  appId: "1:236101445874:web:ca20d8552b9f7ca4df886b",
  measurementId: "G-LX7B7W9LRB"
};

// Initialize Firebase
const app =!getApps.length? initializeApp(firebaseConfig):getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);