import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../services/api";

import MatchEditor from "../components/MatchEditor";
import PlayerList from "../components/PlayerList";
import RankingList from "../components/RankingList";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("bq_token");
    if (!token) {
      navigate("/login");
      return;
    }

    setAuthToken(token);

    const raw = localStorage.getItem("bq_user");
    if (raw) setUser(JSON.parse(raw));

    loadMatches();
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
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Admin / Scorer — BQ-PLAY
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </header>

      <nav className="flex gap-6 mb-6">
        <Link to="" className="text-blue-400 hover:underline">
          Matches
        </Link>
        <Link to="players" className="text-blue-400 hover:underline">
          Players
        </Link>
        <Link to="ranking" className="text-blue-400 hover:underline">
          Rankings
        </Link>
      </nav>

      <Routes>
        <Route
          index
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

        <Route path="players" element={<PlayerList />} />
        <Route path="ranking" element={<RankingList />} />
      </Routes>
    </div>
  );
}
