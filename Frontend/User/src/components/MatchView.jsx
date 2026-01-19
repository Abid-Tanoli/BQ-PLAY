import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import Scoreboard from "./Scoreboard";
import Commentary from "./Commentary";

export default function MatchView({ matchId }) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!matchId) return;

    const fetchMatch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/matches/${matchId}`);
        setMatch(res.data);
      } catch (err) {
        setError("Failed to load match");
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  if (loading) return <p className="text-gray-500">Loading match details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!match) return <p className="text-gray-400">Match not found</p>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
        <h2 className="text-2xl font-bold mb-2">{match.name}</h2>
        <p className="text-gray-600">Date: {match.date || "TBA"}</p>
        <p className="text-gray-600">Venue: {match.venue || "TBA"}</p>
        <p className="text-gray-600">Status: {match.status || "TBA"}</p>
      </div>

      <Scoreboard matchId={matchId} />
      <Commentary matchId={matchId} />
    </div>
  );
}
