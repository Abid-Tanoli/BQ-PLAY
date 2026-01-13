import React, { useState } from 'react';
import { login } from '../auth';

export default function Login({ onSuccess, onCancel }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      onSuccess && onSuccess(user);
    } catch (error) {
      setErr(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding:16,background:'#0f1724',borderRadius:8}}>
      <h3>Login</h3>
      <form onSubmit={submit}>
        <div style={{marginBottom:8}}>
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{width:'100%',padding:8,borderRadius:6}} />
        </div>
        <div style={{marginBottom:8}}>
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{width:'100%',padding:8,borderRadius:6}} />
        </div>
        <div style={{display:'flex',gap:8}}>
          <button type="submit" disabled={loading} style={{background:'#ffb703',border:'none',padding:'8px 12px',borderRadius:6,cursor:'pointer'}}>Login</button>
          <button type="button" onClick={onCancel} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.08)',padding:'8px 12px',borderRadius:6}}>Cancel</button>
        </div>
      </form>
      {err && <div style={{color:'#ff7b7b',marginTop:8}}>{err}</div>}
      <div style={{marginTop:10,fontSize:12,color:'#94a3b8'}}>Use seeded accounts from backend seed for admin/scorer (admin@bqplay.local/admin123, scorer@bqplay.local/scorer123) or register a new user.</div>
    </div>
  );
}