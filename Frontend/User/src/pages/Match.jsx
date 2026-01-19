import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import MatchTabs from "../components/MatchTabs";

/**
 * Match page - loads match metadata and renders MatchTabs which contains the navbar
 * and per-tab content (Live, Scorecard, Commentary, Live Stats, Overs, Playing XI, Table).
 */
const Match = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get(`/matches/${id}`);
        if (mounted) setMatch(res.data);
      } catch (err) {
        console.error("Failed to load match:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white p-6">
        <div className="max-w-5xl mx-auto">Loading match...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white p-6">
      <div className="max-w-5xl mx-auto bg-gray-800/90 rounded-xl shadow-lg p-4">
        {/* Basic match header */}
        <div className="px-4 py-3 border-b border-gray-700">
          <h1 className="text-2xl font-bold">
            {match?.name || "Match"}
          </h1>
          <div className="text-sm text-gray-400">
            {match?.venue ? `${match.venue} • ` : ""}
            {match?.date ? new Date(match.date).toLocaleString() : ""}
            {match?.status ? ` • ${match.status}` : ""}
          </div>
        </div>

        {/* Tabs and content */}
        <MatchTabs matchId={id} match={match} />
      </div>
    </div>
  );
};

export default Match;