import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const SignIn = () => {
  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Save user info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return <button onClick={handleSignIn}>Sign in with Google</button>;
};

export default SignIn;