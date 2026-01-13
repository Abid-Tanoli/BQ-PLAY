import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import { api, setAuthToken } from "./services/api";

import Login from "./pages/auth/Login";
import MatchEditor from "./components/MatchEditor";
import PlayerList from "./components/PlayerList";
import RankingList from "./components/RankingList";

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("bq_token");
    if (token) {
      setAuthToken(token);
      const raw = localStorage.getItem("bq_user");
      if (raw) setUser(JSON.parse(raw));
      loadMatches();
    }
  }, []);

  const loadMatches = async () => {
    try {
      const res = await api.get("/matches");
      setMatches(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("bq_token");
    localStorage.removeItem("bq_user");
    setAuthToken(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
  
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin / Scorer — BQ-PLAY</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </header>

      <nav className="flex gap-6 mb-6">
        <Link to="/" className="text-blue-400 hover:underline">
          Matches
        </Link>
        <Link to="/players" className="text-blue-400 hover:underline">
          Players
        </Link>
        <Link to="/ranking" className="text-blue-400 hover:underline">
          Rankings
        </Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <div className="space-y-4">
              {matches.map((m) => (
                <MatchEditor
                  key={m._id}
                  match={m}
                  onUpdated={loadMatches}
                />
              ))}
            </div>
          }
        />

        <Route path="/players" element={<PlayerList />} />
        <Route path="/ranking" element={<RankingList />} />
      </Routes>
    </div>
  );
}

export default function AdminApp() {
  const token = localStorage.getItem("bq_token");

  if (!token) {
    return (
      <Login
        onLogin={(token, user) => {
          localStorage.setItem("bq_token", token);
          localStorage.setItem("bq_user", JSON.stringify(user));
          setAuthToken(token);
          window.location.reload();
        }}
      />
    );
  }

  return (
    <Router>
      <AdminDashboard />
    </Router>
  );
}
