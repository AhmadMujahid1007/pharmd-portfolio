import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// TODO: Replace with your Firebase config
// You can get this from Firebase Console -> Project Settings -> Your apps
const firebaseConfig = {
    apiKey: "AIzaSyBV22M4QbNTzw80IPiLRXMetT-OVJ5PN0E",
    authDomain: "pharmd-62541.firebaseapp.com",
    projectId: "pharmd-62541",
    storageBucket: "pharmd-62541.firebasestorage.app",
    messagingSenderId: "14778324268",
    appId: "1:14778324268:web:fe7e5095970acb95a50889",
    measurementId: "G-P97BQMCXMF"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;


