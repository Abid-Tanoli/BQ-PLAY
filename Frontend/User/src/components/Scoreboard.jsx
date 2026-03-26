import React, { useEffect, useState } from "react";
import { api } from "../services/api";

/**
 * SummaryScoreboard - a small component to show team total summary.
 */
function SummaryScoreboard({ matchId }) {
  const [match, setMatch] = useState(null);

  useEffect(() => {
    api.get(`/matches/${matchId}`).then(res => setMatch(res.data)).catch(console.error);
  }, [matchId]);

  if (!match) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      {match.innings?.map((inn, i) => (
        <div key={i} className="p-3 bg-white/10 rounded-lg">
          <p className="text-[10px] font-black uppercase text-blue-300 tracking-widest mb-1">
             {match.teams[i]?.name}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black">{inn.runs}/{inn.wickets}</span>
            <span className="text-[10px] font-bold text-slate-400">({inn.overs}.{inn.balls % 6})</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * MatchScorecard - detailed score view combining scoreboard summary + innings breakdown.
 */
export default function MatchScorecard({ matchId }) {
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

  // Helper to group batting stats by player to handle duplicates
  const groupBattingStats = (battingArray) => {
    if (!Array.isArray(battingArray)) return [];
    const grouped = {};
    battingArray.forEach(b => {
      const pId = (b.player?._id || b.player)?.toString();
      if (!pId) return;
      if (!grouped[pId]) {
        grouped[pId] = { ...b, runs: 0, balls: 0, fours: 0, sixes: 0 };
      }
      grouped[pId].runs += (b.runs || 0);
      grouped[pId].balls += (b.balls || 0);
      grouped[pId].fours += (b.fours || 0);
      grouped[pId].sixes += (b.sixes || 0);
      grouped[pId].isOut = grouped[pId].isOut || b.isOut;
      grouped[pId].wicketType = grouped[pId].wicketType || b.wicketType;
    });
    return Object.values(grouped).map(b => ({
      ...b,
      strikeRate: b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(2) : '0.00'
    }));
  };

  const innings = match?.innings || [];

  return (
    <div className="space-y-6">
      <div className="bg-[#031d44] text-white p-6 rounded-2xl shadow-xl border border-white/10">
        <h2 className="text-xs font-black uppercase tracking-widest text-blue-300 mb-4 italic">Match Summary</h2>
        <SummaryScoreboard matchId={matchId} />
      </div>

      {innings.length === 0 ? (
        <div className="bg-white/5 p-8 rounded-2xl border border-dashed border-gray-700 text-center">
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No innings data recorded yet</p>
        </div>
      ) : (
        innings.map((inn, idx) => {
          const displayBatting = groupBattingStats(inn.batting);
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                <h3 className="font-black text-[#031d44] uppercase tracking-tighter italic text-xl">
                   {match.teams.find(t => (t._id || t) === (inn.team?._id || inn.team))?.name || `Innings ${idx + 1}`}
                </h3>
                <div className="px-4 py-1 bg-slate-50 rounded-full text-sm font-black text-[#031d44]">
                  {inn.runs ?? 0}/{inn.wickets ?? 0} <span className="text-slate-400 font-bold text-[10px] ml-1">({inn.overs ?? 0}.{(inn.balls || 0) % 6})</span>
                </div>
              </div>

              {/* detailed batting list */}
              {displayBatting.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                      <th className="py-2">Batter</th>
                      <th className="py-2 text-center">R</th>
                      <th className="py-2 text-center">B</th>
                      <th className="py-2 text-center">4s</th>
                      <th className="py-2 text-center">6s</th>
                      <th className="py-2 text-right">SR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {displayBatting.map((b, i) => (
                      <tr key={i} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-3 font-bold text-slate-800 uppercase tracking-tight italic">
                           {b.player?.name || b.name}
                           {b.isOut ? <span className="text-[9px] font-black text-slate-300 uppercase block mt-0.5 tracking-tighter not-italic">{b.wicketType || "out"}</span> : <span className="text-[9px] font-black text-green-600 uppercase block mt-0.5 tracking-tighter not-italic">not out</span>}
                        </td>
                        <td className="py-3 text-center font-black text-[#031d44]">{b.runs}</td>
                        <td className="py-3 text-center font-bold text-slate-400">{b.balls}</td>
                        <td className="py-3 text-center text-slate-400">{b.fours}</td>
                        <td className="py-3 text-center text-slate-400">{b.sixes}</td>
                        <td className="py-3 text-right font-bold text-slate-400 text-[11px]">{b.strikeRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-300 py-8 text-center uppercase tracking-widest text-[10px] font-black">Waiting for batting details...</p>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}