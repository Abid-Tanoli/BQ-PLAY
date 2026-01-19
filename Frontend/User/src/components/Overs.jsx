import React, { useEffect, useState } from "react";
import { api } from "../services/api";

/**
 * Overs - shows recent overs / over-by-over summary.
 * Expects match.innings[].overs or match.commentary grouped by over if available.
 */
export default function Overs({ matchId }) {
  const [oversData, setOversData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get(`/matches/${matchId}`);
        if (!mounted) return;
        const m = res.data || {};
        // Try different places for over info
        if (m.innings && m.innings.length) {
          const byInnings = m.innings.map((inn, idx) => ({
            team: inn.teamName || `Innings ${idx + 1}`,
            overs: inn.oversList || inn.oversSummary || [],
          }));
          setOversData(byInnings);
        } else {
          setOversData([]);
        }
      } catch (err) {
        console.error("Failed to load overs:", err);
        setOversData([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [matchId]);

  if (loading) return <div className="p-4 text-gray-300">Loading overs...</div>;

  if (!oversData || oversData.length === 0) {
    return <div className="p-4 text-gray-300">Overs/over-by-over data not available.</div>;
  }

  return (
    <div className="space-y-4">
      {oversData.map((inn, i) => (
        <div key={i} className="bg-white/5 p-4 rounded-md border border-gray-700">
          <h4 className="font-semibold mb-2">{inn.team}</h4>
          {Array.isArray(inn.overs) && inn.overs.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              {inn.overs.map((o, idx) => (
                <div key={idx} className="p-2 bg-gray-800 rounded">
                  <div className="font-medium">Over {o.overNumber ?? idx + 1}</div>
                  <div className="text-gray-300">{o.summary ?? o.runs + " / " + (o.wickets ?? 0)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-300">No over summaries available.</p>
          )}
        </div>
      ))}
    </div>
  );
}