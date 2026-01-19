import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import Scoreboard from "./Scoreboard";

/**
 * Scorecard - detailed score view combining scoreboard + innings breakdown.
 * If your backend provides more detailed innings info (batting lists, extras)
 * they will be displayed here. Otherwise this shows a structured fallback.
 */
export default function Scorecard({ matchId }) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get(`/matches/${matchId}`);
        if (mounted) setMatch(res.data);
      } catch (err) {
        console.error("Failed to load match for scorecard:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [matchId]);

  if (loading) {
    return <div className="p-4 text-gray-300">Loading scorecard...</div>;
  }

  const innings = match?.innings || [];

  return (
    <div className="space-y-4">
      <div className="bg-white/5 p-4 rounded-md border border-gray-700">
        <h2 className="text-xl font-bold mb-3">Scorecard</h2>
        <Scoreboard matchId={matchId} />
      </div>

      {innings.length === 0 ? (
        <div className="bg-white/5 p-4 rounded-md border border-gray-700">
          <p className="text-gray-300">No innings data available.</p>
        </div>
      ) : (
        innings.map((inn, idx) => (
          <div key={idx} className="bg-white/5 p-4 rounded-md border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">{inn.teamName || `Innings ${idx + 1}`}</h3>
              <div className="text-sm text-gray-300">
                {inn.runs ?? 0}/{inn.wickets ?? 0} ({inn.overs ?? 0}.{inn.balls ?? 0})
              </div>
            </div>

            {/* simple batting list if available */}
            {Array.isArray(inn.batting) && inn.batting.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="text-left text-gray-400">
                  <tr>
                    <th>Player</th>
                    <th>R</th>
                    <th>B</th>
                    <th>4s</th>
                    <th>6s</th>
                    <th>SR</th>
                  </tr>
                </thead>
                <tbody>
                  {inn.batting.map((b, i) => (
                    <tr key={i} className="border-t border-gray-700">
                      <td>{b.name}</td>
                      <td>{b.runs}</td>
                      <td>{b.balls}</td>
                      <td>{b.fours}</td>
                      <td>{b.sixes}</td>
                      <td>{b.strikeRate ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-300">Batting details not available.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}