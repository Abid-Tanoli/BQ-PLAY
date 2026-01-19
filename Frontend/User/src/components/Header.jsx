import React from "react";

export default function Header({ user, onShowLogin, onShowRegister, onLogout }) {
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-gray-900 text-white shadow-md">
      <h1 className="text-xl font-bold">BQ-PLAY — Live Cricket</h1>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="text-right">
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm text-gray-400">{user.role || 'user'}</div>
            </div>
            <button
              onClick={onLogout}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded-md font-semibold"
            >Logout</button>
          </>
        ) : (
          <>
            <button
              onClick={onShowLogin}
              className="border border-gray-400 px-3 py-1 rounded-md hover:bg-gray-800"
            >Login</button>
            <button
              onClick={onShowRegister}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded-md font-semibold"
            >Register</button>
          </>
        )}
      </div>
    </header>
  );
}
