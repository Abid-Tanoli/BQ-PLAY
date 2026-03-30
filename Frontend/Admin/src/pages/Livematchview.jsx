// src/pages/LiveMatchView.jsx
// Complete implementation with all tabs

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSocket } from "../store/socket";
import api from "../services/api";
import MatchEditor from "../components/MatchEditor";
import InningsDashboard from "../components/InningsDashboard";
import OverTimeline from "../components/OverTimeline";

// Error Boundary to catch component errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component Error:", error);
    console.error("Error Info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-800 font-bold mb-2">Component Error</h2>
          <p className="text-red-700 text-sm mb-3">{this.state.error?.message}</p>
          <details className="text-xs text-red-600">
            <summary>Stack Trace</summary>
            <pre className="mt-2 p-2 bg-white rounded overflow-auto">{this.state.error?.toString()}</pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function LiveMatchView() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("live");
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMatch();

    const socket = getSocket();
    if (socket && matchId) {
      socket.emit("join-match", matchId);

      socket.on("match:scoreUpdate", () => loadMatch());
      socket.on("match:ballUpdate", () => loadMatch());
      socket.on("match:updated", () => loadMatch());

      return () => {
        socket.emit("leave-match", matchId);
        socket.off("match:scoreUpdate");
        socket.off("match:ballUpdate");
        socket.off("match:updated");
      };
    }
  }, [matchId]);

  const loadMatch = async () => {
    try {
      console.log("Loading match:", matchId);
      setError(null);
      const res = await api.get(`/matches/${matchId}`);
      console.log("Match loaded:", res.data);
      setMatch(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load match:", err);
      console.error("Error details:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || err.message || "Unknown error occurred";
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleResolveTie = async (resolution) => {
    try {
      await api.post(`/matches/${matchId}/resolve-tie`, { resolution });
      loadMatch();
    } catch (err) {
      console.error(err);
      alert("Failed to resolve tie");
    }
  };

  const handleStartSuperOver = async (selectionData) => {
    try {
      await api.post(`/matches/${matchId}/start-super-over`, selectionData);
      loadMatch();
    } catch (err) {
      console.error(err);
      alert("Failed to start Super Over");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-red-900 font-black text-xl mb-2">❌ Failed to Load Match</h2>
          <p className="text-red-800 mb-4">{error}</p>
          <p className="text-red-700 text-sm mb-4">Match ID: {matchId}</p>
          <div className="flex gap-2">
            <button onClick={() => loadMatch()} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Retry
            </button>
            <button onClick={() => navigate("/admin")} className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Match not found</p>
        <button onClick={() => navigate("/admin")} className="mt-4 text-blue-600 hover:underline">
          Go back to dashboard
        </button>
      </div>
    );
  }

  const currentInnings = match.innings?.[match.currentInnings] || match.innings?.[0];
  const team1 = match.teams?.[0];
  const team2 = match.teams?.[1];
  const innings1 = match.innings?.[0];
  const innings2 = match.innings?.[1];

  const tabs = [
    { id: "live", label: "Live" },
    { id: "scorecard", label: "Scorecard" },
    { id: "commentary", label: "Commentary" },
    { id: "stats", label: "Live Stats" },
    { id: "overs", label: "Overs" },
    { id: "playingxi", label: "Playing XI" },
    { id: "manage", label: "Manage Score" },
  ];

  if (match.tournament) {
    tabs.push({ id: "table", label: "Table" });
    tabs.push({ id: "fixtures", label: "Fixtures" });
  }
  tabs.push({ id: "rankings", label: "Rankings" });

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto pb-8 bg-slate-50 min-h-screen">
      {/* Match Meta Header - ESPNCricinfo Style */}
      <div className="bg-[#031d44] text-white py-2 px-4 text-xs font-medium flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-blue-300 uppercase tracking-widest">{match.tournament?.name || "International Match"}</span>
          <span className="text-slate-400">•</span>
          <span>{match.matchType}</span>
          <span className="text-slate-400">•</span>
          <span>{match.venue}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">Match ID: {matchId.slice(-6)}</span>
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-1 hover:text-blue-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ADMIN DASHBOARD
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md border-b sticky top-0 z-20">
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-7xl mx-auto">
          {/* Main Score Area */}
          <div className="flex items-center gap-8 flex-1">
            {/* Team 1 */}
            <div className={`flex items-center gap-4 transition-all ${innings1?.status === "live" ? "scale-105" : "opacity-80"}`}>
              <div className="w-16 h-16 bg-slate-50 rounded-full border-2 border-slate-100 flex items-center justify-center p-2">
                {team1?.logo ? (
                  <img src={team1.logo} alt={team1.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl uppercase">
                    {team1?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{team1?.shortName || team1?.name}</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#031d44]">{innings1?.runs || 0}/{innings1?.wickets || 0}</span>
                  <span className="text-sm text-slate-500 font-medium">({innings1?.overs || 0}.{innings1?.balls % 6 || 0})</span>
                </div>
              </div>
            </div>

            <div className="h-12 w-px bg-slate-200 hidden md:block" />

            {/* Team 2 */}
            <div className={`flex items-center gap-4 transition-all ${innings2?.status === "live" ? "scale-105" : "opacity-80"}`}>
              <div className="w-16 h-16 bg-slate-50 rounded-full border-2 border-slate-100 flex items-center justify-center p-2">
                {team2?.logo ? (
                  <img src={team2.logo} alt={team2.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl uppercase">
                    {team2?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{team2?.shortName || team2?.name}</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#031d44]">{innings2?.runs || 0}/{innings2?.wickets || 0}</span>
                  <span className="text-sm text-slate-500 font-medium">({innings2?.overs || 0}.{innings2?.balls % 6 || 0})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Match Status Badge & Info */}
          <div className="flex flex-col items-end gap-2">
            <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest shadow-sm ${match.status === "live" ? "bg-red-600 text-white animate-pulse" :
              match.status === "pending_tie_resolution" ? "bg-orange-500 text-white" :
                match.status === "completed" ? "bg-[#031d44] text-white" : "bg-blue-600 text-white"
              }`}>
              {match.status.replace(/_/g, " ").toUpperCase()}
            </span>
            {match.result?.description ? (
              <p className="text-sm font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded border border-blue-100 italic">
                {match.result.description}
              </p>
            ) : innings2?.target > 0 && match.status === "live" ? (
              <p className="text-sm font-bold text-blue-800">
                {team2?.name} needs {innings2.target - innings2.runs} runs in {(match.totalOvers * 6 - innings2.balls)} balls
              </p>
            ) : null}
          </div>
        </div>

        {/* Tab Bar - ESPNCricinfo Style */}
        <div className="bg-white px-4 max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar border-t">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 font-bold text-xs uppercase tracking-wider transition-all relative ${activeTab === tab.id
                ? "text-blue-600"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "live" && <LiveTab match={match} currentInnings={currentInnings} matchId={matchId} />}
            {activeTab === "scorecard" && <ScorecardTab match={match} />}
            {activeTab === "commentary" && <CommentaryTab match={match} currentInnings={currentInnings} />}
            {activeTab === "stats" && <StatsTab match={match} />}
            {activeTab === "overs" && <OversTab match={match} currentInnings={currentInnings} />}
            {activeTab === "playingxi" && <PlayingXITab match={match} />}
            {activeTab === "manage" && <div className="card shadow-xl"><MatchEditor matchId={matchId} isEmbedded={true} /></div>}
            {activeTab === "table" && match.tournament && <TableTab tournamentId={match.tournament._id || match.tournament} />}
            {activeTab === "fixtures" && match.tournament && <FixturesTab tournamentId={match.tournament._id || match.tournament} />}
            {activeTab === "rankings" && match.tournament && <RankingsTab tournamentId={match.tournament?._id || match.tournament} />}
          </div>

          {/* Match Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <MatchInfoSidebar match={match} />
          </div>
        </div>

        {/* Blog & News Gallery Section */}
        <BlogGallery category="Match" relatedId={matchId} />
      </div>
      </div>
    </ErrorBoundary>
  );
}

// Live Tab Component
function LiveTab({ match, currentInnings, matchId }) {
  if (!currentInnings) {
    return <div className="text-center py-8 text-slate-500">No live innings data</div>;
  }

  const currentOver = currentInnings.oversHistory?.[currentInnings.oversHistory.length - 1];
  const recentBalls = currentOver?.balls?.slice(-6) || [];

  // Calculate partnership
  const currentPartnershipRuns = currentInnings.batting?.filter(b => !b.isOut).reduce((sum, b) => sum + b.runs, 0) || 0;
  const currentPartnershipBalls = currentInnings.batting?.filter(b => !b.isOut).reduce((sum, b) => sum + b.balls, 0) || 0;
  const lastFow = currentInnings.fallOfWickets?.[currentInnings.fallOfWickets.length - 1];

  const getBallText = (ball) => {
    if (ball.isWicket) return "W";
    if (ball.isWide) return `${1 + ball.runs}w`;
    if (ball.isNoBall) return `${1 + ball.runs}nb`;
    if (ball.isBye) return `${ball.runs}b`;
    if (ball.isLegBye) return `${ball.runs}lb`;
    return ball.runs === 0 ? "•" : ball.runs.toString();
  };

  return (
    <div className="space-y-6">
      <div className="card shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center justify-between">
          <h3 className="text-sm font-black text-blue-900 uppercase tracking-tighter italic">Live Match Control</h3>
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">Admin Access</span>
        </div>
        <MatchEditor matchId={matchId} isEmbedded={true} />
      </div>
      <InningsDashboard innings={currentInnings} match={match} />
      <OverTimeline innings={currentInnings} />
    </div>
  );
}

// Scorecard Tab Component
function ScorecardTab({ match }) {
  return (
    <div className="space-y-6">
      {match.innings?.map((innings, idx) => (
        <div key={idx} className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {innings.team?.name} Innings
            </h3>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {innings.runs}/{innings.wickets}
              </p>
              <p className="text-sm text-slate-500">
                ({innings.overs}.{innings.balls} overs)
              </p>
            </div>
          </div>

          {/* Batting */}
          <h4 className="font-semibold mb-3">Batting</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2 text-left">Batsman</th>
                  <th className="p-2 text-center">R</th>
                  <th className="p-2 text-center">B</th>
                  <th className="p-2 text-center">4s</th>
                  <th className="p-2 text-center">6s</th>
                  <th className="p-2 text-center">SR</th>
                </tr>
              </thead>
              <tbody>
                {innings.batting?.map((batsman, bIdx) => (
                  <tr key={bIdx} className="border-t">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{batsman.player?.name}</p>
                        {batsman.isOut && (
                          <p className="text-xs text-slate-500">
                            {batsman.dismissalType}
                            {batsman.dismissedBy?.name && ` b ${batsman.dismissedBy.name}`}
                            {batsman.fielder?.name && ` c ${batsman.fielder.name}`}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-2 text-center font-semibold">{batsman.runs}</td>
                    <td className="p-2 text-center">{batsman.balls}</td>
                    <td className="p-2 text-center">{batsman.fours}</td>
                    <td className="p-2 text-center">{batsman.sixes}</td>
                    <td className="p-2 text-center">{batsman.strikeRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Extras */}
          <div className="mt-4 p-3 bg-slate-50 rounded">
            <p className="text-sm">
              <span className="font-medium">Extras:</span> {innings.extras?.total}
              (wd {innings.extras?.wides}, nb {innings.extras?.noBalls},
              b {innings.extras?.byes}, lb {innings.extras?.legByes})
            </p>
          </div>

          {/* Bowling */}
          <h4 className="font-semibold mb-3 mt-6">Bowling</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2 text-left">Bowler</th>
                  <th className="p-2 text-center">O</th>
                  <th className="p-2 text-center">M</th>
                  <th className="p-2 text-center">R</th>
                  <th className="p-2 text-center">W</th>
                  <th className="p-2 text-center">Econ</th>
                </tr>
              </thead>
              <tbody>
                {innings.bowling?.map((bowler, bIdx) => (
                  <tr key={bIdx} className="border-t">
                    <td className="p-2 font-medium">{bowler.player?.name}</td>
                    <td className="p-2 text-center">
                      {Math.floor(bowler.balls / 6)}.{bowler.balls % 6}
                    </td>
                    <td className="p-2 text-center">{bowler.maidens}</td>
                    <td className="p-2 text-center">{bowler.runs}</td>
                    <td className="p-2 text-center font-semibold">{bowler.wickets}</td>
                    <td className="p-2 text-center">{bowler.economy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fall of Wickets */}
          {innings.fallOfWickets && innings.fallOfWickets.length > 0 && (
            <>
              <h4 className="font-semibold mb-3 mt-6">Fall of Wickets</h4>
              <div className="flex flex-wrap gap-3">
                {innings.fallOfWickets.map((fow, fIdx) => (
                  <div key={fIdx} className="px-3 py-2 bg-slate-50 rounded text-sm">
                    {fow.runs}-{fow.wickets} ({fow.player?.name}, {fow.overs} ov)
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// Commentary Tab Component
function CommentaryTab({ match, currentInnings }) {
  if (!currentInnings || !currentInnings.oversHistory) {
    return <div className="text-center py-8 text-slate-500">No commentary available</div>;
  }

  const allBalls = [];
  currentInnings.oversHistory.forEach(over => {
    over.balls.forEach(ball => {
      allBalls.push({
        ...ball,
        overNumber: over.overNumber
      });
    });
  });

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-semibold mb-4">Ball by Ball Commentary</h3>
        <div className="space-y-4">
          {allBalls.slice().reverse().map((ball, idx) => (
            <div key={idx} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-bold text-blue-600 text-lg">
                    Over {ball.overNumber}.{ball.ballNumber}
                  </span>
                  <div className="text-xs text-slate-500 mt-1">
                    {ball.batsmanOnStrike?.name} • {ball.bowler?.name}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${ball.isWicket ? "bg-red-500 text-white" :
                  ball.runs === 6 ? "bg-purple-500 text-white" :
                    ball.runs === 4 ? "bg-green-500 text-white" :
                      ball.isWide || ball.isNoBall ? "bg-orange-500 text-white" :
                        ball.runs === 0 ? "bg-slate-300 text-slate-700" :
                          "bg-blue-500 text-white"
                  }`}>
                  {ball.isWicket ? "WICKET" :
                    ball.isWide ? "WIDE" :
                      ball.isNoBall ? "NO BALL" :
                        `${ball.runs} ${ball.runs === 1 ? "RUN" : "RUNS"}`}
                </span>
              </div>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {ball.commentary}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stats Tab Component
function StatsTab({ match }) {
  const innings1 = match.innings?.[0];
  const innings2 = match.innings?.[1];

  const topBatsmen = [];
  match.innings?.forEach(inn => {
    inn.batting?.forEach(b => {
      topBatsmen.push({
        ...b,
        team: inn.team
      });
    });
  });
  topBatsmen.sort((a, b) => b.runs - a.runs);

  const topBowlers = [];
  match.innings?.forEach(inn => {
    inn.bowling?.forEach(b => {
      topBowlers.push({
        ...b,
        team: inn.team
      });
    });
  });
  topBowlers.sort((a, b) => b.wickets - a.wickets);

  return (
    <div className="space-y-6">
      {/* Match Summary */}
      <div className="card">
        <h3 className="font-semibold mb-4">Match Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Total Runs</p>
            <p className="text-2xl font-bold">
              {(innings1?.runs || 0) + (innings2?.runs || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Wickets</p>
            <p className="text-2xl font-bold">
              {(innings1?.wickets || 0) + (innings2?.wickets || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Fours</p>
            <p className="text-2xl font-bold">
              {innings1?.batting?.reduce((sum, b) => sum + (b.fours || 0), 0) +
                innings2?.batting?.reduce((sum, b) => sum + (b.fours || 0), 0) || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Sixes</p>
            <p className="text-2xl font-bold">
              {innings1?.batting?.reduce((sum, b) => sum + (b.sixes || 0), 0) +
                innings2?.batting?.reduce((sum, b) => sum + (b.sixes || 0), 0) || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Top Batsmen */}
      <div className="card">
        <h3 className="font-semibold mb-4">Top Batsmen</h3>
        <div className="space-y-3">
          {topBatsmen.slice(0, 5).map((batsman, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-bold text-2xl text-slate-300">{idx + 1}</span>
                <div>
                  <p className="font-medium">{batsman.player?.name}</p>
                  <p className="text-sm text-slate-500">{batsman.team?.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{batsman.runs}</p>
                <p className="text-xs text-slate-500">
                  ({batsman.balls}b, SR: {batsman.strikeRate})
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Bowlers */}
      <div className="card">
        <h3 className="font-semibold mb-4">Top Bowlers</h3>
        <div className="space-y-3">
          {topBowlers.slice(0, 5).map((bowler, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-bold text-2xl text-slate-300">{idx + 1}</span>
                <div>
                  <p className="font-medium">{bowler.player?.name}</p>
                  <p className="text-sm text-slate-500">{bowler.team?.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{bowler.wickets}/{bowler.runs}</p>
                <p className="text-xs text-slate-500">
                  ({Math.floor(bowler.balls / 6)}.{bowler.balls % 6} ov, Econ: {bowler.economy})
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Overs Tab Component
function OversTab({ match, currentInnings }) {
  if (!currentInnings || !currentInnings.oversHistory) {
    return <div className="text-center py-8 text-slate-500">No overs data available</div>;
  }

  return (
    <div className="space-y-4">
      {currentInnings.oversHistory.slice().reverse().map((over, idx) => (
        <div key={idx} className="card p-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-20 shrink-0">
              <p className="font-bold text-slate-800">
                {over.overNumber + 1}{["st", "nd", "rd"][(over.overNumber + 1) % 10 - 1] || "th"}
              </p>
              <p className="text-xs text-slate-500 uppercase font-medium">{over.runsScored} Runs</p>
            </div>

            <div className="flex gap-1.5 flex-wrap overflow-x-auto pb-1 sm:pb-0">
              {over.balls.map((ball, bIdx) => (
                <div
                  key={bIdx}
                  className={`w-9 h-9 flex items-center justify-center rounded-full font-bold text-xs shadow-sm shrink-0 ${ball.isWicket ? "bg-red-500 text-white" :
                    ball.runs === 6 ? "bg-purple-500 text-white" :
                      ball.runs === 4 ? "bg-green-500 text-white" :
                        ball.isWide || ball.isNoBall ? "bg-orange-500 text-white" :
                          ball.runs === 0 ? "bg-slate-300 text-slate-700" :
                            "bg-blue-500 text-white"
                    }`}
                >
                  {ball.isWicket ? "W" :
                    ball.isWide ? `${1 + ball.runs}w` :
                      ball.isNoBall ? `${1 + ball.runs}nb` :
                        ball.isBye ? `${ball.runs}b` :
                          ball.isLegBye ? `${ball.runs}lb` :
                            ball.runs === 0 ? "•" : ball.runs}
                </div>
              ))}
            </div>

            <div className="ml-auto text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-600">
                {over.bowler?.name?.split(' ').pop()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Playing XI Tab Component
function PlayingXITab({ match }) {
  if (!match.playingXI || match.playingXI.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        Playing XI not set yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {match.playingXI.map((xi, idx) => (
        <div key={idx} className="card">
          <h3 className="text-lg font-semibold mb-4">{xi.team?.name} Playing XI</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {xi.players?.map((player, pIdx) => (
              <div key={pIdx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <span className="font-bold text-slate-400">{pIdx + 1}</span>
                <div>
                  <p className="font-medium">{player.name}</p>
                  <p className="text-sm text-slate-500">{player.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Toss Info */}
      {match.tossWinner && (
        <div className="card bg-blue-50">
          <h3 className="font-semibold mb-2">Toss</h3>
          <p className="text-sm">
            <span className="font-medium">{match.tossWinner.name}</span> won the toss and
            chose to <span className="font-medium">{match.tossDecision}</span>
          </p>
        </div>
      )}

      {/* Man of the Match */}
      {match.manOfMatch && (
        <div className="card bg-green-50">
          <h3 className="font-semibold mb-2">Man of the Match</h3>
          <p className="text-lg font-medium">{match.manOfMatch.name}</p>
          <p className="text-sm text-slate-600">{match.manOfMatch.role}</p>
        </div>
      )}
    </div>
  );
}

// Table Tab Component
function TableTab({ tournamentId }) {
  const [pointsTable, setPointsTable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPointsTable();
  }, [tournamentId]);

  const loadPointsTable = async () => {
    try {
      const res = await api.get(`/tournaments/${tournamentId}/points-table`);
      setPointsTable(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading points table...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-800">Tournament Standings</h3>
        <button
          onClick={loadPointsTable}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title="Refresh Table"
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold">
            <tr>
              <th className="px-4 py-3">Pos</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-2 py-3 text-center">M</th>
              <th className="px-2 py-3 text-center">W</th>
              <th className="px-2 py-3 text-center">L</th>
              <th className="px-2 py-3 text-center">T/NR</th>
              <th className="px-4 py-3 text-center">NRR</th>
              <th className="px-4 py-3 text-center bg-blue-50 text-blue-800">PTS</th>
              <th className="px-4 py-3 text-center">For</th>
              <th className="px-4 py-3 text-center">Against</th>
              <th className="px-4 py-3">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pointsTable.map((entry, idx) => (
              <tr key={idx} className={`${idx < 4 ? "bg-green-50/30" : "hover:bg-slate-50"} transition-colors`}>
                <td className="px-4 py-4 font-bold text-slate-400">{idx + 1}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white border flex items-center justify-center overflow-hidden">
                      {entry.team?.logo ? <img src={entry.team.logo} className="w-6 h-6 object-contain" /> : <div className="text-[10px] font-bold">{entry.team?.shortName || "T"}</div>}
                    </div>
                    <span className="font-bold text-slate-800">{entry.team?.name}</span>
                  </div>
                </td>
                <td className="px-2 py-4 text-center font-medium">{entry.matchesPlayed}</td>
                <td className="px-2 py-4 text-center text-green-600 font-bold">{entry.won}</td>
                <td className="px-2 py-4 text-center text-red-600 font-bold">{entry.lost}</td>
                <td className="px-2 py-4 text-center text-slate-500 font-medium">{entry.tied + entry.noResult}</td>
                <td className="px-4 py-4 text-center font-bold text-blue-600">{(entry.netRunRate || 0).toFixed(3)}</td>
                <td className="px-4 py-4 text-center font-black bg-blue-50 text-blue-900">{entry.points}</td>
                <td className="px-4 py-4 text-center text-[11px]">
                  <span className="block font-bold">{entry.for} runs</span>
                  <span className="text-slate-400">{entry.wicketsAgainst} wkts</span>
                </td>
                <td className="px-4 py-4 text-center text-[11px]">
                  <span className="block font-bold">{entry.against} runs</span>
                  <span className="text-slate-400">{entry.wicketsFor} wkts</span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-1">
                    {entry.seriesForm?.map((f, i) => (
                      <span key={i} className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white ${f === "W" ? "bg-green-500" : f === "L" ? "bg-red-500" : "bg-slate-400"
                        }`}>
                        {f}
                      </span>
                    ))}
                    {!entry.seriesForm?.length && <span className="text-xs text-slate-300">-</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pointsTable.length > 0 && (
        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs text-blue-800 font-medium">
            Points Table update automatically after each completed match. Top 4 teams qualify for the next stage.
          </p>
        </div>
      )}
    </div>
  );
}

function FixturesTab({ tournamentId }) {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFixtures();
  }, [tournamentId]);

  const loadFixtures = async () => {
    try {
      const res = await api.get(`/tournaments/${tournamentId}/fixtures`);
      setFixtures(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading fixtures...</div>;

  return (
    <div className="space-y-4">
      {fixtures.map(match => (
        <div key={match._id} className="card hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold text-slate-400">MATCH {match.matchNumber}</span>
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${match.status === "completed" ? "bg-slate-100 text-slate-600" :
              match.status === "live" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
              }`}>
              {match.status}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <img src={match.teams[0].logo} className="w-6 h-6 object-contain" />
                <span className="font-bold text-slate-800">{match.teams[0].name}</span>
              </div>
              <div className="flex items-center gap-3">
                <img src={match.teams[1].logo} className="w-6 h-6 object-contain" />
                <span className="font-bold text-slate-800">{match.teams[1].name}</span>
              </div>
            </div>
            <div className="text-right">
              {match.status === "completed" ? (
                <div className="text-xs font-bold text-blue-600">{match.result?.description}</div>
              ) : (
                <div className="text-xs text-slate-500">{new Date(match.startAt).toLocaleString()}</div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Match Info Sidebar Component
function MatchInfoSidebar({ match }) {
  return (
    <div className="space-y-6">
      <div className="card shadow-md">
        <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 uppercase tracking-tight text-sm">Match Information</h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-500 uppercase font-black mb-1">Series</p>
            <p className="text-sm font-bold text-blue-800">{match.tournament?.name || "Independent Series"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-black mb-1">Match Type</p>
            <p className="text-sm font-bold text-slate-800">{match.matchType} ({match.totalOvers} overs)</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-black mb-1">Venue</p>
            <p className="text-sm font-bold text-slate-800">{match.venue || "TBD"}</p>
          </div>
          {match.tossWinner && match.teams && (
            <div>
              <p className="text-xs text-slate-500 uppercase font-black mb-1">Toss</p>
              <p className="text-sm font-bold text-slate-800">
                {match.tossWinner === match.teams?.[0]?._id ? match.teams?.[0]?.name : match.teams?.[1]?.name} won the toss and elected to {match.tossChoice} first
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card shadow-md bg-[#031d44] text-white border-none">
        <h3 className="font-bold mb-4 border-b border-white/10 pb-2 uppercase tracking-tight text-sm">Series Status</h3>
        <p className="text-sm font-medium italic">
          Match ID: {match._id?.slice(-8).toUpperCase()}
        </p>
        <div className="mt-4 pt-4 border-t border-white/10">
          <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded font-bold text-xs transition-all uppercase tracking-widest">
            See Full Series Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

// Blog & News Gallery Component
function BlogGallery({ category, relatedId }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get(`/blogs?category=${category}&relatedId=${relatedId}`);
        setBlogs(res.data);
      } catch (err) {
        console.error("Error fetching match blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    if (relatedId) fetchBlogs();
  }, [category, relatedId]);

  if (loading || blogs.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-black text-[#031d44] mb-6 uppercase tracking-tighter border-b-2 border-[#031d44] pb-2 inline-block">
        Match News & Highlights
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {blogs.map((blog) => (
          <div key={blog._id} className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-xl transition-all overflow-hidden border">
            <div className="relative aspect-video">
              <img src={blog.imageUrl || "https://img1.hscicdn.com/image/upload/f_auto,t_ds_wide_w_720/lsci/db/PICTURES/CMS/376400/376451.jpg"} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {blog.videoUrl && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                {blog.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium">{new Date(blog.createdAt).toLocaleDateString()} • {blog.author}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RankingsTab({ tournamentId }) {
  const [batting, setBatting] = useState([]);
  const [bowling, setBowling] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      const [batRes, bowlRes] = await Promise.all([
        api.get('/rankings/batting'),
        api.get('/rankings/bowling')
      ]);
      setBatting(batRes.data);
      setBowling(bowlRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading rankings...</div>;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card shadow-lg">
        <h3 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2">Top Batsmen</h3>
        <div className="space-y-3">
          {batting.slice(0, 5).map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-400 w-4">{r.rank}</span>
                <span className="font-bold text-slate-800">{r.player.name}</span>
              </div>
              <div className="text-right">
                <span className="font-black text-blue-600">{r.runs}</span>
                <span className="text-[10px] block text-slate-400 font-bold uppercase">runs</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card shadow-lg">
        <h3 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2">Top Bowlers</h3>
        <div className="space-y-3">
          {bowling.slice(0, 5).map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-400 w-4">{r.rank}</span>
                <span className="font-bold text-slate-800">{r.player.name}</span>
              </div>
              <div className="text-right">
                <span className="font-black text-red-600">{r.wickets}</span>
                <span className="text-[10px] block text-slate-400 font-bold uppercase">wickets</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SuperOverSelection({ match, onStart }) {
  const [batsman1, setBatsman1] = useState("");
  const [batsman2, setBatsman2] = useState("");
  const [batsman3, setBatsman3] = useState("");
  const [bowler, setBowler] = useState("");

  const isFirstSO = match.innings.length === 2;

  // 1st SO: 2nd innings team bats, 1st innings team bowls
  // 2nd SO: 1st innings team bats, 2nd innings team bowls
  const battingTeam = isFirstSO ? match.innings[1].team : match.innings[0].team;
  const bowlingTeam = isFirstSO ? match.innings[0].team : match.innings[1].team;

  const battingTeamId = battingTeam._id || battingTeam;
  const bowlingTeamId = bowlingTeam._id || bowlingTeam;

  const battingXI = match.playingXI?.find(xi => (xi.team._id || xi.team) === battingTeamId)?.players || [];
  const bowlingXI = match.playingXI?.find(xi => (xi.team._id || xi.team) === bowlingTeamId)?.players || [];

  const handleStart = () => {
    if (!batsman1 || !batsman2 || !batsman3 || !bowler) {
      alert("Please select 3 batsmen and 1 bowler");
      return;
    }

    // Ensure unique batsmen
    const batsmenIds = [batsman1, batsman2, batsman3];
    const uniqueBatsmen = new Set(batsmenIds);
    if (uniqueBatsmen.size !== 3) {
      alert("Please select 3 unique players as batsmen");
      return;
    }

    onStart({
      batsmenIds,
      bowlerId: bowler
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Super Over Selection</h2>
          <p className="text-blue-600 font-bold text-sm tracking-widest mt-1">
            {isFirstSO ? "PHASE 1: FIRST INNINGS" : "PHASE 2: SECOND INNINGS"}
          </p>
        </div>

        <div className="space-y-8">
          {/* Batting Team */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-3">Batting Team</h3>
            <p className="font-bold text-xl text-slate-800 mb-4">{battingTeam.name}</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-tighter">Batsman 1:</label>
                <select
                  value={batsman1}
                  onChange={(e) => setBatsman1(e.target.value)}
                  className="w-full p-2 font-bold text-sm border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                >
                  <option value="">Select Batsman 1</option>
                  {battingXI.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-tighter">Batsman 2:</label>
                <select
                  value={batsman2}
                  onChange={(e) => setBatsman2(e.target.value)}
                  className="w-full p-2 font-bold text-sm border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                >
                  <option value="">Select Batsman 2</option>
                  {battingXI.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-tighter">Batsman 3:</label>
                <select
                  value={batsman3}
                  onChange={(e) => setBatsman3(e.target.value)}
                  className="w-full p-2 font-bold text-sm border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                >
                  <option value="">Select Batsman 3</option>
                  {battingXI.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {battingXI.length === 0 && <p className="text-red-500 text-xs italic mt-2">No Playing XI set for this team</p>}
          </div>

          {/* Bowling Team */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-3">Bowling Team</h3>
            <p className="font-bold text-xl text-slate-800 mb-4">{bowlingTeam.name}</p>
            <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-tighter">Choose 1 Bowler:</label>
            <select
              value={bowler}
              onChange={(e) => setBowler(e.target.value)}
              className="w-full p-3 font-bold text-sm border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-colors"
            >
              <option value="">Select Bowler</option>
              {bowlingXI.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            {bowlingXI.length === 0 && <p className="text-red-500 text-xs italic mt-2">No Playing XI set for this team</p>}
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleStart}
            disabled={!batsman1 || !batsman2 || !batsman3 || !bowler}
            className="w-full py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 transition-all uppercase tracking-widest shadow-xl"
          >
            Start Innings
          </button>
        </div>
      </div>
    </div>
  );
}
