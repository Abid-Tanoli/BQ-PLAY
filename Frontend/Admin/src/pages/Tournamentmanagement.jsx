// src/pages/TournamentManagement.jsx

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../services/api";
import { getSocket } from "../store/socket";

export default function TournamentManagement() {
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showFixtures, setShowFixtures] = useState(false);
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  const selectedTeams = watch("teams") || [];

  useEffect(() => {
    loadTournaments();
    loadTeams();

    const socket = getSocket();
    socket.on("tournament:created", () => loadTournaments());
    socket.on("tournament:updated", () => loadTournaments());
    socket.on("tournament:deleted", () => loadTournaments());

    return () => {
      socket.off("tournament:created");
      socket.off("tournament:updated");
      socket.off("tournament:deleted");
    };
  }, []);

  const loadTournaments = async () => {
    try {
      const res = await api.get("/tournaments");
      setTournaments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTeams = async () => {
    try {
      const res = await api.get("/teams");
      setTeams(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      if (editingId) {
        await api.put(`/tournaments/${editingId}`, data);
        setEditingId(null);
      } else {
        await api.post("/tournaments", data);
      }
      
      reset();
      loadTournaments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save tournament");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (tournament) => {
    setEditingId(tournament._id);
    setValue("name", tournament.name);
    setValue("shortName", tournament.shortName);
    setValue("type", tournament.type);
    setValue("format", tournament.format);
    setValue("startDate", tournament.startDate?.substring(0, 10));
    setValue("endDate", tournament.endDate?.substring(0, 10));
    setValue("venue", tournament.venue);
    setValue("teams", tournament.teams.map(t => t._id || t));
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this tournament and all its matches?")) return;
    
    try {
      await api.delete(`/tournaments/${id}`);
      loadTournaments();
    } catch (err) {
      console.error(err);
      alert("Failed to delete tournament");
    }
  };

  const viewFixtures = async (tournament) => {
    setSelectedTournament(tournament);
    setShowFixtures(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tournament Management</h2>
          <p className="text-sm text-slate-600 mt-1">{tournaments.length} tournaments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Tournament" : "Create Tournament"}
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Premier League 2024"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Short Name</label>
                <input
                  {...register("shortName")}
                  className="w-full p-2 border rounded-lg"
                  placeholder="PL2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select {...register("type")} className="w-full p-2 border rounded-lg">
                  <option value="league">League</option>
                  <option value="knockout">Knockout</option>
                  <option value="group-stage">Group Stage</option>
                  <option value="mixed">Mixed (League + Knockout)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Format</label>
                <select {...register("format")} className="w-full p-2 border rounded-lg">
                  <option value="T20">T20</option>
                  <option value="ODI">ODI</option>
                  <option value="T10">T10</option>
                  <option value="6 Overs">6 Overs</option>
                  <option value="8 Overs">8 Overs</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input
                    {...register("startDate", { required: "Start date required" })}
                    type="date"
                    className="w-full p-2 border rounded-lg"
                  />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">End Date *</label>
                  <input
                    {...register("endDate", { required: "End date required" })}
                    type="date"
                    className="w-full p-2 border rounded-lg"
                  />
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Venue</label>
                <input
                  {...register("venue")}
                  className="w-full p-2 border rounded-lg"
                  placeholder="National Stadium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Teams * (Selected: {selectedTeams.length})
                </label>
                <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
                  {teams.map(team => (
                    <label key={team._id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        value={team._id}
                        {...register("teams", { 
                          validate: v => v?.length >= 2 || "Select at least 2 teams" 
                        })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{team.name}</span>
                    </label>
                  ))}
                </div>
                {errors.teams && <p className="text-red-500 text-xs mt-1">{errors.teams.message}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      reset();
                    }}
                    className="px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Tournaments List */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">All Tournaments</h3>
            
            <div className="space-y-3">
              {tournaments.map(tournament => (
                <div
                  key={tournament._id}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{tournament.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {tournament.type}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          {tournament.format}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tournament.status === "live" ? "bg-green-100 text-green-700" :
                          tournament.status === "completed" ? "bg-slate-200 text-slate-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {tournament.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-slate-500">Start Date</p>
                      <p className="font-medium">{new Date(tournament.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">End Date</p>
                      <p className="font-medium">{new Date(tournament.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {tournament.venue && (
                    <p className="text-sm text-slate-600 mb-3">
                      <span className="font-medium">Venue:</span> {tournament.venue}
                    </p>
                  )}

                  <div className="mb-3">
                    <p className="text-sm font-medium mb-2">Teams ({tournament.teams?.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {tournament.teams?.slice(0, 6).map((team, idx) => (
                        <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-white rounded text-xs">
                          {team.logo && <img src={team.logo} alt={team.name} className="w-4 h-4" />}
                          <span>{team.shortName || team.name}</span>
                        </div>
                      ))}
                      {tournament.teams?.length > 6 && (
                        <span className="px-2 py-1 bg-slate-200 rounded text-xs">
                          +{tournament.teams.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => viewFixtures(tournament)}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium"
                    >
                      View Fixtures
                    </button>
                    <button
                      onClick={() => onEdit(tournament)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(tournament._id)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              
              {tournaments.length === 0 && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-slate-500 mb-2">No tournaments found</p>
                  <p className="text-sm text-slate-400">Create your first tournament to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixtures Modal */}
      {showFixtures && selectedTournament && (
        <FixturesModal
          tournament={selectedTournament}
          onClose={() => {
            setShowFixtures(false);
            setSelectedTournament(null);
          }}
        />
      )}
    </div>
  );
}

// Fixtures Modal Component
function FixturesModal({ tournament, onClose }) {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFixtures();
  }, [tournament._id]);

  const loadFixtures = async () => {
    try {
      const res = await api.get(`/tournaments/${tournament._id}/fixtures`);
      setFixtures(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">{tournament.name} - Fixtures</h3>
            <p className="text-sm text-slate-500 mt-1">{fixtures.length} matches scheduled</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">Loading fixtures...</div>
          ) : fixtures.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No fixtures created yet</p>
              <p className="text-sm text-slate-400 mt-2">Create matches for this tournament</p>
            </div>
          ) : (
            <div className="space-y-3">
              {fixtures.map(match => (
                <div key={match._id} className="p-4 bg-slate-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-700">
                        {match.teams?.[0]?.name} vs {match.teams?.[1]?.name}
                      </span>
                      {match.matchNumber && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          Match {match.matchNumber}
                        </span>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      match.status === "live" ? "bg-green-100 text-green-700" :
                      match.status === "completed" ? "bg-slate-200 text-slate-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {match.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>{new Date(match.startAt).toLocaleString()}</span>
                    {match.venue && <span>• {match.venue}</span>}
                  </div>
                  {match.result?.description && (
                    <div className="mt-2 text-sm text-green-700 font-medium">
                      {match.result.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-slate-50">
          <button
            onClick={onClose}
            className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}