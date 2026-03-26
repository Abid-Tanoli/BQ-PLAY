import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateScore, updateToss, setPlayingXI, setOpeners, resolveTie, startSuperOver } from "../store/slices/matchesSlice";
import api from "../services/api";
import { getSocket } from "../store/socket";

export default function MatchEditor({ matchId, onClose, isEmbedded = false }) {
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

  // Super Over selection state
  const [soBatsmen, setSoBatsmen] = useState(["", "", ""]);
  const [soBowler, setSoBowler] = useState("");
  const [showSuperOverSelector, setShowSuperOverSelector] = useState(false);

  const [batsman1, setBatsman1] = useState("");
  const [batsman2, setBatsman2] = useState("");
  const [onStrikeBatsman, setOnStrikeBatsman] = useState("");
  const [bowler, setBowler] = useState("");
  const [showBatsmanPicker, setShowBatsmanPicker] = useState(false);
  const [showBowlerPicker, setShowBowlerPicker] = useState(false);
  const [pickingForSlot, setPickingForSlot] = useState(1); // 1 or 2 for batsmen
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
          setBowler(""); 
          setShowBowlerPicker(true);
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
  }, [match?._id, match?.status, match?.innings?.[currentInnings]?.batting?.length, currentInnings]);

  const fetchMatch = async () => {
    try {
      const res = await api.get(`/matches/${matchId}`);
      setMatch(res.data);

      // Set current innings based on match data
      if (res.data.currentInnings !== undefined) {
        setCurrentInnings(res.data.currentInnings);
      }

      // Auto-select current players if available, but filter out those who are out
      const innings = res.data.innings?.[currentInnings];
      if (innings) {
        const b1Id = innings.currentBatsman1?._id || innings.currentBatsman1;
        const b2Id = innings.currentBatsman2?._id || innings.currentBatsman2;
        const b1Stats = innings.batting?.find(b => (b.player?._id || b.player) === b1Id);
        const b2Stats = innings.batting?.find(b => (b.player?._id || b.player) === b2Id);
        
        // Conditionally update batsmen only if they are currently empty or if it's a fresh load
        if (!batsman1 || batsman1 === "") {
          if (b1Id && !b1Stats?.isOut) setBatsman1(b1Id);
        }
        if (!batsman2 || batsman2 === "") {
          if (b2Id && !b2Stats?.isOut) setBatsman2(b2Id);
        }
        
        if (!onStrikeBatsman || onStrikeBatsman === "") {
          if (innings.onStrikeBatsman) {
            const sId = innings.onStrikeBatsman._id || innings.onStrikeBatsman;
            const sStats = innings.batting?.find(b => (b.player?._id || b.player) === sId);
            if (!sStats?.isOut) setOnStrikeBatsman(sId);
          }
        }
        
        if (!bowler || bowler === "") {
          const currentBowlerId = innings.currentBowler?._id || innings.currentBowler;
          const lastOver = innings.oversHistory?.[innings.oversHistory.length - 1];
          // Determine if the last over is truly complete (has 6 legal deliveries)
          const isLastOverComplete = lastOver && lastOver.balls.filter(b => !b.isWide && !b.isNoBall).length >= 6;
          const lastBowlerId = lastOver?.bowler?._id || lastOver?.bowler;
          
          if (isLastOverComplete && lastBowlerId?.toString() === currentBowlerId?.toString()) {
            // Over is complete, we must NOT use the last bowler
            setShowBowlerPicker(true);
          } else if (currentBowlerId) {
            setBowler(currentBowlerId);
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load match");
    }
  };

  // Auto-select dismissed player for non-run-out wickets
  useEffect(() => {
    if (isWicket && wicketType && wicketType !== "run out" && onStrikeBatsman) {
      setDismissedPlayerId(onStrikeBatsman);
    }
  }, [isWicket, wicketType, onStrikeBatsman]);

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

      // Filter out players who are already out in this innings
      const innings = match.innings?.[currentInnings];
      if (innings && innings.batting) {
        battingPlayers = battingPlayers.filter(p => {
          const batStats = innings.batting.find(b => (b.player?._id || b.player) === p._id);
          return !batStats?.isOut;
        });
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

    if (isWicket && (!wicketType || !dismissedPlayerId)) {
      alert("Please select wicket type and dismissed player");
      return;
    }

    setLoading(true);

    try {
      const result = await dispatch(
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

      // Update immediate state for real-time responsiveness
      if (result.match) {
        setMatch(result.match);
        // Apply server-computed strike rotation and filter out 'out' players
        const updatedInnings = result.match.innings?.[currentInnings];
        if (updatedInnings) {
          const b1Id = updatedInnings.currentBatsman1?._id || updatedInnings.currentBatsman1;
          const b2Id = updatedInnings.currentBatsman2?._id || updatedInnings.currentBatsman2;
          
          const b1Stats = updatedInnings.batting?.find(b => (b.player?._id || b.player) === b1Id);
          const b2Stats = updatedInnings.batting?.find(b => (b.player?._id || b.player) === b2Id);
          
          if (b1Id && !b1Stats?.isOut) {
            setBatsman1(b1Id);
          } else if (b1Stats?.isOut) {
            setBatsman1("");
            setPickingForSlot(1);
            setShowBatsmanPicker(true);
          }
          
          if (b2Id && !b2Stats?.isOut) {
            setBatsman2(b2Id);
          } else if (b2Stats?.isOut) {
            setBatsman2("");
            setPickingForSlot(2);
            setShowBatsmanPicker(true);
          }

          if (updatedInnings.onStrikeBatsman) {
            const sId = updatedInnings.onStrikeBatsman._id || updatedInnings.onStrikeBatsman;
            const sStats = updatedInnings.batting?.find(b => (b.player?._id || b.player) === sId);
            if (!sStats?.isOut) setOnStrikeBatsman(sId);
          }
          if (updatedInnings.currentBowler) setBowler(updatedInnings.currentBowler._id || updatedInnings.currentBowler);
        }
      }

      // Reset form
      resetScoringForm();

      if (result.isOverComplete) {
        setBowler(""); // Force bowler change if over complete
      }

      if (isWicket) {
        if (dismissedPlayerId === batsman1) {
          setBatsman1("");
          setPickingForSlot(1);
          setShowBatsmanPicker(true);
        } else if (dismissedPlayerId === batsman2) {
          setBatsman2("");
          setPickingForSlot(2);
          setShowBatsmanPicker(true);
        }
        
        // Decide who takes strike next, relying on backend's calculated onStrikeBatsman
        const nextStrikerId = result.match.innings?.[currentInnings]?.onStrikeBatsman?._id || result.match.innings?.[currentInnings]?.onStrikeBatsman;
        if (nextStrikerId === dismissedPlayerId) {
           setOnStrikeBatsman(""); // Will be assigned to the new player
        } else if (nextStrikerId) {
           setOnStrikeBatsman(nextStrikerId); // Retain original orientation / swapped orientation
        }
      }

      if (result.isOverComplete) {
        setBowler("");
        setShowBowlerPicker(true);
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

  const handleResolveTie = async (resolution) => {
    try {
      await dispatch(resolveTie({ matchId, resolution })).unwrap();
      
      if (resolution === "super_over") {
        setShowSuperOverSelector(true);
      } else {
        alert(`Tie resolved: ${resolution}`);
      }
      fetchMatch();
    } catch (err) {
      console.error(err);
      alert(err || "Failed to resolve tie");
    }
  };

  const handleStartSuperOver = async () => {
    if (soBatsmen.some(id => !id) || !soBowler) {
      alert("Please select 3 batsmen and 1 bowler");
      return;
    }

    setLoading(true);
    try {
      await dispatch(startSuperOver({
        matchId,
        batsmenIds: soBatsmen,
        bowlerId: soBowler
      })).unwrap();
      alert("Super Over started!");
      setShowSuperOverSelector(false);
      fetchMatch();
    } catch (err) {
      console.error(err);
      alert(err || "Failed to start Super Over");
    } finally {
      setLoading(false);
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
  const isOverComplete = innings.balls > 0 && innings.balls % 6 === 0;

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
      {!isEmbedded && (
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
      )}

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

      {/* Tie Resolution UI */}
      {match.status === "pending_tie_resolution" && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Match Tied - Resolution Required
          </h4>
          <p className="text-sm text-purple-700 mb-4">
            The match has ended in a tie. Please select how to resolve it.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleResolveTie("declared_tie")}
              className="flex-1 bg-white border border-purple-300 hover:bg-purple-100 text-purple-700 py-2 rounded-lg font-medium transition-colors"
            >
              Declare Tie
            </button>
            <button
              onClick={() => handleResolveTie("super_over")}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Start Super Over
            </button>
          </div>
        </div>
      )}

      {/* Super Over Selection Modal */}
      {showSuperOverSelector && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Start Super Over</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select 3 Batsmen</label>
                <div className="space-y-2">
                  {[0, 1, 2].map(i => (
                    <select
                      key={i}
                      value={soBatsmen[i]}
                      onChange={(e) => {
                        const newBatsmen = [...soBatsmen];
                        newBatsmen[i] = e.target.value;
                        setSoBatsmen(newBatsmen);
                      }}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="">Select Batsman {i + 1}</option>
                      {availablePlayers.batting.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Bowler</label>
                <select
                  value={soBowler}
                  onChange={(e) => setSoBowler(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="">Select Bowler</option>
                  {availablePlayers.bowling.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSuperOverSelector(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleStartSuperOver}
                disabled={loading || soBatsmen.some(id => !id) || !soBowler}
                className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-bold disabled:opacity-50"
              >
                {loading ? "Starting..." : "Start Innings"}
              </button>
            </div>
          </div>
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
              ({inn.balls % 6 === 0 && inn.balls > 0 ? `${inn.balls / 6}.0` : `${Math.floor(inn.balls / 6)}.${inn.balls % 6}`} overs)
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

      {/* Current Over or Last Over Display */}
      {(ballsInCurrentOver.length > 0 || isOverComplete) && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-2 flex justify-between">
            <span>{isOverComplete ? `Over ${Math.floor(innings.balls / 6)} Complete` : `Over ${Math.floor(innings.balls / 6) + 1} in progress`}</span>
            {isOverComplete && <span className="text-blue-600 font-bold">{currentOver?.summary}</span>}
          </p>
          <div className="flex gap-2 flex-wrap">
            {isOverComplete && !ballsInCurrentOver.length ? (
              // If over is complete and we haven't started new one, show last over balls
              innings.oversHistory?.[innings.oversHistory.length - 1]?.balls.map((ball, idx) => (
                <div key={idx} className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-xs bg-slate-200 text-slate-600 opacity-60`}>
                  {ball.isWicket ? "W" : ball.isWide ? "Wd" : ball.isNoBall ? "Nb" : ball.runs}
                </div>
              ))
            ) : (
              ballsInCurrentOver.map((ball, idx) => (
                <div key={idx} className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm shadow-sm ${ball.isWicket ? "bg-red-500 text-white" :
                  ball.runs === 6 ? "bg-purple-500 text-white" :
                    ball.runs === 4 ? "bg-green-500 text-white" :
                      ball.isWide || ball.isNoBall ? "bg-orange-500 text-white" :
                        ball.runs === 0 ? "bg-slate-300 text-slate-700" :
                          "bg-blue-500 text-white"
                  }`}>
                  {ball.isWicket ? "W" :
                    ball.isWide ? `${1 + ball.runs}w` :
                      ball.isNoBall ? `${1 + ball.runs}nb` :
                        ball.isBye ? `${ball.runs}b` :
                          ball.isLegBye ? `${ball.runs}lb` :
                            ball.runs === 0 ? "•" : ball.runs}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Cricinfo Style Live Status Header */}
      {innings.status === "live" && (
        <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">

          
          {/* BATTERS TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f1f1f1] text-[#666666] text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 font-black">Batters</th>
                  <th className="px-4 py-2 text-center w-12 font-black">R</th>
                  <th className="px-4 py-2 text-center w-12 font-black">B</th>
                  <th className="px-4 py-2 text-center w-12 font-black">4s</th>
                  <th className="px-4 py-2 text-center w-12 font-black">6s</th>
                  <th className="px-4 py-2 text-right w-20 font-black">SR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { id: batsman1, slot: 1, name: getPlayerName(availablePlayers.batting.find(p => p._id === batsman1)) },
                  { id: batsman2, slot: 2, name: getPlayerName(availablePlayers.batting.find(p => p._id === batsman2)) }
                ].map((b, idx) => {
                  const isOnStrike = b.id === onStrikeBatsman;
                  // Aggregate stats if duplicates exist
                  const playerStatsList = innings.batting?.filter(ps => (ps.player?._id || ps.player) === b.id) || [];
                  const stats = playerStatsList.reduce((acc, curr) => ({
                     runs: (acc.runs || 0) + (curr.runs || 0),
                     balls: (acc.balls || 0) + (curr.balls || 0),
                     fours: (acc.fours || 0) + (curr.fours || 0),
                     sixes: (acc.sixes || 0) + (curr.sixes || 0),
                     isOut: acc.isOut || curr.isOut,
                     strikeRate: 0 // calculated below
                  }), { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false });
                  
                  if (stats.balls > 0) {
                     stats.strikeRate = ((stats.runs / stats.balls) * 100).toFixed(2);
                  } else {
                     stats.strikeRate = "0.00";
                  }
                  
                  return (
                    <tr 
                      key={idx}
                      onClick={() => {
                        setPickingForSlot(b.slot);
                        setShowBatsmanPicker(true);
                      }}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className={`px-4 py-3 ${isOnStrike ? 'font-black text-slate-800' : 'font-bold text-slate-600'}`}>
                        {b.name || "Select Batsman"}
                        {isOnStrike && <span className="text-red-500 ml-1 font-bold">*</span>}
                        <span className="text-slate-400 text-[10px] ml-2 font-normal uppercase">Batter {b.slot}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-800">{stats.runs}</td>
                      <td className="px-4 py-3 text-center text-slate-500">{stats.balls}</td>
                      <td className="px-4 py-3 text-center text-slate-500">{stats.fours}</td>
                      <td className="px-4 py-3 text-center text-slate-500">{stats.sixes}</td>
                      <td className="px-4 py-3 text-right text-slate-500">{stats.strikeRate}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* BOWLERS TABLE */}
          <div className="overflow-x-auto border-t border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f1f1f1] text-[#666666] text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 font-black">Bowler</th>
                  <th className="px-4 py-2 text-center w-12 font-black">O</th>
                  <th className="px-4 py-2 text-center w-12 font-black">M</th>
                  <th className="px-4 py-2 text-center w-12 font-black">R</th>
                  <th className="px-4 py-2 text-center w-12 font-black">W</th>
                  <th className="px-4 py-2 text-right w-20 font-black">Econ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(() => {
                  const prevOver = innings.oversHistory?.[innings.oversHistory.length - 1];
                  const prevBowlerId = prevOver ? (prevOver.bowler?._id || prevOver.bowler) : null;
                  
                  // Construct bowler list: current bowler first, then previous if it exists and is different
                  const bowlerIds = [];
                  if (bowler) bowlerIds.push(bowler);
                  if (prevBowlerId && prevBowlerId !== bowler) bowlerIds.push(prevBowlerId);

                  return bowlerIds.map((bId, idx) => {
                    const bList = innings.bowling?.filter(bw => (bw.player?._id || bw.player) === bId) || [];
                    const bStats = bList.reduce((acc, curr) => ({
                      runs: acc.runs + curr.runs,
                      balls: acc.balls + curr.balls,
                      wickets: acc.wickets + (curr.wickets || 0)
                    }), { runs: 0, balls: 0, wickets: 0 });
                    const bOversNum = Math.floor(bStats.balls / 6) + (bStats.balls % 6) / 6;
                    const bEcon = bOversNum > 0 ? (bStats.runs / bOversNum).toFixed(2) : "0.00";
                    const bOversFormatted = `${Math.floor(bStats.balls / 6)}.${bStats.balls % 6}`;

                    const isCurrent = bId === bowler;

                    return (
                      <tr 
                        key={`${bId}-${idx}`}
                        onClick={() => {
                          if (isCurrent) setShowBowlerPicker(true);
                        }}
                        className={`hover:bg-slate-50 transition-colors ${isCurrent ? 'cursor-pointer' : ''}`}
                      >
                        <td className={`px-4 py-3 ${isCurrent ? 'font-black text-slate-800' : 'font-bold text-slate-500'}`}>
                          {getPlayerName(availablePlayers.bowling.find(p => p._id === bId)) || "Select Bowler"}
                          {isCurrent && <span className="text-red-500 ml-1 font-bold">*</span>}
                        </td>
                        <td className="px-4 py-3 text-center">{bOversFormatted}</td>
                        <td className="px-4 py-3 text-center text-slate-500">0</td>
                        <td className="px-4 py-3 text-center text-slate-500">{bStats.runs}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-800">{bStats.wickets}</td>
                        <td className="px-4 py-3 text-right text-slate-500">{bEcon}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

          {/* Footer Info & Actions */}
          <div className="bg-white px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-[13px] text-slate-800">
              <div>
                <span className="text-slate-500">Partnership:</span> 
                <span className="font-bold ml-1">{innings.batting?.filter(b => !b.isOut).reduce((sum, b) => sum + b.runs, 0) || 0} Runs</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-400 hidden sm:block" />
              <div>
                <span className="text-slate-500">Last Wicket:</span> 
                <span className="font-bold ml-1 text-red-600">
                  {innings.fallOfWickets?.[innings.fallOfWickets.length - 1]?.runs || 0}/{innings.fallOfWickets?.[innings.fallOfWickets.length - 1]?.wickets || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                 onClick={() => setOnStrikeBatsman(onStrikeBatsman === batsman1 ? batsman2 : batsman1)}
                 className="px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-bold uppercase tracking-wider transition-colors"
              >
                 Swap Strike
              </button>
              <button 
                 onClick={() => setShowBowlerPicker(true)}
                 className="px-4 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[11px] font-bold uppercase tracking-wider transition-colors"
              >
                 Change Bowler
              </button>
            </div>
          </div>
          
          {innings.isFreeHit && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter animate-pulse shadow-lg shadow-red-900/50 z-20">
               Free Hit!
            </div>
          )}
        </div>
      )}

      {/* Selector Modals */}
      {showBatsmanPicker && (
         <PlayerSelectorModal 
           title={`Select Batsman ${pickingForSlot}`}
           players={availablePlayers.batting.filter(p => p._id !== (pickingForSlot === 1 ? batsman2 : batsman1))}
           onSelect={(id) => {
             if (pickingForSlot === 1) setBatsman1(id); else setBatsman2(id);
             if (!onStrikeBatsman) setOnStrikeBatsman(id);
             setShowBatsmanPicker(false);
           }}
           onClose={() => setShowBatsmanPicker(false)}
         />
      )}

      {showBowlerPicker && (
         <PlayerSelectorModal 
           title="Select New Bowler"
           players={availablePlayers.bowling}
           lastBowlerId={innings.oversHistory?.[innings.oversHistory.length - 1]?.bowler?._id || innings.oversHistory?.[innings.oversHistory.length - 1]?.bowler}
           onSelect={(id) => {
             setBowler(id);
             setShowBowlerPicker(false);
           }}
           onClose={() => setShowBowlerPicker(false)}
         />
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

      {/* Ball Summary Preview */}
      {innings.status !== "completed" && (onStrikeBatsman || batsman1 || batsman2) && (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between text-sm">
          <div className="flex flex-col">
            <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Ball Summary</span>
            <div className="flex gap-3 mt-1">
              <span className="font-bold text-blue-700">
                Total: {isWide || isNoBall ? 1 + runs : runs} Runs
              </span>
              {(isWide || isNoBall || isBye || isLegBye) && (
                <span className="text-slate-600">
                  Extras: {isWide || isNoBall ? 1 + (isWide ? runs : 0) : runs}
                </span>
              )}
              {(!isWide && !isBye && !isLegBye) && (
                <span className="text-slate-600">
                  Batsman: {runs}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
             <span className="text-xs text-slate-500 block">Striker</span>
             <span className="font-medium text-blue-700">{getPlayerName(availablePlayers.batting.find(p => p._id === onStrikeBatsman))}</span>
          </div>
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

      {innings.oversHistory && innings.oversHistory.length > 0 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Innings Commentary
          </label>
          <div className="max-h-[500px] overflow-y-auto space-y-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            {[...innings.oversHistory].reverse().map((ov, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between bg-blue-100 p-2 rounded border border-blue-200">
                  <span className="font-bold text-blue-800">Over {ov.overNumber + 1}</span>
                  <span className="text-sm font-medium text-blue-700">{ov.summary}</span>
                </div>
                <div className="space-y-2 pl-2 border-l-2 border-slate-200">
                  {[...ov.balls].reverse().map((ball, i) => (
                    <div key={i} className="p-3 bg-white rounded border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-blue-600">
                          {ov.overNumber}.{ball.ballNumber}
                        </span>
                        <div className="flex gap-2 items-center">
                          <span className="text-xs text-slate-500">{new Date(ball.timestamp).toLocaleTimeString()}</span>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${ball.isWicket ? "bg-red-500 text-white" :
                            ball.runs === 6 ? "bg-purple-600 text-white" :
                              ball.runs === 4 ? "bg-green-600 text-white" :
                                ball.isWide || ball.isNoBall ? "bg-orange-500 text-white" :
                                  "bg-slate-100 text-slate-700"
                            }`}>
                            {ball.isWicket ? "WICKET" :
                              ball.isWide ? "WD" :
                                ball.isNoBall ? "NB" :
                                  `${ball.runs} ${ball.runs === 1 ? "RUN" : "RUNS"}`}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700">{ball.commentary}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Overs Summary */}
      {innings.oversHistory && innings.oversHistory.length > 0 && (
        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
          <label className="block text-sm font-bold text-blue-800 mb-2">
            Overs Summary
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[...innings.oversHistory].reverse().map((over, i) => (
              <div key={i} className="p-3 bg-white rounded-lg text-sm border border-blue-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-700">Over {over.overNumber + 1}: </span>
                  <span className="text-slate-700">{over.summary}</span>
                </div>
                <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  {over.bowler?.name || "Bowler"}
                </div>
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

// Helper Modal Component
function PlayerSelectorModal({ title, players, onSelect, onClose, lastBowlerId }) {
  return (
    <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="bg-[#031d44] p-8 text-white relative">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -mr-16 -mt-16" />
           <h3 className="text-2xl font-black uppercase tracking-tighter mb-1 relative z-10">{title}</h3>
           <p className="text-blue-300/80 text-xs font-bold uppercase tracking-widest relative z-10">Select a player to continue</p>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
           <div className="grid grid-cols-1 gap-3">
              {players.map((player) => {
                const isDisabled = (player._id || player) === lastBowlerId;
                return (
                  <button
                    key={player._id || player}
                    disabled={isDisabled}
                    onClick={() => onSelect(player._id || player)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                      isDisabled 
                        ? "bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed" 
                        : "bg-white border-slate-200 hover:border-blue-500 hover:shadow-md active:scale-[0.98]"
                    }`}
                  >
                    <div>
                      <p className="font-black text-[#031d44] uppercase tracking-tight">{player.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{player.role}</p>
                    </div>
                    {isDisabled && <span className="text-[10px] font-black text-red-500 uppercase italic">Just Bowled</span>}
                    {!isDisabled && (
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7"/></svg>
                      </div>
                    )}
                  </button>
                );
              })}
           </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
           <button 
             onClick={onClose}
             className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-white/80 transition-all"
           >
             Cancel
           </button>
        </div>
      </div>
    </div>
  );
}