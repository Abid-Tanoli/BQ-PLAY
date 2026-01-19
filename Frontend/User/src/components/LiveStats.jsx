import React, { useEffect, useState } from "react";
import { api } from "../services/api";

/**
 * LiveStats - shows high level stats: top scorers, top bowlers, partnerships etc.
 * This component expects an endpoint like GET /matches/:id/stats. If not present,
 * it will display placeholders and basic computed values from match data.
 */
export default function LiveStats({ matchId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get(`/matches/${matchId}/stats`);
        if (mounted) setStats(res.data);
      } catch (err) {
        // If endpoint doesn't exist, try to fetch match and compute minimal stats
        try {
          const res2 = await api.get(`/matches/${matchId}`);
          if (mounted) {
            const m = res2.data || {};
            // Minimal computed stats fallback:
            setStats({
              topScorers: (m.innings || []).flatMap((inn) => inn.batting || []).slice(0, 3),
              topBowlers: (m.innings || []).flatMap((inn) => inn.bowling || []).slice(0, 3),
            });
          }
        } catch (err2) {
          console.error(err2);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [matchId]);

  if (loading) return <div className="p-4 text-gray-300">Loading stats...</div>;

  if (!stats) return <div className="p-4 text-gray-300">No stats available.</div>;

  return (
    <div className="space-y-4">
      <div className="bg-white/5 p-4 rounded-md border border-gray-700">
        <h3 className="font-semibold mb-2">Top Scorers</h3>
        {Array.isArray(stats.topScorers) && stats.topScorers.length > 0 ? (
          <ol className="list-decimal ml-5 text-sm">
            {stats.topScorers.map((p, i) => (
              <li key={i}>
                {p.name} — {p.runs ?? 0} ({p.balls ?? "-"})
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-300">No batting stats</p>
        )}
      </div>

      <div className="bg-white/5 p-4 rounded-md border border-gray-700">
        <h3 className="font-semibold mb-2">Top Bowlers</h3>
        {Array.isArray(stats.topBowlers) && stats.topBowlers.length > 0 ? (
          <ol className="list-decimal ml-5 text-sm">
            {stats.topBowlers.map((b, i) => (
              <li key={i}>
                {b.name} — {b.wickets ?? 0} / {b.runs ?? 0} ({b.overs ?? "-"})
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-300">No bowling stats</p>
        )}
      </div>
    </div>
  );
}