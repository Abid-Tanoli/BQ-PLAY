import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMatches } from "../store/slices/matchesSlice";
import MatchEditor from "../components/MatchEditor";

export default function ManageScore() {
  const dispatch = useDispatch();
  const { matches } = useSelector((state) => state.matches);
  const [selectedMatch, setSelectedMatch] = useState("");

  useEffect(() => {
    dispatch(fetchMatches());
  }, [dispatch]);

  const activeMatches = matches.filter((m) => m.status === "live" || m.status === "upcoming");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Manage Score</h2>

      <div className="card max-w-2xl">
        <label className="block text-sm font-medium text-slate-700 mb-2">Select Match</label>
        <select
          value={selectedMatch}
          onChange={(e) => setSelectedMatch(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-4"
        >
          <option value="">Choose a match to update...</option>
          {activeMatches.map((m) => (
            <option key={m._id} value={m._id}>
              {m.teams?.[0]?.name || "Team A"} vs {m.teams?.[1]?.name || "Team B"} - {m.status}
            </option>
          ))}
        </select>

        {selectedMatch && <MatchEditor matchId={selectedMatch} />}

        {!selectedMatch && (
          <div className="text-center py-12 text-slate-500">
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
            Select a match to start updating scores
          </div>
        )}
      </div>
    </div>
  );
}