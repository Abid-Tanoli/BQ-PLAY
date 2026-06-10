import React from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Header({ user, onShowLogin, onShowRegister, onLogout }) {
  const location = useLocation();

  const navItems = [
    { name: "Matches", path: "/" },
    { name: "Series", path: "/series" },
    { name: "International", path: "/international" },
    { name: "Teams", path: "/teams" },
    { name: "Players", path: "/players" },
    { name: "Highlights", path: "/highlights" },
    { name: "News", path: "/cricket-news" },
    { name: "Videos", path: "/videos" },
    { name: "Rankings", path: "/rankings" },
    { name: "Standings", path: "/points-table" },
  ];

  return (
    <header className="bg-cric-card border-b border-cric-border sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-5 min-w-0">
          <Link to="/" className="text-2xl font-black font-raj italic text-cric-text tracking-tighter">
            BQ-PLAY
            <span className="text-cric-accent">.</span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-black text-cric-text uppercase tracking-tight">{user.name}</div>
                <div className="text-[9px] text-cric-muted font-bold uppercase tracking-widest">{user.role || 'user'}</div>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-cric-accent hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg"
              >Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={onShowLogin}
                className="text-cric-muted hover:text-cric-text text-[10px] font-black uppercase tracking-widest px-4 py-2 transition-colors"
              >Login</button>
              <button
                onClick={onShowRegister}
                className="px-6 py-2.5 bg-cric-accent hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95"
              >Join Now</button>
            </div>
          )}
        </div>

        <nav className="order-3 flex w-full items-center gap-5 overflow-x-auto pt-2 no-scrollbar lg:order-none lg:w-auto lg:pt-0">
          {navItems.map(item => (
            <Link
              key={item.name}
              to={item.path}
              className={`shrink-0 text-[10px] font-black uppercase tracking-widest transition-all ${location.pathname === item.path ? "text-white bg-cric-accent shadow-md" : "text-cric-muted hover:text-cric-text hover:bg-black/5 dark:hover:bg-white/5"
                } px-4 py-2 rounded-lg`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
