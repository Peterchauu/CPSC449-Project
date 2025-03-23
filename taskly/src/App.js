import { useEffect, useState } from "react";
import { auth } from "./firebase";
import SignIn from "./components/SignIn";
import Dashboard from "./components/Dashboard";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return <div>{user ? <Dashboard user={user} /> : <SignIn />}</div>;
}

export default App;