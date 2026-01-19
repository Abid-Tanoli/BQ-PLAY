import React, { useEffect, useState } from "react";
import { api } from "../services/api";

/**
 * PlayingXI - shows playing eleven for each team.
 * If compact prop is true, renders compact list (used in Live sidebar).
 */
export default function PlayingXI({ matchId, compact = false }) {
  const [playing, setPlaying] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get(`/matches/${matchId}`);
        if (!mounted) return;
        const m = res.data || {};
        // Expect m.teams or m.playingXI
        // Try multiple shapes
        const teams = m.teams || m.teamsInfo || [];
        if (teams && teams.length) {
          setPlaying(
            teams.map((t) => ({
              name: t.name,
              players: t.playingXI || t.players || [],
            }))
          );
        } else if (m.playingXI) {
          setPlaying(m.playingXI);
        } else {
          setPlaying([]);
        }
      } catch (err) {
        console.error("Failed to load playing XI:", err);
        setPlaying([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [matchId]);

  if (loading) return <div className={compact ? "text-gray-300 text-sm" : "p-4 text-gray-300"}>Loading playing XI...</div>;

  if (!playing || playing.length === 0) {
    return <div className={compact ? "text-gray-300 text-sm" : "p-4 text-gray-300"}>Playing XI not available.</div>;
  }

  return (
    <div className={compact ? "space-y-2 text-sm" : "space-y-4"}>
      {playing.map((team, idx) => (
        <div key={idx} className={compact ? "" : "bg-white/5 p-4 rounded-md border border-gray-700"}>
          <h4 className={`font-semibold ${compact ? "mb-1" : "mb-2"}`}>{team.name}</h4>
          {Array.isArray(team.players) && team.players.length > 0 ? (
            <ol className={compact ? "list-decimal ml-5" : "list-decimal ml-5"}>
              {team.players.map((p, i) => (
                <li key={i} className="text-sm">
                  {typeof p === "string" ? p : p.name || `${p.firstName || ""} ${p.lastName || ""}`}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-gray-300 text-sm">No players listed</p>
          )}
        </div>
      ))}
    </div>
  );
}