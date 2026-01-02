import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Uisti sa, že port 4000 sedí s tvojím server.js
      const res = await axios.post('http://localhost:4000/api/auth/login', { email, password });
      onLogin(res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Nesprávne meno alebo heslo');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Vitaj späť</h2>
        <p>Prihlás sa do svojho SmartInvoice účtu</p>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="login-input-group">
            <label>E-mailová adresa</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="sarah@example.com"
              required 
            />
          </div>
          <div className="login-input-group">
            <label>Heslo</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className="login-btn">
            Prihlásiť sa
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;