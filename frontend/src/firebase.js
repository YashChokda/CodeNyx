import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAUPY8Z22U5JGqh05WTCGtsWXzJEc72xOI",
  authDomain: "fullstack-6f920.firebaseapp.com",
  projectId: "fullstack-6f920",
  storageBucket: "fullstack-6f920.firebasestorage.app",
  messagingSenderId: "380902282329",
  appId: "1:380902282329:web:fbf93259c9fb266b9e0d48"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
