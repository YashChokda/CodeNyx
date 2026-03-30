import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyCd2_jZwSwaQE1jabpJWC3bHMbFtwAzZCg",
  authDomain: "vision-to-venture.firebaseapp.com",
  projectId: "vision-to-venture",
  storageBucket: "vision-to-venture.firebasestorage.app",
  messagingSenderId: "237040606647",
  appId: "1:237040606647:web:cabc86fc22175fb0425c32"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
