// src/pages/ManageScore.jsx
// Updated to work with URL params and direct match selection

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMatches } from "../store/slices/matchesSlice";
import MatchEditor from "../components/MatchEditor";

export default function ManageScore() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { matches } = useSelector((state) => state.matches);
  const [selectedMatch, setSelectedMatch] = useState(matchId || "");

  useEffect(() => {
    dispatch(fetchMatches());
  }, [dispatch]);

  useEffect(() => {
    if (matchId) {
      setSelectedMatch(matchId);
    }
  }, [matchId]);

  const handleMatchChange = (newMatchId) => {
    setSelectedMatch(newMatchId);
    if (newMatchId) {
      navigate(`/admin/score/${newMatchId}`);
    } else {
      navigate('/admin/score');
    }
  };

  const activeMatches = matches.filter((m) => 
    m.status === "live" || m.status === "upcoming" || m.status === "innings-break"
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Score Management</h2>
          <p className="text-sm text-slate-600 mt-1">
            Update live match scores and manage innings
          </p>
        </div>
      </div>

      <div className="card max-w-4xl mx-auto">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select Match to Score
        </label>
        <select
          value={selectedMatch}
          onChange={(e) => handleMatchChange(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-6"
        >
          <option value="">Choose a match to update...</option>
          {activeMatches.map((m) => (
            <option key={m._id} value={m._id}>
              {m.teams?.[0]?.name || "Team A"} vs {m.teams?.[1]?.name || "Team B"} 
              {" - "}
              {m.status === "live" && "● LIVE"}
              {m.status === "upcoming" && "Upcoming"}
              {m.status === "innings-break" && "Innings Break"}
              {" - "}
              {new Date(m.startAt).toLocaleDateString()}
            </option>
          ))}
        </select>

        {selectedMatch && <MatchEditor matchId={selectedMatch} />}

        {!selectedMatch && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-slate-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <p className="text-slate-500 mb-2">Select a match to start scoring</p>
            <p className="text-sm text-slate-400">
              Choose from {activeMatches.length} active match{activeMatches.length !== 1 ? 'es' : ''}
            </p>
          </div>
        )}

        {activeMatches.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-slate-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-slate-500 mb-2">No active matches available</p>
            <p className="text-sm text-slate-400">
              Create a new match or wait for scheduled matches to begin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}