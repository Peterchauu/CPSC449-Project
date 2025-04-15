import React, { useState } from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import DarkModeToggle from "./DarkModeToggle";
import "../styles/SignIn.css";

const SignIn = () => {
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
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