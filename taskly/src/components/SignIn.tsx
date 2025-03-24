import React from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { Button, Container, Typography, Box } from "@mui/material";

const SignIn: React.FC = () => {
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <Typography variant="h3" gutterBottom>Taskly</Typography>
      <Button variant="contained" onClick={handleSignIn} size="large">
        Sign in with Google
      </Button>
    </Container>
  );
};

export default SignIn;