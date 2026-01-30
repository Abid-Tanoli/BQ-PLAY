import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMatches, createMatch, updateMatch, deleteMatch } from "../store/slices/matchesSlice";
import { fetchTeams } from "../store/slices/teamSlice";
import { useForm } from "react-hook-form";
import { initSocket } from "../store/socket";

export default function ManageMatches() {
  const dispatch = useDispatch();
  const { matches, loading, error } = useSelector((state) => state.matches);
  const { teams } = useSelector((state) => state.teams);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  const teamAValue = watch("teamA");
  const teamBValue = watch("teamB");

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
                  <option value="T20">T20 (20 overs)</option>
                  <option value="ODI">ODI (50 overs)</option>
                  <option value="Test">Test Match</option>
                </select>
              </div>

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
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          match.status === "live"
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
    </div>
  );
}