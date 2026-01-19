import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import MatchList from "../components/MatchList";
import MatchView from "../components/MatchView";
import Login from "../components/Login";
import Register from "../components/Register";
import { fetchMatches } from "../store/slices/matchesSlice";
import { initAuthFromStorage, logout as doLogout, getStoredUser } from "../pages/auth/auth";

export function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const matches = useSelector((state) => Array.isArray(state.matches.list) ? state.matches.list : []);
  const matchesStatus = useSelector((state) => state.matches.status);
  const matchesError = useSelector((state) => state.matches.error);

  const [selected, setSelected] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const user = initAuthFromStorage && getStoredUser();
    setAuthUser(user);
    dispatch(fetchMatches());
  }, [dispatch]);

  useEffect(() => {
    if (!selected && matches.length) setSelected(matches[0]);
  }, [matches, selected]);

  const handleLoginSuccess = (user) => { setAuthUser(user); setShowLogin(false); dispatch(fetchMatches()); };
  const handleRegisterSuccess = (user) => { setAuthUser(user); setShowRegister(false); dispatch(fetchMatches()); };
  const handleLogout = () => { doLogout(); setAuthUser(null); dispatch(fetchMatches()); };
  const handleMatchSelect = (match) => { setSelected(match); navigate(`/match/${match._id}`); };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Header
        user={authUser}
        onShowLogin={() => { setShowLogin(true); setShowRegister(false); }}
        onShowRegister={() => { setShowRegister(true); setShowLogin(false); }}
        onLogout={handleLogout}
      />

      <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 bg-white shadow-md rounded-xl p-4 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Matches</h2>

          {matchesStatus === "loading" && <p className="text-gray-500">Loading matches...</p>}
          {matchesError && <p className="text-red-500">{matchesError}</p>}

          <MatchList matches={matches} selected={selected} onSelect={handleMatchSelect} />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-[500px] bg-white shadow-md rounded-xl p-6 border border-gray-200">
          {showLogin && <Login onSuccess={handleLoginSuccess} onCancel={() => setShowLogin(false)} />}
          {showRegister && <Register onSuccess={handleRegisterSuccess} onCancel={() => setShowRegister(false)} />}
          {!showLogin && !showRegister && selected && <MatchView matchId={selected._id} />}
          {!showLogin && !showRegister && !selected && (
            <div className="text-center text-gray-400 mt-20">No match selected. Please select a match.</div>
          )}
        </main>
      </div>
    </div>
  );
}
