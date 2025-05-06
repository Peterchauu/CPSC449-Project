import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Link } from 'react-router-dom';
import '../styles/SignIn.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h1>Taskly</h1>
        <h2>Create an Account</h2>
        
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleRegister}>
         
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          
          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              minLength="6"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="signin-button" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <p className="signup-link">
          Have an Account? <Link to="/signin">Sign in here!</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;