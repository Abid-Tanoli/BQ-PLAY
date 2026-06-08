import React, { useEffect, useState } from "react";
import { api } from "../services/api";

export default function LiveStats({ matchId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get(`/matches/${matchId}/live-stats`);
        if (mounted) setStats(res.data);
      } catch (err) {
        try {
          const fallback = await api.get(`/matches/${matchId}`);
          const match = fallback.data || {};
          const topScorers = (match.innings || [])
            .flatMap((inn) => inn.batting || [])
            .map((row) => ({
              name: row.player?.name || "Unknown",
              runs: row.runs || 0,
              balls: row.balls || 0,
              fours: row.fours || 0,
              sixes: row.sixes || 0,
              sr: row.strikeRate || (row.balls ? (((row.runs || 0) / row.balls) * 100).toFixed(2) : "0.00"),
            }))
            .sort((a, b) => b.runs - a.runs)
            .slice(0, 10);
          const topBowlers = (match.innings || [])
            .flatMap((inn) => inn.bowling || [])
            .map((row) => ({
              name: row.player?.name || "Unknown",
              overs: row.balls ? `${Math.floor(row.balls / 6)}.${row.balls % 6}` : `${row.overs || 0}.0`,
              maidens: row.maidens || 0,
              runs: row.runs || 0,
              wickets: row.wickets || 0,
              dotBalls: row.dotBalls || row.dots || 0,
              econ: row.economy || "0.00",
            }))
            .sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)
            .slice(0, 10);
          if (mounted) setStats({ topScorers, topBowlers });
        } catch (fallbackErr) {
          console.error(fallbackErr);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (matchId) load();
    return () => {
      mounted = false;
    };
  }, [matchId]);

  if (loading) {
    return <div className="rounded-xl bg-white p-6 text-center text-sm font-semibold text-slate-500 ring-1 ring-slate-200">Loading stats...</div>;
  }

  if (!stats) {
    return <div className="rounded-xl bg-white p-6 text-center text-sm font-semibold text-slate-500 ring-1 ring-slate-200">No stats available.</div>;
  }

  return (
    <div className="space-y-5">
      <StatsTable
        title="Top Scorers"
        empty="No batting stats"
        columns={["Player", "R", "B", "4s", "6s", "SR"]}
        rows={(stats.topScorers || []).map((row) => [row.name, row.runs, row.balls, row.fours, row.sixes, row.sr])}
      />
      <StatsTable
        title="Top Bowlers"
        empty="No bowling stats"
        columns={["Bowler", "O", "M", "DOT", "R", "W", "Econ"]}
        rows={(stats.topBowlers || []).map((row) => [row.name, row.overs, row.maidens, row.dotBalls, row.runs, row.wickets, row.econ])}
      />
    </div>
  );
}

function StatsTable({ title, columns, rows, empty }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-500">
            <tr>
              {columns.map((column, index) => (
                <th key={column} className={`px-4 py-3 ${index > 0 ? "text-right" : ""}`}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length ? rows.map((row, index) => (
              <tr key={`${row[0]}-${index}`}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className={`px-4 py-3 ${cellIndex === 0 ? "font-black text-slate-900" : "text-right tabular-nums text-slate-700"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm font-semibold text-slate-500">{empty}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
