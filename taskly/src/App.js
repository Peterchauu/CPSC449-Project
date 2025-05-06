import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Dashboard from './components/Dashboard';
import SignIn from './components/SignIn';
import Register from './components/Register';
import { DarkModeProvider } from './components/DarkModeToggle';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <DarkModeProvider>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Dashboard /> : <Navigate to="/signin" />} 
        />
        <Route 
          path="/signin" 
          element={!user ? <SignIn /> : <Navigate to="/" />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Register /> : <Navigate to="/" />} 
        />
      </Routes>
    </DarkModeProvider>
  );
}

export default App;