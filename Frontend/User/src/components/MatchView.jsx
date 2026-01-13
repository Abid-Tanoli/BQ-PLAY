import React, { useEffect, useState } from "react";
import { api } from "../services/api";

export default function MatchView({ matchId }) {
  const [match, setMatch] = useState(null);

  useEffect(() => {
    if (!matchId) return;

    const fetchMatch = async () => {
      try {
        const res = await api.get(`/matches/${matchId}`);
        setMatch(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMatch();
  }, [matchId]);

  if (!match) return <div>Loading match...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold">{match.name}</h2>
      <p>Date: {match.date || "TBA"}</p>
      <p>Venue: {match.venue || "TBA"}</p>
      {/* Add more match details here */}
    </div>
  );
}
