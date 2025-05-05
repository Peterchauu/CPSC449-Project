import React, { useState } from "react";
import { auth, provider, db } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import DarkModeToggle from "./DarkModeToggle";
import "../styles/index.css";

const SignIn = () => {
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create or update the user document using their email as the document ID
      await setDoc(doc(db, "users", user.email), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });

      window.location.href = "/dashboard";
    } catch (error) {
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  return (
    <div className="signin-container">
      <DarkModeToggle />
      <div className="signin-card">
        <h1>Taskly</h1>
        <h2>Sign In</h2>
        {error && <p className="error-message">{error}</p>}
        <button onClick={handleGoogleSignIn} className="signin-button">
          Sign In with Google
        </button>
      </div>
    </div>
  );
};

export default SignIn;