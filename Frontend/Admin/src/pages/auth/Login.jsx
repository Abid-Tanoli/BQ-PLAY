import React, { useState } from 'react';
import { api } from '../api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@bqplay.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/login', { email, password });
      const { token, user } = res.data;
      onLogin(token, user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login">
      <h2>Admin Login</h2>
      <form onSubmit={submit}>
        <input value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      {error && <div className="error">{error}</div>}
    </div>
  );
}