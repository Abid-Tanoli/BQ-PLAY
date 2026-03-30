import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMatches, createMatch, updateMatch, deleteMatch, setPlayingXI } from "../store/slices/matchesSlice";
import { fetchTeams } from "../store/slices/teamSlice";
import { useForm } from "react-hook-form";
import { initSocket } from "../store/socket";
import api from "../services/api";

export default function ManageMatches() {
  const dispatch = useDispatch();
  const { matches, loading, error } = useSelector((state) => state.matches);
  const { teams } = useSelector((state) => state.teams);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  // Playing XI Selector State
  const [showPlayingXIModal, setShowPlayingXIModal] = useState(false);
  const [selectedMatchForXI, setSelectedMatchForXI] = useState(null);
  const [selectedTeamForXI, setSelectedTeamForXI] = useState(null);
  const [tempXI, setTempXI] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [xiLoading, setXiLoading] = useState(false);

  // Powerplay State
  const [powerplayEnabled, setPowerplayEnabled] = useState(false);
  const [powerplayOvers, setPowerplayOvers] = useState(2);

  const teamAValue = watch("teamA");
  const teamBValue = watch("teamB");
  const matchTypeValue = watch("matchType");

  useEffect(() => {
    dispatch(fetchMatches());
    dispatch(fetchTeams());

    const socket = initSocket();

    socket.on("match:created", () => {
      dispatch(fetchMatches());
    });

    socket.on("match:updated", () => {
      dispatch(fetchMatches());
    });

    socket.on("match:deleted", () => {
      dispatch(fetchMatches());
    });

    socket.on("match:updateList", () => {
      dispatch(fetchMatches());
    });

    return () => {
      socket.off("match:created");
      socket.off("match:updated");
      socket.off("match:deleted");
      socket.off("match:updateList");
    };
  }, [dispatch]);

  const onSubmit = async (data) => {
    if (data.teamA === data.teamB) {
      alert("Team A and Team B must be different!");
      return;
    }

    try {
      const teamA = teams.find((t) => t._id === data.teamA);
      const teamB = teams.find((t) => t._id === data.teamB);

      if (!teamA || !teamB) {
        alert("Please select valid teams");
        return;
      }

      const matchData = {
        title: `${teamA.name} vs ${teamB.name}`,
        teams: [data.teamA, data.teamB],
        startAt: data.startTime,
        venue: data.venue || "",
        matchType: data.matchType || "T20",
        powerplayConfig: {
          enabled: powerplayEnabled,
          overs: powerplayEnabled ? powerplayOvers : 0
        }
      };

      if (editingMatchId) {
        await dispatch(updateMatch({ id: editingMatchId, data: matchData })).unwrap();
        setEditingMatchId(null);
      } else {
        await dispatch(createMatch(matchData)).unwrap();
      }

      reset();
    } catch (err) {
      console.error("Failed to save match:", err);
      alert(err || "Failed to save match");
    }
  };

  const onEdit = (match) => {
    setEditingMatchId(match._id);

    const teamAId = match.teams?.[0]?._id || match.teams?.[0];
    const teamBId = match.teams?.[1]?._id || match.teams?.[1];

    setValue("teamA", teamAId);
    setValue("teamB", teamBId);
    setValue("startTime", new Date(match.startAt).toISOString().slice(0, 16));
    setValue("venue", match.venue || "");
    setValue("matchType", match.matchType || "T20");
    
    // Load existing powerplay config
    if (match.powerplayConfig) {
      setPowerplayEnabled(match.powerplayConfig.enabled || false);
      setPowerplayOvers(match.powerplayConfig.overs || 2);
    } else {
      setPowerplayEnabled(false);
      setPowerplayOvers(2);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this match?")) return;

    try {
      await dispatch(deleteMatch(id)).unwrap();
    } catch (err) {
      console.error("Failed to delete match:", err);
      alert(err || "Failed to delete match");
    }
  };

  const cancelEdit = () => {
    setEditingMatchId(null);
    reset();
    setPowerplayEnabled(false);
    setPowerplayOvers(2);
  };

  const openXISelector = async (match, teamId) => {
    setSelectedMatchForXI(match);
    setSelectedTeamForXI(teamId);
    setXiLoading(true);
    setShowPlayingXIModal(true);

    try {
      // Fetch full team data to get all players
      const res = await api.get(`/teams/${teamId}`);
      setTeamPlayers(res.data.players || res.data.playerList || []);

      // Load existing XI if any
      const existingXI = match.playingXI?.find(xi => (xi.team?._id || xi.team) === teamId);
      setTempXI(existingXI ? existingXI.players.map(p => p._id || p) : []);
    } catch (err) {
      console.error("Error loading team players:", err);
      alert("Failed to load team players");
    } finally {
      setXiLoading(false);
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

  const savePlayingXI = async () => {
    if (tempXI.length !== 11) {
      alert("Please select exactly 11 players");
      return;
    }

    setXiLoading(true);
    try {
      await dispatch(setPlayingXI({
        matchId: selectedMatchForXI._id,
        teamId: selectedTeamForXI,
        players: tempXI
      })).unwrap();

      alert("Playing XI updated successfully");
      setShowPlayingXIModal(false);
      dispatch(fetchMatches());
    } catch (err) {
      console.error("Error saving Playing XI:", err);
      alert(err || "Failed to save Playing XI");
    } finally {
      setXiLoading(false);
    }
  };

  const getTeamName = (team) => {
    if (!team) return "Unknown Team";
    if (typeof team === 'string') {
      const foundTeam = teams.find(t => t._id === team);
      return foundTeam?.name || "Unknown Team";
    }
    return team.name || "Unknown Team";
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manage Matches</h2>
          <p className="text-sm text-slate-600 mt-1">
            {matches.length} total matches
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              {editingMatchId ? "Edit Match" : "Create New Match"}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Team A *
                </label>
                <select
                  {...register("teamA", { required: "Team A is required" })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Select Team A</option>
                  {teams.map((t) => (
                    <option
                      key={t._id}
                      value={t._id}
                      disabled={t._id === teamBValue}
                    >
                      {t.name}
                    </option>
                  ))}
                </select>
                {errors.teamA && (
                  <p className="text-red-500 text-xs mt-1">{errors.teamA.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Team B *
                </label>
                <select
                  {...register("teamB", { required: "Team B is required" })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Select Team B</option>
                  {teams.map((t) => (
                    <option
                      key={t._id}
                      value={t._id}
                      disabled={t._id === teamAValue}
                    >
                      {t.name}
                    </option>
                  ))}
                </select>
                {errors.teamB && (
                  <p className="text-red-500 text-xs mt-1">{errors.teamB.message}</p>
                )}
                {teamAValue && teamBValue && teamAValue === teamBValue && (
                  <p className="text-orange-500 text-xs mt-1">
                    Teams must be different
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Match Type
                </label>
                <select
                  {...register("matchType")}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="6 Overs">T6 (6 overs)</option>
                  <option value="8 Overs">T8 (8 overs)</option>
                  <option value="T10">T10 (10 overs)</option>
                  <option value="T20">T20 (20 overs)</option>
                  <option value="ODI">ODI (50 overs)</option>
                  <option value="Test">Test Match</option>
                  <option value="Tape Ball">Tape Ball</option>
                </select>
              </div>

              {/* Powerplay Configuration - Only for Tape Ball */}
              {matchTypeValue === "Tape Ball" && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <label className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      checked={powerplayEnabled}
                      onChange={(e) => setPowerplayEnabled(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Enable Powerplay
                    </span>
                  </label>

                  {powerplayEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Powerplay Overs
                      </label>
                      <select
                        value={powerplayOvers}
                        onChange={(e) => setPowerplayOvers(Number(e.target.value))}
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      >
                        {[1, 2, 3, 4, 5, 6].map((overs) => {
                          const maxOvers = matchTypeValue === "Tape Ball" ? 
                            (watch("matchType") === "6 Overs" ? 6 : 
                             watch("matchType") === "8 Overs" ? 6 : 6) : 6;
                          if (overs > maxOvers) return null;
                          return (
                            <option key={overs} value={overs}>
                              {overs} {overs === 1 ? "Over" : "Overs"}
                            </option>
                          );
                        })}
                      </select>
                      <p className="text-xs text-slate-500 mt-1">
                        Select how many overs the powerplay should last
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Venue
                </label>
                <input
                  {...register("venue")}
                  type="text"
                  placeholder="e.g., National Stadium, Karachi"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Start Time *
                </label>
                <input
                  {...register("startTime", { required: "Start time is required" })}
                  type="datetime-local"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {errors.startTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : editingMatchId ? "Update Match" : "Create Match"}
                </button>
                {editingMatchId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">All Matches</h3>

            {loading && matches.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {matches.map((match) => (
                <div
                  key={match._id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-800">
                        {getTeamName(match.teams?.[0])} vs {getTeamName(match.teams?.[1])}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${match.status === "live"
                          ? "bg-green-100 text-green-700 animate-pulse"
                          : match.status === "upcoming"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-200 text-slate-700"
                          }`}
                      >
                        {match.status?.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {match.matchType || "T20"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {formatDate(match.startAt)}
                      </span>
                      {match.venue && (
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {match.venue}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(match)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        title="Edit match"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(match._id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                        title="Delete match"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="flex gap-1">
                      {match.teams?.map((teamId) => {
                        const team = teams.find(t => t._id === (teamId._id || teamId));
                        const isSet = match.playingXI?.find(xi => (xi.team?._id || xi.team) === (teamId._id || teamId))?.players?.length === 11;
                        return (
                          <button
                            key={team?._id || Math.random()}
                            onClick={() => openXISelector(match, team?._id)}
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors border ${isSet
                                ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                              }`}
                          >
                            Set {team?.name?.split(' ')[0] || "Team"} XI {isSet && "✓"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {matches.length === 0 && !loading && (
                <div className="text-center py-12">
                  <svg
                    className="w-16 h-16 text-slate-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-slate-500 mb-2">No matches found</p>
                  <p className="text-sm text-slate-400">Create your first match to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Playing XI Modal */}
      {showPlayingXIModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
            <div className="p-5 border-b flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  Select Playing XI
                </h3>
                <p className="text-sm text-slate-500">
                  {getTeamName(selectedTeamForXI)} - {selectedMatchForXI?.title}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${tempXI.length === 11 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                }`}>
                {tempXI.length} / 11 Selected
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {xiLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                  <p className="text-slate-500 text-sm animate-pulse">Loading squad players...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {teamPlayers.length > 0 ? (
                    teamPlayers.map((player) => (
                      <button
                        key={player._id}
                        onClick={() => togglePlayerSelection(player._id)}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 group ${tempXI.includes(player._id)
                            ? "bg-blue-50 border-blue-500 shadow-sm"
                            : "bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50/50"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors ${tempXI.includes(player._id)
                              ? "bg-blue-500 border-blue-500"
                              : "border-slate-200 group-hover:border-blue-300"
                            }`}>
                            {tempXI.includes(player._id) && (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="text-left">
                            <p className={`font-semibold text-sm transition-colors ${tempXI.includes(player._id) ? "text-blue-900" : "text-slate-700"
                              }`}>
                              {player.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{player.role}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-10">
                      <p className="text-slate-500 italic">No players found in this team's squad.</p>
                      <p className="text-xs text-slate-400 mt-1">Please add players to the team first.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-5 border-t bg-slate-50/80 backdrop-blur-md flex gap-4">
              <button
                onClick={() => setShowPlayingXIModal(false)}
                className="flex-1 bg-white hover:bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold transition-all border border-slate-200 shadow-sm"
                disabled={xiLoading}
              >
                Cancel
              </button>
              <button
                onClick={savePlayingXI}
                disabled={xiLoading || tempXI.length !== 11}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
              >
                {xiLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  `Confirm Playing XI (${tempXI.length}/11)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}