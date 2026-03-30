import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";

export default function Summary() {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatch = async () => {
      try {
        const res = await api.get(`/matches/${matchId}`);
        setMatch(res.data);
      } catch (err) {
        console.error("Failed to load match:", err);
      } finally {
        setLoading(false);
      }
    };
    loadMatch();
  }, [matchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800 mb-2">Match Not Found</h2>
          <Link to="/" className="text-blue-600 hover:underline">Go to Home</Link>
        </div>
      </div>
    );
  }

  const isMatchCompleted = match.status === 'completed';
  const team1 = match.teams?.[0];
  const team2 = match.teams?.[1];
  const innings1 = match.innings?.[0];
  const innings2 = match.innings?.[1];

  // Calculate MVP (Cricinfo style - based on impact points)
  const calculateMVP = () => {
    if (!isMatchCompleted) return null;

    const allPlayers = [];

    // Process batting performances
    match.innings?.forEach((innings, innIdx) => {
      const battingTeamId = innings.team?._id || innings.team;
      const bowlingTeamId = match.teams.find(t => (t._id || t) !== battingTeamId)?._id || match.teams.find(t => (t._id || t) !== battingTeamId);

      innings.batting?.forEach(bat => {
        const playerId = bat.player?._id || bat.player;
        let impactPoints = 0;

        // Batting points
        impactPoints += bat.runs * 1.0; // 1 point per run
        impactPoints += (bat.fours || 0) * 2; // 2 points per four
        impactPoints += (bat.sixes || 0) * 3; // 3 points per six
        if (bat.runs >= 50) impactPoints += 10; // 10 points for fifty
        if (bat.runs >= 100) impactPoints += 20; // 20 points for century

        // Strike rate bonus
        if (bat.balls > 0) {
          const sr = (bat.runs / bat.balls) * 100;
          if (sr > 150) impactPoints += 5;
          if (sr > 200) impactPoints += 10;
        }

        const existing = allPlayers.find(p => p.playerId === playerId);
        if (existing) {
          existing.impactPoints += impactPoints;
        } else {
          allPlayers.push({
            playerId,
            playerName: bat.player?.name,
            teamId: battingTeamId,
            impactPoints,
            role: 'batting'
          });
        }
      });

      // Bowling points
      innings.bowling?.forEach(bowl => {
        const playerId = bowl.player?._id || bowl.player;
        let impactPoints = 0;

        impactPoints += bowl.wickets * 25; // 25 points per wicket
        if (bowl.wickets >= 3) impactPoints += 10; // 10 points for 3+ wickets
        if (bowl.wickets >= 5) impactPoints += 20; // 20 points for 5+ wickets

        // Economy rate bonus
        if (bowl.balls > 0) {
          const econ = (bowl.runs / (bowl.balls / 6));
          if (econ < 6) impactPoints += 5;
          if (econ < 5) impactPoints += 10;
        }

        const existing = allPlayers.find(p => p.playerId === playerId);
        if (existing) {
          existing.impactPoints += impactPoints;
        } else {
          allPlayers.push({
            playerId,
            playerName: bowl.player?.name,
            teamId: bowlingTeamId,
            impactPoints,
            role: 'bowling'
          });
        }
      });
    });

    // Sort by impact points
    allPlayers.sort((a, b) => b.impactPoints - a.impactPoints);
    return allPlayers.slice(0, 5);
  };

  const mvpList = calculateMVP();
  const topMVP = mvpList?.[0];

  // Get best all-rounder performance
  const calculateAllRounderRankings = () => {
    if (!isMatchCompleted) return [];

    const allRounders = [];

    match.innings?.forEach((innings) => {
      const battingTeamId = innings.team?._id || innings.team;
      const bowlingTeamId = match.teams.find(t => (t._id || t) !== battingTeamId)?._id || match.teams.find(t => (t._id || t) !== battingTeamId);

      // Check players who both batted and bowled
      innings.batting?.forEach(bat => {
        const batPlayerId = bat.player?._id || bat.player;
        const bowlStats = innings.bowling?.find(b => (b.player?._id || b.player) === batPlayerId);

        if (bowlStats && bat.runs > 0 && bowlStats.wickets > 0) {
          allRounders.push({
            playerId: batPlayerId,
            playerName: bat.player?.name,
            teamId: battingTeamId,
            runs: bat.runs,
            balls: bat.balls,
            wickets: bowlStats.wickets,
            overs: bowlStats.balls / 6,
            runsConceded: bowlStats.runs,
            combinedScore: bat.runs + (bowlStats.wickets * 20)
          });
        }
      });
    });

    allRounders.sort((a, b) => b.combinedScore - a.combinedScore);
    return allRounders.slice(0, 5);
  };

  const allRounderRankings = calculateAllRounderRankings();

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Header */}
      <div className="bg-[#031d44] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Match Summary</h1>
          <p className="text-blue-300 text-sm">{match.title} - {match.venue}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Result Card */}
        {match.result && (
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl shadow-xl p-8">
            <h2 className="text-lg font-black uppercase tracking-widest mb-4 text-green-200">Match Result</h2>
            <p className="text-2xl font-black mb-2">{match.result.description}</p>
            {match.manOfMatch && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm font-black uppercase tracking-widest text-green-200 mb-3">Player of the Match</p>
                <Link
                  to={`/players/${match.manOfMatch._id}`}
                  className="inline-flex items-center gap-4 bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl hover:bg-white/30 transition-colors"
                >
                  {match.manOfMatch.imageUrl ? (
                    <img src={match.manOfMatch.imageUrl} alt={match.manOfMatch.name} className="w-16 h-16 rounded-full object-cover border-2 border-white" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center text-2xl font-black">
                      {match.manOfMatch.name?.charAt(0) || 'P'}
                    </div>
                  )}
                  <div>
                    <p className="text-xl font-bold">{match.manOfMatch.name}</p>
                    <p className="text-sm text-green-200">{match.manOfMatch.role}</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Innings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {match.innings?.map((innings, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-[#031d44] px-6 py-4">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  {match.teams[idx]?.name} - {innings.status === 'completed' ? 'Completed' : innings.status}
                </h3>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-4xl font-black text-[#031d44]">{innings.runs}/{innings.wickets}</p>
                    <p className="text-sm text-slate-500 mt-1">{innings.overs}.{innings.balls % 6} overs</p>
                  </div>
                  {innings.runRate > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Run Rate</p>
                      <p className="text-xl font-bold text-slate-700">{innings.runRate.toFixed(2)}</p>
                    </div>
                  )}
                </div>

                {/* Top Batsmen */}
                {innings.batting?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Top Batsmen</p>
                    <div className="space-y-2">
                      {innings.batting
                        .sort((a, b) => b.runs - a.runs)
                        .slice(0, 3)
                        .map((bat, i) => (
                          <Link
                            key={i}
                            to={`/players/${bat.player?._id}`}
                            className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <div>
                              <p className="font-bold text-slate-800">{bat.player?.name}</p>
                              <p className="text-xs text-slate-500">{bat.balls} balls</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black text-[#031d44]">{bat.runs}</p>
                              <p className="text-xs text-slate-500">SR: {bat.strikeRate?.toFixed(2)}</p>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}

                {/* Top Bowlers */}
                {innings.bowling?.length > 0 && (
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Top Bowlers</p>
                    <div className="space-y-2">
                      {innings.bowling
                        .sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)
                        .slice(0, 3)
                        .map((bowl, i) => (
                          <Link
                            key={i}
                            to={`/players/${bowl.player?._id}`}
                            className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <div>
                              <p className="font-bold text-slate-800">{bowl.player?.name}</p>
                              <p className="text-xs text-slate-500">{bowl.overs} overs</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black text-red-600">{bowl.wickets}-{bowl.runs}</p>
                              <p className="text-xs text-slate-500">Econ: {bowl.economy?.toFixed(2)}</p>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Cricinfo MVP Rankings */}
        {mvpList && mvpList.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Cricinfo MVP Rankings
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {mvpList.map((player, idx) => (
                <Link
                  key={player.playerId}
                  to={`/players/${player.playerId}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                      idx === 1 ? 'bg-slate-300 text-slate-700' :
                        idx === 2 ? 'bg-amber-600 text-amber-100' :
                          'bg-slate-100 text-slate-600'
                      }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{player.playerName}</p>
                      <p className="text-xs text-slate-500 uppercase">{player.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-purple-600">{player.impactPoints.toFixed(1)}</p>
                    <p className="text-xs text-slate-500">Impact Points</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Best All-Rounder Performance */}
        {allRounderRankings && allRounderRankings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Best All-Rounder Performances
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {allRounderRankings.map((player, idx) => (
                <Link
                  key={player.playerId}
                  to={`/players/${player.playerId}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                      idx === 1 ? 'bg-slate-300 text-slate-700' :
                        idx === 2 ? 'bg-amber-600 text-amber-100' :
                          'bg-slate-100 text-slate-600'
                      }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{player.playerName}</p>
                      <p className="text-xs text-slate-500">
                        {player.runs} runs ({player.balls}b) & {player.wickets} wickets ({player.runsConceded} runs)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-blue-600">{player.combinedScore}</p>
                    <p className="text-xs text-slate-500">Combined Score</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Match */}
        <div className="flex justify-center gap-4">
          <Link
            to={`/match/${matchId}`}
            className="bg-[#031d44] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            Back to Match Page
          </Link>
          <Link
            to="/"
            className="bg-white text-slate-700 border border-slate-300 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
