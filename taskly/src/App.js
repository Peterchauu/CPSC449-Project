import { useEffect, useState } from "react";
import { auth } from "./firebase";
import SignIn from "./components/SignIn";
import Dashboard from "./components/Dashboard";
import { DarkModeProvider } from "./context/DarkModeContext";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <DarkModeProvider>
      <div>{user ? <Dashboard user={user} /> : <SignIn />}</div>
    </DarkModeProvider>
  );
}

export default App;