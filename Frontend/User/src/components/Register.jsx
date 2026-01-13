import React, { useState } from 'react';
import { register } from '../pages/auth/auth';

export default function Register({ onSuccess, onCancel }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const user = await register(name, email, password);
      onSuccess && onSuccess(user);
    } catch (error) {
      setErr(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding:16,background:'#0f1724',borderRadius:8}}>
      <h3>Register</h3>
      <form onSubmit={submit}>
        <div style={{marginBottom:8}}>
          <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{width:'100%',padding:8,borderRadius:6}} />
        </div>
        <div style={{marginBottom:8}}>
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{width:'100%',padding:8,borderRadius:6}} />
        </div>
        <div style={{marginBottom:8}}>
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{width:'100%',padding:8,borderRadius:6}} />
        </div>
        <div style={{display:'flex',gap:8}}>
          <button type="submit" disabled={loading} style={{background:'#ffb703',border:'none',padding:'8px 12px',borderRadius:6,cursor:'pointer'}}>Register</button>
          <button type="button" onClick={onCancel} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.08)',padding:'8px 12px',borderRadius:6}}>Cancel</button>
        </div>
      </form>
      {err && <div style={{color:'#ff7b7b',marginTop:8}}>{err}</div>}
    </div>
  );
}