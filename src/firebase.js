import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB5IRcxReqqADGTeLkRA-zKM2qUBK3FEC4",
  authDomain: "taxact-78897.firebaseapp.com",
  projectId: "taxact-78897",
  storageBucket: "taxact-78897.firebasestorage.app",
  messagingSenderId: "856289654300",
  appId: "1:856289654300:web:80e0985f72bb96753251d9",
  measurementId: "G-LETFHGS4NM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;