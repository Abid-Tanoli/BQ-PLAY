// src/pages/LiveMatchView.jsx
// Complete implementation with all tabs

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSocket } from "../store/socket";
import api from "../services/api";

export default function LiveMatchView() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("live");

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
      const res = await api.get(`/matches/${matchId}`);
      setMatch(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
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
  ];

  if (match.tournament) {
    tabs.push({ id: "table", label: "Table" });
    tabs.push({ id: "fixtures", label: "Fixtures" });
  }
  tabs.push({ id: "rankings", label: "Rankings" });

  return (
    <div className="max-w-7xl mx-auto pb-8">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="p-4">
          <button
            onClick={() => navigate("/admin")}
            className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{match.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                {match.venue && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {match.venue}
                  </span>
                )}
                <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">{match.matchType}</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${match.status === "live" ? "bg-green-100 text-green-700 animate-pulse" :
              match.status === "pending_tie_resolution" ? "bg-orange-100 text-orange-700 animate-bounce" :
                match.status === "completed" ? "bg-slate-100 text-slate-700" : "bg-blue-100 text-blue-700"
              }`}>
              {match.status === "live" && "● "}{match.status.replace(/_/g, " ").toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className={`p-4 rounded-lg ${innings1?.status === "live" ? "bg-blue-50 border-2 border-blue-500" : "bg-slate-50"}`}>
              <div className="flex items-center gap-2 mb-2">
                {team1?.logo && <img src={team1.logo} alt={team1.name} className="w-8 h-8" />}
                <span className="font-semibold">{team1?.name}</span>
              </div>
              <div className="text-3xl font-bold">{innings1?.runs || 0}/{innings1?.wickets || 0}</div>
              <div className="text-sm text-slate-600">
                ({innings1?.overs || 0}.{innings1?.balls || 0} overs)
                {innings1?.runRate > 0 && ` • RR: ${innings1.runRate}`}
              </div>
            </div>

            <div className={`p-4 rounded-lg ${innings2?.status === "live" ? "bg-blue-50 border-2 border-blue-500" : "bg-slate-50"}`}>
              <div className="flex items-center gap-2 mb-2">
                {team2?.logo && <img src={team2.logo} alt={team2.name} className="w-8 h-8" />}
                <span className="font-semibold">{team2?.name}</span>
              </div>
              <div className="text-3xl font-bold">{innings2?.runs || 0}/{innings2?.wickets || 0}</div>
              <div className="text-sm text-slate-600">
                ({innings2?.overs || 0}.{innings2?.balls || 0} overs)
                {innings2?.runRate > 0 && ` • RR: ${innings2.runRate}`}
                {innings2?.requiredRunRate > 0 && ` • RRR: ${innings2.requiredRunRate}`}
              </div>
            </div>
          </div>

          {match.result?.description && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-green-800 font-medium text-center">{match.result.description}</p>
            </div>
          )}

          {innings2?.target > 0 && match.status === "live" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-center">
                {team2?.name} needs {innings2.target - innings2.runs} runs from {
                  ((match.totalOvers - innings2.overs) * 6 - innings2.balls)
                } balls
              </p>
            </div>
          )}

          {match.status === "pending_tie_resolution" && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 mb-4 text-center">
              <h3 className="text-xl font-bold text-orange-800 mb-2">Match Tied!</h3>
              <p className="text-orange-700 mb-4">Choose how to proceed with the result:</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleResolveTie("declared_tie")}
                  className="px-6 py-2 bg-white border border-orange-500 text-orange-700 font-bold rounded-lg hover:bg-orange-50 transition-colors"
                >
                  Declare Match Tie
                </button>
                <button
                  onClick={() => handleResolveTie("super_over")}
                  className="px-6 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Start Super Over Match
                </button>
              </div>
            </div>
          )}

          {match.tieResolution === "super_over" && match.status === "pending_tie_resolution" && (
            <SuperOverSelection match={match} onStart={handleStartSuperOver} />
          )}

          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors ${activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-600 hover:text-slate-800"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        {activeTab === "live" && <LiveTab match={match} currentInnings={currentInnings} />}
        {activeTab === "scorecard" && <ScorecardTab match={match} />}
        {activeTab === "commentary" && <CommentaryTab match={match} currentInnings={currentInnings} />}
        {activeTab === "stats" && <StatsTab match={match} />}
        {activeTab === "overs" && <OversTab match={match} currentInnings={currentInnings} />}
        {activeTab === "playingxi" && <PlayingXITab match={match} />}
        {activeTab === "table" && match.tournament && <TableTab tournamentId={match.tournament._id || match.tournament} />}
        {activeTab === "fixtures" && match.tournament && <FixturesTab tournamentId={match.tournament._id || match.tournament} />}
        {activeTab === "rankings" && <RankingsTab tournamentId={match.tournament?._id || match.tournament} />}
      </div>
    </div>
  );
}

// Live Tab Component
function LiveTab({ match, currentInnings }) {
  if (!currentInnings) {
    return <div className="text-center py-8 text-slate-500">No live innings data</div>;
  }

  const currentOver = currentInnings.oversHistory?.[currentInnings.oversHistory.length - 1];
  const recentBalls = currentOver?.balls?.slice(-6) || [];

  return (
    <div className="space-y-6">
      {/* Current Batsmen */}
      <div className="card">
        <h3 className="font-semibold mb-4">Current Batsmen</h3>
        <div className="space-y-3">
          {currentInnings.batting?.filter(b => !b.isOut).slice(0, 2).map((batsman, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                {batsman.player?._id === currentInnings.onStrikeBatsman?._id && (
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                )}
                <div>
                  <p className="font-medium">{batsman.player?.name}</p>
                  <p className="text-sm text-slate-500">{batsman.player?.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{batsman.runs}</p>
                <p className="text-sm text-slate-500">
                  ({batsman.balls}b, {batsman.fours}x4, {batsman.sixes}x6)
                </p>
                <p className="text-xs text-slate-500">SR: {batsman.strikeRate}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Bowler */}
      {currentInnings.bowling?.find(b => b.player?._id === currentInnings.currentBowler?._id) && (
        <div className="card">
          <h3 className="font-semibold mb-4">Current Bowler</h3>
          {(() => {
            const bowler = currentInnings.bowling.find(
              b => b.player?._id === currentInnings.currentBowler?._id
            );
            return (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">{bowler.player?.name}</p>
                  <p className="text-sm text-slate-500">{bowler.player?.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">
                    {bowler.wickets}/{bowler.runs}
                  </p>
                  <p className="text-sm text-slate-500">
                    {Math.floor(bowler.balls / 6)}.{bowler.balls % 6} overs
                  </p>
                  <p className="text-xs text-slate-500">Econ: {bowler.economy}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Current Over */}
      {recentBalls.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4">This Over</h3>
          <div className="flex gap-2 flex-wrap">
            {recentBalls.map((ball, idx) => (
              <div
                key={idx}
                className={`w-12 h-12 flex items-center justify-center rounded-full font-bold ${ball.isWicket ? "bg-red-500 text-white" :
                  ball.runs === 6 ? "bg-purple-500 text-white" :
                    ball.runs === 4 ? "bg-green-500 text-white" :
                      ball.isWide || ball.isNoBall ? "bg-orange-500 text-white" :
                        ball.runs === 0 ? "bg-slate-300 text-slate-700" :
                          "bg-blue-500 text-white"
                  }`}
              >
                {ball.isWicket ? "W" :
                  ball.isWide ? "Wd" :
                    ball.isNoBall ? "Nb" :
                      ball.runs}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Commentary */}
      <div className="card">
        <h3 className="font-semibold mb-4">Recent Balls</h3>
        <div className="space-y-3">
          {currentOver?.balls?.slice().reverse().slice(0, 3).map((ball, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-blue-600">
                  {currentOver.overNumber}.{ball.ballNumber}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${ball.isWicket ? "bg-red-100 text-red-700" :
                  ball.runs === 6 ? "bg-purple-100 text-purple-700" :
                    ball.runs === 4 ? "bg-green-100 text-green-700" :
                      "bg-slate-100 text-slate-700"
                  }`}>
                  {ball.isWicket ? "WICKET" :
                    ball.isWide ? "WIDE" :
                      ball.isNoBall ? "NO BALL" :
                        `${ball.runs} ${ball.runs === 1 ? "run" : "runs"}`}
                </span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{ball.commentary}</p>
            </div>
          ))}
        </div>
      </div>
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
        <div key={idx} className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Over {over.overNumber + 1}</h3>
            <div className="text-right">
              <p className="font-semibold">{over.runsScored} runs</p>
              {over.wickets > 0 && (
                <p className="text-sm text-red-600">{over.wickets} wicket{over.wickets > 1 ? 's' : ''}</p>
              )}
              {over.maidenOver && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Maiden</span>
              )}
            </div>
          </div>

          <div className="mb-3">
            <p className="text-sm text-slate-600">
              <span className="font-medium">Bowler:</span> {over.bowler?.name || 'Unknown'}
            </p>
            <p className="text-sm text-slate-500 mt-1">{over.summary}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {over.balls.map((ball, bIdx) => (
              <div
                key={bIdx}
                className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm ${ball.isWicket ? "bg-red-500 text-white" :
                  ball.runs === 6 ? "bg-purple-500 text-white" :
                    ball.runs === 4 ? "bg-green-500 text-white" :
                      ball.isWide || ball.isNoBall ? "bg-orange-500 text-white" :
                        ball.runs === 0 ? "bg-slate-300 text-slate-700" :
                          "bg-blue-500 text-white"
                  }`}
              >
                {ball.isWicket ? "W" :
                  ball.isWide ? "Wd" :
                    ball.isNoBall ? "Nb" :
                      ball.runs}
              </div>
            ))}
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
      <div className="card">
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
                <span className="text-[10px] block text-slate-400">runs</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
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
                <span className="text-[10px] block text-slate-400">wickets</span>
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
