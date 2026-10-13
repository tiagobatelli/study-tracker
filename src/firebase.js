import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7W9NY_mpUDBCPHNC9he10cIdRSEwZeSI",
  authDomain: "study-tracker-145a5.firebaseapp.com",
  projectId: "study-tracker-145a5",
  storageBucket: "study-tracker-145a5.firebasestorage.app",
  messagingSenderId: "936966806123",
  appId: "1:936966806123:web:0fbd8b40c446faad902f2e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch(console.error);