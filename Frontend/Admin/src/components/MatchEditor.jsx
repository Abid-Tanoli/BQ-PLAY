import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateScore, updateToss, setPlayingXI, setOpeners } from "../store/slices/matchesSlice";
import api from "../services/api";
import { getSocket } from "../store/socket";

export default function MatchEditor({ matchId, onClose }) {
  const dispatch = useDispatch();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentInnings, setCurrentInnings] = useState(0);


  const [runs, setRuns] = useState(0);
  const [isWide, setIsWide] = useState(false);
  const [isNoBall, setIsNoBall] = useState(false);
  const [isBye, setIsBye] = useState(false);
  const [isLegBye, setIsLegBye] = useState(false);
  const [isWicket, setIsWicket] = useState(false);
  const [wicketType, setWicketType] = useState("");
  const [dismissedPlayerId, setDismissedPlayerId] = useState("");
  const [fielderId, setFielderId] = useState("");
  const [commentaryText, setCommentaryText] = useState("");
  const [tossWinnerId, setTossWinnerId] = useState("");
  const [tossDecision, setTossDecision] = useState("");
  const [showPlayingXISelector, setShowPlayingXISelector] = useState(false);
  const [selectedTeamForXI, setSelectedTeamForXI] = useState("");
  const [tempXI, setTempXI] = useState([]);


  const [batsman1, setBatsman1] = useState("");
  const [batsman2, setBatsman2] = useState("");
  const [onStrikeBatsman, setOnStrikeBatsman] = useState("");
  const [bowler, setBowler] = useState("");
  const [availablePlayers, setAvailablePlayers] = useState({ batting: [], bowling: [] });

  useEffect(() => {
    fetchMatch();

    const socket = getSocket();
    if (socket) {
      socket.emit("join-match", matchId);

      socket.on("match:ballUpdate", (data) => {
        if (data.matchId === matchId) {
          fetchMatch();
        }
      });

      socket.on("match:scoreUpdate", (data) => {
        if (data.matchId === matchId) {
          fetchMatch();
        }
      });

      socket.on("match:overComplete", (data) => {
        if (data.matchId === matchId) {
          fetchMatch();
          alert(`Over ${data.over.overNumber + 1} complete: ${data.over.summary}`);
        }
      });

      socket.on("match:inningsEnd", (data) => {
        if (data.matchId === matchId) {
          const confirmEnd = window.confirm(data.suggestion);
          if (confirmEnd) {
            handleEndInnings();
          }
        }
      });
    }

    return () => {
      if (socket) {
        socket.emit("leave-match", matchId);
        socket.off("match:ballUpdate");
        socket.off("match:scoreUpdate");
        socket.off("match:overComplete");
        socket.off("match:inningsEnd");
      }
    };
  }, [matchId]);

  // Load team players whenever match or innings changes
  useEffect(() => {
    if (match) {
      loadTeamPlayers();
    }
  }, [match?._id, match?.status, currentInnings]);

  const fetchMatch = async () => {
    try {
      const res = await api.get(`/matches/${matchId}`);
      setMatch(res.data);

      // Set current innings based on match data
      if (res.data.currentInnings !== undefined) {
        setCurrentInnings(res.data.currentInnings);
      }

      // Auto-select current players if available
      const innings = res.data.innings?.[currentInnings];
      if (innings) {
        if (innings.currentBatsman1) setBatsman1(innings.currentBatsman1._id || innings.currentBatsman1);
        if (innings.currentBatsman2) setBatsman2(innings.currentBatsman2._id || innings.currentBatsman2);
        if (innings.onStrikeBatsman) setOnStrikeBatsman(innings.onStrikeBatsman._id || innings.onStrikeBatsman);
        if (innings.currentBowler) setBowler(innings.currentBowler._id || innings.currentBowler);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load match");
    }
  };

  const loadTeamPlayers = async () => {
    try {
      if (!match || !match.teams || match.teams.length < 2) return;

      const battingTeamId = match.innings[currentInnings]?.team?._id || match.innings[currentInnings]?.team;
      if (!battingTeamId) return;

      const bowlingTeamId = match.teams.find(t => (t._id || t) !== battingTeamId);
      if (!bowlingTeamId) return;

      // Try to get Playing XI first
      const battingXI = match.playingXI?.find(xi => (xi.team?._id || xi.team) === (battingTeamId?._id || battingTeamId));
      const bowlingXI = match.playingXI?.find(xi => (xi.team?._id || xi.team) === (bowlingTeamId?._id || bowlingTeamId));

      let battingPlayers = [];
      let bowlingPlayers = [];

      // If Playing XI is set (usually 11 players), use it
      if (battingXI && battingXI.players?.length > 0) {
        battingPlayers = battingXI.players;
      } else {
        // Fallback to full squad
        const res = await api.get(`/teams/${battingTeamId?._id || battingTeamId}`);
        battingPlayers = res.data.players || res.data.playerList || [];
      }

      if (bowlingXI && bowlingXI.players?.length > 0) {
        bowlingPlayers = bowlingXI.players;
      } else {
        // Fallback to full squad
        const res = await api.get(`/teams/${bowlingTeamId?._id || bowlingTeamId}`);
        bowlingPlayers = res.data.players || res.data.playerList || [];
      }

      setAvailablePlayers({
        batting: battingPlayers,
        bowling: bowlingPlayers
      });
    } catch (err) {
      console.error("Error loading players:", err);
    }
  };

  const sendUpdate = async () => {
    if (!match || !batsman1 || !batsman2 || !bowler || !onStrikeBatsman) {
      alert("Please select both batsmen, bowler, and on-strike batsman");
      return;
    }

    setLoading(true);

    try {
      await dispatch(
        updateScore({
          matchId,
          inningsIndex: currentInnings,
          runs,
          isWide,
          isNoBall,
          isBye,
          isLegBye,
          isWicket,
          wicketType: isWicket ? wicketType : "",
          dismissedPlayerId: isWicket ? dismissedPlayerId : null,
          fielderId: isWicket && fielderId ? fielderId : null,
          batsmanOnStrikeId: onStrikeBatsman,
          batsmanNonStrikeId: onStrikeBatsman === batsman1 ? batsman2 : batsman1,
          bowlerId: bowler,
          commentaryText
        })
      ).unwrap();

      // Reset form
      resetScoringForm();

      if (isWicket) {
        if (dismissedPlayerId === batsman1) setBatsman1("");
        if (dismissedPlayerId === batsman2) setBatsman2("");
        setOnStrikeBatsman("");
      }

    } catch (err) {
      console.error(err);
      alert(err || "Error sending update");
    } finally {
      setLoading(false);
    }
  };

  const resetScoringForm = () => {
    setRuns(0);
    setIsWide(false);
    setIsNoBall(false);
    setIsBye(false);
    setIsLegBye(false);
    setIsWicket(false);
    setWicketType("");
    setDismissedPlayerId("");
    setFielderId("");
    setCommentaryText("");
  };

  const handleTossUpdate = async () => {
    if (!tossWinnerId || !tossDecision) {
      alert("Please select toss winner and decision");
      return;
    }

    setLoading(true);
    try {
      await dispatch(updateToss({ matchId, tossWinnerId, decision: tossDecision })).unwrap();
      alert("Toss updated successfully");
    } catch (err) {
      console.error(err);
      alert(err || "Error updating toss");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPlayingXI = async () => {
    if (tempXI.length !== 11) {
      alert("Please select exactly 11 players");
      return;
    }

    setLoading(true);
    try {
      await dispatch(setPlayingXI({
        matchId,
        teamId: selectedTeamForXI,
        players: tempXI
      })).unwrap();
      alert("Playing XI updated successfully");
      setShowPlayingXISelector(false);
      fetchMatch();
    } catch (err) {
      console.error(err);
      alert(err || "Error setting Playing XI");
    } finally {
      setLoading(false);
    }
  };

  const handleSetOpeners = async () => {
    if (!batsman1 || !batsman2) {
      alert("Please select both openers");
      return;
    }

    setLoading(true);
    try {
      await dispatch(setOpeners({
        matchId,
        inningsIndex: currentInnings,
        batsman1Id: batsman1,
        batsman2Id: batsman2
      })).unwrap();
      alert("Openers set successfully");
      fetchMatch();
    } catch (err) {
      console.error(err);
      alert(err || "Error setting openers");
    } finally {
      setLoading(false);
    }
  };

  const togglePlayerSelection = (playerId) => {
    if (tempXI.includes(playerId)) {
      setTempXI(tempXI.filter(id => id !== playerId));
    } else if (tempXI.length < 11) {
      setTempXI([...tempXI, playerId]);
    } else {
      alert("You can only select 11 players");
    }
  };

  const openXISelector = (teamId) => {
    const team = match.teams.find(t => (t._id || t) === teamId);
    setSelectedTeamForXI(teamId);
    const existingXI = match.playingXI?.find(xi => (xi.team?._id || xi.team) === teamId);
    setTempXI(existingXI ? existingXI.players.map(p => p._id || p) : []);
    setShowPlayingXISelector(true);
  };

  const handleEndInnings = async () => {
    try {
      await api.post(`/matches/${matchId}/end-innings`, {
        inningsIndex: currentInnings
      });
      fetchMatch();
      alert("Innings ended successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to end innings");
    }
  };

  const handleStartNextInnings = async () => {
    try {
      await api.post(`/matches/${matchId}/start-next-innings`);
      fetchMatch();
      setCurrentInnings(prev => prev + 1);
      loadTeamPlayers();
      alert("Next innings started");
    } catch (err) {
      console.error(err);
      alert("Failed to start next innings");
    }
  };

  const handleReduceOvers = async () => {
    const newOvers = prompt("Enter new total overs for the match:", match.totalOvers);
    if (newOvers === null || isNaN(newOvers)) return;

    const oversNum = parseInt(newOvers);
    if (oversNum >= match.totalOvers) {
      alert("New overs must be less than current total overs");
      return;
    }

    try {
      await api.post(`/matches/${matchId}/reduce-overs`, {
        newTotalOvers: oversNum
      });
      fetchMatch();
      alert(`Match reduced to ${oversNum} overs. Target updated if in 2nd innings.`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to reduce overs");
    }
  };

  if (!match) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-slate-600">Loading match...</p>
      </div>
    );
  }

  const innings = match.innings?.[currentInnings] || {};
  const currentOver = innings.oversHistory?.[innings.oversHistory.length - 1] || null;
  const ballsInCurrentOver = currentOver?.balls || [];

  const getTeamName = (team) => {
    if (!team) return "Team";
    return typeof team === 'object' ? team.name : "Team";
  };

  const getPlayerName = (player) => {
    if (!player) return "Not selected";
    return typeof player === 'object' ? player.name : "Player";
  };

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg">
        <h3 className="text-lg font-semibold">{match.title}</h3>
        <div className="flex items-center gap-4 mt-2 text-sm">
          {match.venue && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {match.venue}
            </span>
          )}
          <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
            {match.matchType || "T20"}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${match.status === "live"
            ? "bg-green-500 animate-pulse"
            : match.status === "innings-break"
              ? "bg-yellow-500"
              : "bg-white/20"
            }`}>
            {match.status?.toUpperCase().replace("-", " ")}
          </span>
          <button
            onClick={handleReduceOvers}
            className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded-full text-xs font-bold transition-colors border border-white/30"
          >
            REDUCE OVERS
          </button>
        </div>
      </div>

      {/* Toss Selection */}
      {!match.tossWinner && (
        <div className="card bg-blue-50 border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Toss Selection
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-blue-700 mb-1">Toss Winner</label>
              <select
                value={tossWinnerId}
                onChange={(e) => setTossWinnerId(e.target.value)}
                className="w-full p-2 border border-blue-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Team</option>
                {match.teams?.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-blue-700 mb-1">Decision</label>
              <select
                value={tossDecision}
                onChange={(e) => setTossDecision(e.target.value)}
                className="w-full p-2 border border-blue-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Decision</option>
                <option value="bat">Bat</option>
                <option value="bowl">Bowl</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleTossUpdate}
            disabled={loading || !tossWinnerId || !tossDecision}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            Update Toss
          </button>
        </div>
      )}

      {/* Playing XI Management */}
      <div className="grid grid-cols-2 gap-2">
        {match.teams?.map((team) => (
          <button
            key={team._id}
            onClick={() => openXISelector(team._id)}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold transition-colors border border-slate-200 flex items-center justify-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Set {team.name} XI
            {match.playingXI?.find(xi => (xi.team?._id || xi.team) === team._id)?.players?.length === 11 && " ✓"}
          </button>
        ))}
      </div>

      {showPlayingXISelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800">
                Select Playing XI - {match.teams.find(t => (t._id || t) === selectedTeamForXI)?.name}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${tempXI.length === 11 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                {tempXI.length} / 11 Selected
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
              {match.teams.find(t => (t._id || t) === selectedTeamForXI)?.players?.map((player) => (
                <button
                  key={player._id}
                  onClick={() => togglePlayerSelection(player._id)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${tempXI.includes(player._id)
                    ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                    : "bg-white border-slate-200 hover:border-blue-300"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${tempXI.includes(player._id) ? "bg-blue-500 border-blue-500" : "border-slate-300"
                      }`}>
                      {tempXI.includes(player._id) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-800 text-sm">{player.name}</p>
                      <p className="text-xs text-slate-500">{player.role}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 border-t bg-slate-50 flex gap-3">
              <button
                onClick={() => setShowPlayingXISelector(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg font-bold transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSetPlayingXI}
                disabled={loading || tempXI.length !== 11}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Playing XI"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Innings Selector */}
      {match.innings && match.innings.length > 1 && (
        <div className="flex gap-2">
          {match.innings.map((inn, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentInnings(idx);
                loadTeamPlayers();
              }}
              disabled={inn.status === "upcoming"}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${currentInnings === idx
                ? "bg-blue-600 text-white"
                : inn.status === "upcoming"
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
            >
              {getTeamName(inn.team)} Innings
              {inn.status === "completed" && " ✓"}
            </button>
          ))}
        </div>
      )}

      {/* Innings Break Message */}
      {match.status === "innings-break" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium mb-2">Innings Break</p>
          <p className="text-yellow-700 text-sm mb-3">
            {getTeamName(match.innings[0].team)} scored {match.innings[0].runs}/{match.innings[0].wickets}
            <br />
            {getTeamName(match.innings[1].team)} needs {match.innings[1].target} to win
          </p>
          <button
            onClick={handleStartNextInnings}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Start Next Innings
          </button>
        </div>
      )}

      {/* Scorecard */}
      <div className="grid grid-cols-2 gap-4">
        {match.innings.map((inn, idx) => (
          <div key={idx} className={`p-4 rounded-lg border-2 ${currentInnings === idx ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50"
            }`}>
            <p className="text-sm text-slate-600 mb-1">{getTeamName(inn.team)}</p>
            <div className="text-3xl font-bold text-slate-800">
              {inn.runs}/{inn.wickets}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              ({inn.overs}.{inn.balls || 0} overs)
            </p>
            {inn.runRate > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                RR: {inn.runRate}
                {inn.requiredRunRate > 0 && ` | RRR: ${inn.requiredRunRate}`}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Current Over Display */}
      {currentOver && ballsInCurrentOver.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-2">
            Current Over {currentOver.overNumber + 1}
          </p>
          <div className="flex gap-2 flex-wrap">
            {ballsInCurrentOver.map((ball, idx) => (
              <div key={idx} className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm ${ball.isWicket ? "bg-red-500 text-white" :
                ball.runs === 6 ? "bg-purple-500 text-white" :
                  ball.runs === 4 ? "bg-green-500 text-white" :
                    ball.isWide || ball.isNoBall ? "bg-orange-500 text-white" :
                      ball.runs === 0 ? "bg-slate-300 text-slate-700" :
                        "bg-blue-500 text-white"
                }`}>
                {ball.isWicket ? "W" :
                  ball.isWide ? "Wd" :
                    ball.isNoBall ? "Nb" :
                      ball.runs}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player Selection & Openers */}
      {innings.status !== "completed" && (
        <div className="card bg-white border border-slate-200">
          {(!innings.currentBatsman1 || !innings.currentBatsman2) && innings.runs === 0 && innings.wickets === 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Select Openers
              </h4>
              <p className="text-sm text-green-700 mb-4">Select the two opening batsmen to start the innings.</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-green-800 mb-1">Batsman 1</label>
                  <select
                    value={batsman1}
                    onChange={(e) => setBatsman1(e.target.value)}
                    className="w-full p-2 border border-green-300 rounded-lg text-sm bg-white outline-none"
                  >
                    <option value="">Select Batsman 1</option>
                    {availablePlayers.batting.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-green-800 mb-1">Batsman 2</label>
                  <select
                    value={batsman2}
                    onChange={(e) => setBatsman2(e.target.value)}
                    className="w-full p-2 border border-green-300 rounded-lg text-sm bg-white outline-none"
                  >
                    <option value="">Select Batsman 2</option>
                    {availablePlayers.batting.map(p => (
                      <option key={p._id} value={p._id} disabled={p._id === batsman1}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleSetOpeners}
                disabled={loading || !batsman1 || !batsman2}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                Start Innings with Openers
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Batsman 1 {batsman1 === onStrikeBatsman && "★"}
              </label>
              <select
                value={batsman1}
                onChange={(e) => {
                  setBatsman1(e.target.value);
                  if (!onStrikeBatsman) setOnStrikeBatsman(e.target.value);
                }}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Batsman 1</option>
                {availablePlayers.batting.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Batsman 2 {batsman2 === onStrikeBatsman && "★"}
              </label>
              <select
                value={batsman2}
                onChange={(e) => {
                  setBatsman2(e.target.value);
                  if (!onStrikeBatsman) setOnStrikeBatsman(e.target.value);
                }}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Batsman 2</option>
                {availablePlayers.batting.map(p => (
                  <option key={p._id} value={p._id} disabled={p._id === batsman1}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                On Strike Batsman
              </label>
              <select
                value={onStrikeBatsman}
                onChange={(e) => setOnStrikeBatsman(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select On Strike</option>
                {batsman1 && <option value={batsman1}>{getPlayerName(availablePlayers.batting.find(p => p._id === batsman1))}</option>}
                {batsman2 && batsman2 !== batsman1 && <option value={batsman2}>{getPlayerName(availablePlayers.batting.find(p => p._id === batsman2))}</option>}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Bowler
              </label>
              <select
                value={bowler}
                onChange={(e) => setBowler(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Bowler</option>
                {availablePlayers.bowling.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Run Buttons */}
      {innings.status !== "completed" && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Runs Scored</label>
          <div className="grid grid-cols-7 gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((r) => (
              <button
                key={r}
                onClick={() => setRuns(r)}
                className={`px-4 py-3 rounded-lg font-bold transition-colors ${runs === r
                  ? r === 0 ? "bg-slate-700 text-white"
                    : r === 4 ? "bg-green-600 text-white"
                      : r === 6 ? "bg-purple-600 text-white"
                        : "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Extras & Wicket */}
      {innings.status !== "completed" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Extras</label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isWide}
                onChange={(e) => setIsWide(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Wide</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isNoBall}
                onChange={(e) => setIsNoBall(e.target.checked)}
                className="w-4 h-4"
              />
              <span>No Ball</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isBye}
                onChange={(e) => setIsBye(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Bye</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isLegBye}
                onChange={(e) => setIsLegBye(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Leg Bye</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isWicket}
                onChange={(e) => setIsWicket(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="font-medium">Wicket</span>
            </label>

            {isWicket && (
              <>
                <select
                  value={wicketType}
                  onChange={(e) => setWicketType(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Wicket Type</option>
                  <option value="bowled">Bowled</option>
                  <option value="caught">Caught</option>
                  <option value="lbw">LBW</option>
                  <option value="run out">Run Out</option>
                  <option value="stumped">Stumped</option>
                  <option value="hit wicket">Hit Wicket</option>
                </select>

                <select
                  value={dismissedPlayerId}
                  onChange={(e) => setDismissedPlayerId(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Dismissed Player</option>
                  {batsman1 && <option value={batsman1}>{getPlayerName(availablePlayers.batting.find(p => p._id === batsman1))}</option>}
                  {batsman2 && <option value={batsman2}>{getPlayerName(availablePlayers.batting.find(p => p._id === batsman2))}</option>}
                </select>

                {(wicketType === "caught" || wicketType === "run out" || wicketType === "stumped") && (
                  <select
                    value={fielderId}
                    onChange={(e) => setFielderId(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">Fielder (Optional)</option>
                    {availablePlayers.bowling.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Commentary */}
      {innings.status !== "completed" && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Custom Commentary (Optional)
          </label>
          <textarea
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={commentaryText}
            onChange={(e) => setCommentaryText(e.target.value)}
            placeholder="Add custom commentary for this ball..."
            rows={2}
          />
        </div>
      )}

      {/* Submit Button */}
      {innings.status !== "completed" && (
        <div className="flex gap-2">
          <button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            onClick={sendUpdate}
            disabled={loading || !batsman1 || !batsman2 || !bowler || !onStrikeBatsman}
          >
            {loading ? "Recording..." : "Record Ball"}
          </button>

          <button
            onClick={handleEndInnings}
            className="px-6 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            End Innings
          </button>
        </div>
      )}

      {currentOver && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Ball by Ball Commentary
          </label>
          <div className="max-h-60 overflow-y-auto space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            {[...ballsInCurrentOver].reverse().map((ball, i) => (
              <div key={i} className="p-3 bg-white rounded border border-slate-200">
                <div className="flex items-center justify-between mb-1">
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
                <p className="text-sm text-slate-700">{ball.commentary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {innings.oversHistory && innings.oversHistory.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Recent Overs
          </label>
          <div className="max-h-40 overflow-y-auto space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            {[...innings.oversHistory].reverse().slice(0, 5).map((over, i) => (
              <div key={i} className="p-2 bg-white rounded text-sm border border-slate-200">
                <span className="font-semibold text-blue-600">Over {over.overNumber + 1}: </span>
                {over.summary}
              </div>
            ))}
          </div>
        </div>
      )}

      {onClose && (
        <button
          onClick={onClose}
          className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      )}
    </div>
  );
}