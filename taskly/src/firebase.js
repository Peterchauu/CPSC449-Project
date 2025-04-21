import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, writeBatch, doc } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyBlkvKX9nOJLPsoHtKcHAxxBtHHjOaWso8",
  authDomain: "taskly-1ec10.firebaseapp.com",
  projectId: "taskly-1ec10",
  storageBucket: "taskly-1ec10.firebasestorage.app",
  messagingSenderId: "420087081166",
  appId: "1:420087081166:web:128f957e5a6821821a089f",
  measurementId: "G-CEGY9Q9H16"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db, writeBatch, doc }; 