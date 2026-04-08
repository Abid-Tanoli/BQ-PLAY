import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import MatchEditor from "../components/MatchEditor";

export default function MatchScorecard() {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeInnings, setActiveInnings] = useState(0);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => { loadMatch(); }, [matchId]);

  const loadMatch = async () => {
    try {
      const res = await api.get(`/matches/${matchId}`);
      setMatch(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!match) return <div className="text-center py-20"><p>Match not found</p></div>;

  const team1 = match.teams?.[0] || {};
  const team2 = match.teams?.[1] || {};
  const inn1 = match.innings?.[0];
  const inn2 = match.innings?.[1];

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      {/* ESPN Header */}
      <div className="bg-[#031d44] text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-blue-300 mb-2">
            <Link to="/admin/live" className="hover:text-white">Live Scores</Link>
            <span>›</span>
            {match.tournament?.name && <Link to={`/admin/events/${match.tournament._id}`} className="hover:text-white">{match.tournament.name}</Link>}
            <span>›</span>
            <span className="text-white">{team1.shortName || team1.name} vs {team2.shortName || team2.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight">{team1.shortName || team1.name} vs {team2.shortName || team2.name}</h1>
              <p className="text-xs text-blue-200 mt-1">{match.matchType} • {match.matchNumber ? `Match ${match.matchNumber}` : ""} • {match.venue}</p>
            </div>
            <button onClick={() => setShowEditor(!showEditor)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors">
              {showEditor ? "✕ Close Editor" : "✎ Manage Match"}
            </button>
          </div>
        </div>
      </div>

      {showEditor && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <MatchEditor matchId={matchId} isEmbedded={true} />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Match Summary */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-black ${match.status === "completed" ? "text-green-700" : match.status === "live" ? "text-red-600" : "text-slate-500"}`}>
              {match.status === "completed" ? match.result?.description : match.status === "live" ? "Live" : "Upcoming"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {team1.logo && <img src={team1.logo} alt={team1.name} className="w-8 h-8 rounded-full object-cover" />}
                <span className="font-bold text-sm">{team1.shortName || team1.name}</span>
              </div>
              {inn1 && <span className="font-black text-lg">{inn1.runs}/{inn1.wickets}<span className="text-sm text-slate-500 font-bold ml-1">({inn1.overs}.{inn1.balls % 6} ov)</span></span>}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {team2.logo && <img src={team2.logo} alt={team2.name} className="w-8 h-8 rounded-full object-cover" />}
                <span className="font-bold text-sm">{team2.shortName || team2.name}</span>
              </div>
              {inn2 && <span className="font-black text-lg">{inn2.runs}/{inn2.wickets}<span className="text-sm text-slate-500 font-bold ml-1">({inn2.overs}.{inn2.balls % 6} ov)</span></span>}
            </div>
          </div>
        </div>

        {/* Innings Tabs */}
        {(inn1 || inn2) && (
          <div className="flex gap-2 mb-4">
            {inn1 && (
              <button onClick={() => setActiveInnings(0)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase ${activeInnings === 0 ? "bg-[#031d44] text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
                {team1.shortName || team1.name} Innings ({inn1.runs}/{inn1.wickets})
              </button>
            )}
            {inn2 && (
              <button onClick={() => setActiveInnings(1)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase ${activeInnings === 1 ? "bg-[#031d44] text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
                {team2.shortName || team2.name} Innings ({inn2.runs}/{inn2.wickets})
              </button>
            )}
          </div>
        )}

        {/* Scorecard */}
        {activeInnings === 0 && inn1 && <InningsScorecard innings={inn1} battingTeam={team1} bowlingTeam={team2} />}
        {activeInnings === 1 && inn2 && <InningsScorecard innings={inn2} battingTeam={team2} bowlingTeam={team1} />}
        {(!inn1 && !inn2) && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <span className="text-4xl block mb-3">🏏</span>
            <p className="text-slate-500 font-bold">Match has not started yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Innings Scorecard Component (ESPN Cricinfo style)
function InningsScorecard({ innings, battingTeam, bowlingTeam }) {
  const [view, setView] = useState("batting"); // batting, bowling, info

  // Determine players who batted
  const batted = innings.batting?.filter(b => b.runs !== undefined) || [];
  const allBattingIds = new Set(batted.map(b => b.player?._id || b.player));
  
  // Players who haven't batted yet (from team squad or playing XI)
  const notOutYet = []; // "Yet to bat"
  const didNotBat = []; // "Did not bat"

  if (innings.status === "completed" || innings.status === "completed") {
    // All players who didn't bat = "Did not bat"
    if (battingTeam.players) {
      battingTeam.players.forEach(p => {
        if (!allBattingIds.has(p._id)) didNotBat.push(p);
      });
    }
  } else {
    // "Yet to bat" for upcoming matches
    if (battingTeam.players) {
      battingTeam.players.forEach(p => {
        if (!allBattingIds.has(p._id)) notOutYet.push(p);
      });
    }
  }

  const fallOfWickets = innings.fallOfWickets || [];
  const extras = innings.extras || {};

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Innings Header */}
      <div className="bg-gradient-to-r from-[#031d44] to-[#0a2d5e] text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black uppercase">{battingTeam.shortName || battingTeam.name} Innings</h3>
            <p className="text-xs text-blue-200 mt-1">{innings.runs}/{innings.wickets} ({innings.overs}.{innings.balls % 6} ov) • Run Rate: {innings.overs > 0 ? ((innings.runs / innings.overs) * 6).toFixed(2) : "0.00"}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${innings.status === "completed" ? "bg-green-600" : innings.status === "live" ? "bg-red-600 animate-pulse" : "bg-blue-500"}`}>
            {innings.status?.toUpperCase() || "UPCOMING"}
          </span>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { key: "batting", label: "Batting" },
          { key: "bowling", label: "Bowling" },
          { key: "info", label: "Info" }
        ].map(t => (
          <button key={t.key} onClick={() => setView(t.key)} className={`px-6 py-3 text-xs font-bold uppercase tracking-wider ${view === t.key ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-800"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Batting Table */}
      {view === "batting" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold">
              <tr>
                <th className="px-3 py-2 text-left">Batter</th>
                <th className="px-3 py-2 text-center">R</th>
                <th className="px-3 py-2 text-center">B</th>
                <th className="px-3 py-2 text-center">4s</th>
                <th className="px-3 py-2 text-center">6s</th>
                <th className="px-3 py-2 text-center">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batted.map((b, idx) => {
                const player = b.player?.name || "Unknown";
                const dismissal = b.dismissalType || "";
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-3 py-2.5">
                      <div className="font-bold text-slate-800">{player}</div>
                      {dismissal && <div className="text-[10px] text-slate-500 mt-0.5">{dismissal}</div>}
                    </td>
                    <td className="px-3 py-2.5 text-center font-black text-slate-900">{b.runs}</td>
                    <td className="px-3 py-2.5 text-center text-slate-600">{b.balls}</td>
                    <td className="px-3 py-2.5 text-center text-slate-600">{b.fours}</td>
                    <td className="px-3 py-2.5 text-center text-slate-600">{b.sixes}</td>
                    <td className="px-3 py-2.5 text-center text-slate-600">{b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : "-"}</td>
                  </tr>
                );
              })}

              {/* Yet to bat / Did not bat */}
              {notOutYet.length > 0 && (
                <tr className="bg-slate-50">
                  <td className="px-3 py-2" colSpan="6">
                    <span className="text-xs font-bold text-slate-500 uppercase">Yet to bat:</span>{" "}
                    <span className="text-xs text-slate-600">{notOutYet.map(p => p.name).join(", ")}</span>
                  </td>
                </tr>
              )}
              {didNotBat.length > 0 && (
                <tr className="bg-slate-50">
                  <td className="px-3 py-2" colSpan="6">
                    <span className="text-xs font-bold text-slate-500 uppercase">Did not bat:</span>{" "}
                    <span className="text-xs text-slate-600">{didNotBat.map(p => p.name).join(", ")}</span>
                  </td>
                </tr>
              )}

              {/* Extras & Total */}
              <tr className="bg-slate-100">
                <td className="px-3 py-2 font-bold text-slate-800" colSpan="1">Extras</td>
                <td className="px-3 py-2 text-center font-black text-slate-900" colSpan="5">
                  {(extras.wides || 0) + (extras.noBalls || 0) + (extras.byes || 0) + (extras.legByes || 0) + (extras.penalties || 0)}
                  <span className="block text-[10px] text-slate-500 font-normal">
                    (b {(extras.byes || 0)} lb {(extras.legByes || 0)} w {(extras.wides || 0)} nb {(extras.noBalls || 0)} p {(extras.penalties || 0)})
                  </span>
                </td>
              </tr>
              <tr className="bg-[#031d44] text-white">
                <td className="px-3 py-2.5 font-black text-sm">Total</td>
                <td className="px-3 py-2.5 text-center font-black text-sm" colSpan="5">
                  {innings.runs}/{innings.wickets} ({innings.overs}.{innings.balls % 6} ov)
                </td>
              </tr>
            </tbody>
          </table>

          {/* Fall of Wickets */}
          {fallOfWickets.length > 0 && (
            <div className="border-t border-slate-200 p-3 bg-slate-50">
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Fall of wickets:</span>
              <p className="text-xs text-slate-700">
                {fallOfWickets.map((f, i) => (
                  <span key={i}>{f.wickets}/{f.runs} ({f.player?.name || "Player"}, {f.overs} ov){i < fallOfWickets.length - 1 ? " • " : ""}</span>
                ))}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bowling Table */}
      {view === "bowling" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold">
              <tr>
                <th className="px-3 py-2 text-left">Bowler</th>
                <th className="px-3 py-2 text-center">O</th>
                <th className="px-3 py-2 text-center">M</th>
                <th className="px-3 py-2 text-center">R</th>
                <th className="px-3 py-2 text-center">W</th>
                <th className="px-3 py-2 text-center">Econ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {innings.bowling?.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-bold text-slate-800">{b.player?.name || "Unknown"}</td>
                  <td className="px-3 py-2.5 text-center">{b.overs}.{b.balls % 6}</td>
                  <td className="px-3 py-2.5 text-center">{b.maidens}</td>
                  <td className="px-3 py-2.5 text-center">{b.runs}</td>
                  <td className="px-3 py-2.5 text-center font-black text-slate-900">{b.wickets}</td>
                  <td className="px-3 py-2.5 text-center">{b.overs > 0 ? (b.runs / b.overs).toFixed(2) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Tab */}
      {view === "info" && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Status</span>
              <span className="text-sm font-bold text-slate-800">{innings.status || "Upcoming"}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Run Rate</span>
              <span className="text-sm font-bold text-slate-800">{innings.overs > 0 ? ((innings.runs / innings.overs) * 6).toFixed(2) : "0.00"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
