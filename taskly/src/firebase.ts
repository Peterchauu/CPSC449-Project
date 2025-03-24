import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlkvKX9nOJLPsoHtKcHAxxBtHHjOaWso8",
  authDomain: "taskly-1ec10.firebaseapp.com",
  projectId: "taskly-1ec10",
  storageBucket: "taskly-1ec10.firebasestorage.app",
  messagingSenderId: "420087081166",
  appId: "1:420087081166:web:128f957e5a6821821a089f",
  measurementId: "G-CEGY9Q9H16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export type { User };
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
