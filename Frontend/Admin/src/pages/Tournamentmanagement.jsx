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
                        <span className={`px-2 py-1 rounded text-xs font-medium ${tournament.status === "live" ? "bg-green-100 text-green-700" :
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
                      View Details
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

      {/* Details Modal (Fixtures + Points Table) */}
      {showFixtures && selectedTournament && (
        <TournamentDetailsModal
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

// Tournament Details Modal Component
function TournamentDetailsModal({ tournament, onClose }) {
  const [fixtures, setFixtures] = useState([]);
  const [pointsTable, setPointsTable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("fixtures");
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [tournamentSquads, setTournamentSquads] = useState({});
  const [selectedTeamForSquad, setSelectedTeamForSquad] = useState("");
  const [showSquadForm, setShowSquadForm] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [captain, setCaptain] = useState("");
  const [viceCaptain, setViceCaptain] = useState("");
  const [wicketKeepers, setWicketKeepers] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [savingSquad, setSavingSquad] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadData();
  }, [tournament._id]);

  const loadData = async () => {
    try {
      const [fixRes, tableRes, squadRes] = await Promise.all([
        api.get(`/tournaments/${tournament._id}/fixtures`),
        api.get(`/tournaments/${tournament._id}/points-table`),
        api.get(`/tournaments/${tournament._id}/squad`)
      ]);
      setFixtures(fixRes.data);
      setPointsTable(tableRes.data);
      // Convert squad array to object keyed by teamId
      const squadsObj = {};
      squadRes.data.forEach(s => {
        const teamId = s.team?._id || s.team;
        squadsObj[teamId] = s;
      });
      setTournamentSquads(squadsObj);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const onCreateMatch = async (data) => {
    if (data.team1 === data.team2) {
      alert("Please select two different teams");
      return;
    }

    try {
      const team1 = tournament.teams.find(t => String(t._id) === String(data.team1));
      const team2 = tournament.teams.find(t => String(t._id) === String(data.team2));

      if (!team1 || !team2) {
        alert("Selected teams not found in tournament");
        return;
      }

      const matchData = {
        ...data,
        tournamentId: tournament._id,
        teams: [data.team1, data.team2],
        title: `${team1.name} vs ${team2.name}`
      };

      await api.post("/matches", matchData);
      alert("Match created successfully");
      setShowCreateMatch(false);
      reset();
      loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create match");
    }
  };

  const openSquadForm = async (teamId) => {
    setSelectedTeamForSquad(teamId);
    setShowSquadForm(true);
    try {
      const res = await api.get(`/teams/${teamId}`);
      const players = res.data.players || res.data.playerList || [];
      setTeamPlayers(players);
    } catch (err) {
      console.error(err);
    }

    // Load existing squad if any
    const existingSquad = tournamentSquads[teamId];
    if (existingSquad) {
      setSelectedPlayers(existingSquad.players.map(p => p._id || p));
      setCaptain(existingSquad.captain?._id || existingSquad.captain || "");
      setViceCaptain(existingSquad.viceCaptain?._id || existingSquad.viceCaptain || "");
      setWicketKeepers((existingSquad.wicketKeepers || []).map(w => w._id || w));
    } else {
      setSelectedPlayers([]);
      setCaptain("");
      setViceCaptain("");
      setWicketKeepers([]);
    }
  };

  const handlePlayerToggle = (playerId) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
      if (captain === playerId) setCaptain("");
      if (viceCaptain === playerId) setViceCaptain("");
      if (wicketKeepers.includes(playerId)) {
        setWicketKeepers(wicketKeepers.filter(id => id !== playerId));
      }
    } else if (selectedPlayers.length < 20) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    } else {
      alert("Maximum 20 players can be selected");
    }
  };

  const saveTournamentSquad = async () => {
    if (selectedPlayers.length < 11 || selectedPlayers.length > 20) {
      alert("Please select between 11 and 20 players");
      return;
    }
    if (!captain) {
      alert("Please select a captain");
      return;
    }
    if (!viceCaptain) {
      alert("Please select a vice-captain");
      return;
    }
    if (captain === viceCaptain) {
      alert("Captain and vice-captain must be different");
      return;
    }
    if (wicketKeepers.length === 0) {
      alert("Please select at least one wicket-keeper");
      return;
    }

    setSavingSquad(true);
    try {
      await api.post(`/tournaments/${tournament._id}/squad`, {
        teamId: selectedTeamForSquad,
        players: selectedPlayers,
        captain,
        viceCaptain,
        wicketKeepers
      });
      alert("Tournament squad saved successfully");
      setShowSquadForm(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save tournament squad");
    } finally {
      setSavingSquad(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{tournament.name}</h3>
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => setActiveTab("fixtures")}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${activeTab === "fixtures" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-200"}`}
              >
                Fixtures
              </button>
              <button
                onClick={() => setActiveTab("table")}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${activeTab === "table" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-200"}`}
              >
                Points Table
              </button>
              <button
                onClick={() => setActiveTab("rankings")}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${activeTab === "rankings" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-200"}`}
              >
                Rankings
              </button>
              <button
                onClick={() => setActiveTab("squads")}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${activeTab === "squads" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-200"}`}
              >
                Squads (11-20)
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : activeTab === "fixtures" ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold">Match Fixtures ({fixtures.length})</h4>
                <button
                  onClick={() => setShowCreateMatch(!showCreateMatch)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {showCreateMatch ? "Cancel" : "Create Match"}
                </button>
              </div>

              {showCreateMatch && (
                <div className="bg-slate-50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-4">
                  <h5 className="font-semibold mb-4 text-sm text-blue-800 uppercase tracking-wider">New Match</h5>
                  <form onSubmit={handleSubmit(onCreateMatch)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1">Team 1 *</label>
                      <select {...register("team1", { required: true })} className="w-full p-2 text-sm border rounded-lg">
                        <option value="">Select Team</option>
                        {tournament.teams?.map(t => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Team 2 *</label>
                      <select {...register("team2", { required: true })} className="w-full p-2 text-sm border rounded-lg">
                        <option value="">Select Team</option>
                        {tournament.teams?.map(t => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Start Time *</label>
                      <input type="datetime-local" {...register("startAt", { required: true })} className="w-full p-2 text-sm border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Venue</label>
                      <input {...register("venue")} defaultValue={tournament.venue} className="w-full p-2 text-sm border rounded-lg" placeholder="Enter venue" />
                    </div>
                    <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                      <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold text-sm">
                        Schedule Match
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {fixtures.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                  <p className="text-slate-500">No fixtures created yet</p>
                  <p className="text-sm text-slate-400 mt-2">Click "Create Match" to add one</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fixtures.map(match => (
                    <div key={match._id} className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase ${match.status === "live" ? "bg-green-100 text-green-700 animate-pulse" :
                          match.status === "completed" ? "bg-slate-100 text-slate-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                          {match.status}
                        </span>
                        <span className="text-xs text-slate-500">{new Date(match.startAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-center flex-1">
                          <p className="font-bold text-sm truncate">{match.teams?.[0]?.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{match.teams?.[0]?.shortName}</p>
                        </div>
                        <div className="px-4 font-black text-slate-300">VS</div>
                        <div className="text-center flex-1">
                          <p className="font-bold text-sm truncate">{match.teams?.[1]?.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{match.teams?.[1]?.shortName}</p>
                        </div>
                      </div>
                      {match.result?.description && (
                        <div className="text-center py-2 bg-green-50 rounded border border-green-100">
                          <p className="text-[11px] text-green-700 font-bold">{match.result.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === "table" ? (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold">Tournament Standings</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
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
                      <th className="px-4 py-3 text-center">Next Match</th>
                      <th className="px-4 py-3">Form</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pointsTable.map((entry, idx) => {
                      const nextMatch = fixtures.find(f =>
                        f.status === "upcoming" &&
                        (f.teams.some(t => t._id === entry.team?._id))
                      );
                      const opponent = nextMatch?.teams?.find(t => t._id !== entry.team?._id);
                      const opponentName = opponent?.shortName || opponent?.name || "TBD";

                      return (
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
                          <td className="px-2 py-4 text-center font-medium">{entry.matchesPlayed || 0}</td>
                          <td className="px-2 py-4 text-center text-green-600 font-bold">{entry.won || 0}</td>
                          <td className="px-2 py-4 text-center text-red-600 font-bold">{entry.lost || 0}</td>
                          <td className="px-2 py-4 text-center text-slate-500 font-medium">{(entry.tied || 0) + (entry.noResult || 0)}</td>
                          <td className="px-4 py-4 text-center font-bold text-blue-600">{(entry.netRunRate || 0).toFixed(3)}</td>
                          <td className="px-4 py-4 text-center font-black bg-blue-50 text-blue-900">{entry.points || 0}</td>
                          <td className="px-4 py-4 text-center text-[11px]">
                            <span className="block font-bold">{entry.for || 0} runs</span>
                            <span className="text-slate-400">{entry.wicketsAgainst || 0} wkts</span>
                          </td>
                          <td className="px-4 py-4 text-center text-[11px]">
                            <span className="block font-bold">{entry.against || 0} runs</span>
                            <span className="text-slate-400">{entry.wicketsFor || 0} wkts</span>
                          </td>
                          <td className="px-4 py-4 text-center text-[11px]">
                            {nextMatch ? (
                              <div className="text-blue-700">
                                <span className="font-bold block">vs {opponentName}</span>
                                <span className="text-[10px] opacity-70">{new Date(nextMatch.startAt).toLocaleDateString()}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">No Match</span>
                            )}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "rankings" ? (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold">Tournament Rankings</h4>
              {/* Here we can reuse a ranking view or show top performers of this tournament */}
              <p className="text-slate-500 italic">Tournament specific rankings coming soon. View global rankings in the sidebar.</p>
            </div>
          ) : activeTab === "squads" ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold">Tournament Squads (11-20 Players per Team)</h4>
              </div>
              <p className="text-sm text-slate-500">Select squads for each team in this series/tournament. These squads apply to all matches.</p>

              {/* Team squad cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tournament.teams?.map(team => {
                  const squad = tournamentSquads[team._id];
                  const playerCount = squad?.players?.length || 0;
                  const isReady = playerCount >= 11;
                  return (
                    <div key={team._id} className={`p-4 bg-white rounded-lg border hover:shadow-md transition-shadow ${isReady ? 'border-green-300' : 'border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {team.logo && <img src={team.logo} alt={team.name} className="w-10 h-10 rounded-lg object-cover" />}
                          <div>
                            <h5 className="font-bold text-slate-800">{team.name}</h5>
                            <p className={`text-xs font-bold ${isReady ? 'text-green-600' : 'text-slate-500'}`}>
                              {playerCount}/20 players {isReady ? '✓ Ready' : '(Min 11 required)'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openSquadForm(team._id)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                        >
                          {squad ? "Edit Squad" : "Set Squad"}
                        </button>
                      </div>
                      {squad && squad.players?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {squad.players.slice(0, 8).map(p => (
                            <span key={p._id || p} className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold">
                              {p.name || "Player"}
                              {(p._id || p) === squad.captain && <span className="ml-1 text-blue-600">(C)</span>}
                              {(p._id || p) === squad.viceCaptain && <span className="ml-1 text-green-600">(VC)</span>}
                              {squad.wicketKeepers?.some(w => (w._id || w) === (p._id || p)) && <span className="ml-1 text-orange-600">(WK)</span>}
                            </span>
                          ))}
                          {squad.players.length > 8 && (
                            <span className="px-2 py-1 bg-slate-200 rounded text-[10px] font-bold">+{squad.players.length - 8} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Squad Form Modal */}
              {showSquadForm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
                    <div className="p-5 border-b flex items-center justify-between bg-slate-50">
                      <div>
                        <h4 className="text-lg font-bold text-slate-800">
                          Set Tournament Squad - {tournament.teams?.find(t => t._id === selectedTeamForSquad)?.name}
                        </h4>
                        <p className="text-xs text-slate-500">Select 11-20 players from team roster</p>
                      </div>
                      <button onClick={() => setShowSquadForm(false)} className="p-2 hover:bg-slate-200 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5">
                      {/* Selection Info */}
                      <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-sm font-bold text-blue-800">
                          Players: {selectedPlayers.length}/20 (Min 11)
                        </span>
                        <div className="flex gap-4 text-xs">
                          <span className="text-blue-600 font-bold">C: {captain ? teamPlayers.find(p => (p._id || p) === captain)?.name : "Not selected"}</span>
                          <span className="text-green-600 font-bold">VC: {viceCaptain ? teamPlayers.find(p => (p._id || p) === viceCaptain)?.name : "Not selected"}</span>
                          <span className="text-orange-600 font-bold">WK: {wicketKeepers.length > 0 ? wicketKeepers.map(id => teamPlayers.find(p => (p._id || p) === id)?.name).join(", ") : "Not selected"}</span>
                        </div>
                      </div>

                      {/* Players Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {teamPlayers.map(player => {
                          const isSelected = selectedPlayers.includes(player._id);
                          const isCaptain = captain === player._id;
                          const isViceCaptain = viceCaptain === player._id;
                          const isWK = wicketKeepers.includes(player._id);
                          return (
                            <div
                              key={player._id}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200"
                                : "bg-white border-slate-200 hover:border-slate-300"
                                }`}
                              onClick={() => handlePlayerToggle(player._id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-sm text-slate-800 truncate">{player.name}</p>
                                  <p className="text-[10px] text-slate-500">{player.playingRole || player.role || "Player"}</p>
                                </div>
                                <div className="flex gap-1">
                                  {isSelected && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setCaptain(isCaptain ? "" : player._id); }}
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isCaptain ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600 hover:bg-blue-200"}`}
                                        title="Captain"
                                      >
                                        C
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setViceCaptain(isViceCaptain ? "" : player._id); }}
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isViceCaptain ? "bg-green-600 text-white" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                                        title="Vice-Captain"
                                      >
                                        VC
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); if (isWK) setWicketKeepers(wicketKeepers.filter(id => id !== player._id)); else setWicketKeepers([...wicketKeepers, player._id]); }}
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isWK ? "bg-orange-600 text-white" : "bg-orange-100 text-orange-600 hover:bg-orange-200"}`}
                                        title="Wicket-Keeper"
                                      >
                                        WK
                                      </button>
                                    </>
                                  )}
                                  <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-300"}`}>
                                    {isSelected ? "✓" : ""}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {teamPlayers.length === 0 && (
                        <div className="text-center py-12">
                          <p className="text-slate-500">No players available for this team</p>
                          <p className="text-sm text-slate-400 mt-2">Add players to the team first</p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t bg-slate-50 flex gap-3">
                      <button
                        onClick={() => setShowSquadForm(false)}
                        className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveTournamentSquad}
                        disabled={savingSquad}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm disabled:opacity-50"
                      >
                        {savingSquad ? "Saving..." : "Save Squad"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null
          }
        </div>

        <div className="p-6 border-t bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-sm transition-colors"
          >
            Close Details
          </button>
        </div>
      </div >
    </div >
  );
}
