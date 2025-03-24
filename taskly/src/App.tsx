import React, { useState, useEffect } from "react";
import { auth, User } from "./firebase";
import SignIn from "./components/SignIn";
import Dashboard from "./components/Dashboard";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return <div>{user ? <Dashboard user={user} /> : <SignIn />}</div>;
};

export default App;