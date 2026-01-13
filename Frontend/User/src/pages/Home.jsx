import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import { api } from "./api";
import {
  initAuthFromStorage,
  logout as doLogout,
  getStoredUser,
} from "./auth";

import Header from "./components/Header";
import MatchList from "./components/MatchList";
import MatchView from "./components/MatchView";
import Login from "./components/Login";
import Register from "./components/Register";

import Players from "./pages/Players";

export function Home() {
  const [matches, setMatches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const user = initAuthFromStorage && getStoredUser();
    setAuthUser(user);
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const res = await api.get("/matches");
      setMatches(res.data);
      if (!selected && res.data.length) {
        setSelected(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSuccess = (user) => {
    setAuthUser(user);
    setShowLogin(false);
    loadMatches();
  };

  const handleRegisterSuccess = (user) => {
    setAuthUser(user);
    setShowRegister(false);
    loadMatches();
  };

  const handleLogout = () => {
    doLogout();
    setAuthUser(null);
    loadMatches();
  };

  const handleMatchSelect = (match) => {
    setSelected(match);
    navigate(`/match/${match._id}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header
        user={authUser}
        onShowLogin={() => {
          setShowLogin(true);
          setShowRegister(false);
        }}
        onShowRegister={() => {
          setShowRegister(true);
          setShowLogin(false);
        }}
        onLogout={handleLogout}
      />

      <div className="flex gap-6 p-6">
        {/* Sidebar */}
        <aside className="w-72 bg-slate-900 rounded-xl p-4">
          <MatchList
            matches={matches}
            selected={selected}
            onSelect={handleMatchSelect}
          />
        </aside>

        {/* Main */}
        <main className="flex-1 min-h-[500px] bg-slate-900/40 rounded-xl p-6">
          {showLogin && (
            <Login
              onSuccess={handleLoginSuccess}
              onCancel={() => setShowLogin(false)}
            />
          )}

          {showRegister && (
            <Register
              onSuccess={handleRegisterSuccess}
              onCancel={() => setShowRegister(false)}
            />
          )}

          {!showLogin && !showRegister && selected && (
            <MatchView matchId={selected._id} />
          )}
        </main>
      </div>
    </div>
  );
}

export function MatchPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <MatchView />
    </div>
  );
}
