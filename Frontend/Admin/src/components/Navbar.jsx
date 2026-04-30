import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Theme Management
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login");
  };

  return (
    <nav className="bg-cric-card border-b border-cric-border px-6 py-4 flex items-center justify-between transition-colors duration-300">
      <button onClick={onMenuClick} className="lg:hidden text-cric-muted hover:text-cric-accent">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <div className="flex items-center gap-4 ml-auto">
        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-full bg-cric-bg text-cric-muted hover:text-cric-accent border border-cric-border transition-colors duration-200 focus:outline-none"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <div className="text-right">
          <p className="text-sm font-semibold text-cric-text">{user?.name || "Admin"}</p>
          <p className="text-xs text-cric-muted">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
