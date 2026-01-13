import React from 'react';

export default function Header({ user, onShowLogin, onShowRegister, onLogout }) {
  return (
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
      <div>
        <h1 style={{margin:0}}>BQ-PLAY — Live Cricket</h1>
      </div>
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        {user ? (
          <>
            <div style={{textAlign:'right'}}>
              <div style={{fontWeight:700}}>{user.name}</div>
              <div style={{fontSize:12,color:'#94a3b8'}}>{user.role || 'user'}</div>
            </div>
            <button onClick={onLogout} style={{background:'#ffb703',border:'none',padding:'8px 10px',borderRadius:6,cursor:'pointer'}}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={onShowLogin} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.08)',padding:'8px 10px',borderRadius:6,cursor:'pointer'}}>Login</button>
            <button onClick={onShowRegister} style={{background:'#ffb703',border:'none',padding:'8px 10px',borderRadius:6,cursor:'pointer'}}>Register</button>
          </>
        )}
      </div>
    </header>
  );
}