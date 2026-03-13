import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeams, createTeam, updateTeam, deleteTeam, addPlayersToTeam } from "../store/slices/teamSlice";
import { fetchPlayers } from "../store/slices/playersSlice";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { initSocket } from "../store/socket";

export default function Teams() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { teams, loading } = useSelector((state) => state.teams);
  const { players } = useSelector((state) => state.players);
  const [editingId, setEditingId] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerTab, setPlayerTab] = useState("current"); // "current" | "add"
  const [savingPlayers, setSavingPlayers] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    dispatch(fetchTeams());
    // Fetch ALL players with a high limit so the modal pool is complete
    dispatch(fetchPlayers({ page: 1, limit: 500 }));

    const socket = initSocket();
    socket.emit("join-teams");
    socket.on("team:created", () => dispatch(fetchTeams()));
    socket.on("team:updated", () => dispatch(fetchTeams()));
    socket.on("team:deleted", () => dispatch(fetchTeams()));

    return () => {
      socket.off("team:created");
      socket.off("team:updated");
      socket.off("team:deleted");
    };
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await dispatch(updateTeam({ id: editingId, data })).unwrap();
        setEditingId(null);
      } else {
        await dispatch(createTeam(data)).unwrap();
      }
      reset();
    } catch (err) {
      alert(err || "Failed to save team");
    }
  };

  const onEdit = (team) => {
    setEditingId(team._id);
    setValue("name", team.name);
    setValue("ownername", team.ownername || "");
    setValue("logo", team.logo || "");
    setValue("shortName", team.shortName || "");
  };

  const onDelete = async (id) => {
    if (window.confirm("Delete this team? This will also remove team assignment from all players.")) {
      try {
        await dispatch(deleteTeam(id)).unwrap();
      } catch (err) {
        alert(err || "Failed to delete team");
      }
    }
  };

  const openPlayerModal = (team) => {
    setShowPlayerModal(team);
    // Pre-select players already in this team — ensure all IDs are plain strings
    const currentIds = (team.players || []).map(p => String(p._id || p));
    setSelectedPlayers(currentIds);
    setPlayerSearch("");
    setPlayerTab("current");
  };

  const closePlayerModal = () => {
    setShowPlayerModal(null);
    setSelectedPlayers([]);
    setPlayerSearch("");
  };

  const togglePlayer = (playerId) => {
    const id = String(playerId);
    setSelectedPlayers(prev =>
      prev.includes(id)
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
    );
  };

  const savePlayerSelection = async () => {
    if (!showPlayerModal) return;
    setSavingPlayers(true);
    try {
      await dispatch(addPlayersToTeam({
        id: showPlayerModal._id,
        playerIds: selectedPlayers
      })).unwrap();
      await dispatch(fetchTeams());
      closePlayerModal();
    } catch (err) {
      alert(err || "Failed to update team players");
    } finally {
      setSavingPlayers(false);
    }
  };

  // Players currently in this team — read directly from populated showPlayerModal.players
  // These are already populated objects from the API (name, role, _id etc.)
  const getCurrentPlayers = () => {
    if (!showPlayerModal) return [];
    // Use populated objects directly from the team object returned by API
    const populated = (showPlayerModal.players || []).filter(p => typeof p === 'object' && p._id);
    if (populated.length > 0) {
      // Filter by selectedPlayers to reflect any deselections made in the session
      return populated.filter(p => selectedPlayers.includes(String(p._id)));
    }
    // Fallback: use Redux store (for raw ID arrays)
    return players.filter(p => selectedPlayers.includes(String(p._id)));
  };


  // All players NOT currently selected, filtered by search
  const getAddablePlayers = () => {
    if (!showPlayerModal) return [];
    return players.filter(p => {
      const notSelected = !selectedPlayers.includes(String(p._id));
      const matchesSearch = !playerSearch ||
        p.name?.toLowerCase().includes(playerSearch.toLowerCase()) ||
        p.role?.toLowerCase().includes(playerSearch.toLowerCase()) ||
        p.Campus?.toLowerCase().includes(playerSearch.toLowerCase());
      return notSelected && matchesSearch;
    });
  };

  const getTeamPlayerCount = (team) => {
    return team.players?.length || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Manage Teams</h2>
        <Link
          to="/admin/bulk-import"
          state={{ tab: "teams" }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Bulk Import
        </Link>
      </div>

      {/* Add/Edit Team Form */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          {editingId ? "Edit Team" : "Add New Team"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            {...register("name", { required: true })}
            placeholder="Team Name *"
            className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            {...register("shortName")}
            placeholder="Short Name (e.g., ABC)"
            className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            {...register("ownername")}
            placeholder="Owner Name"
            className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <input
            {...register("logo")}
            placeholder="Logo URL"
            className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium py-2 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => { setEditingId(null); reset(); }}
                className="px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && (
          <div className="col-span-full text-center py-12 text-slate-500">Loading teams...</div>
        )}
        {teams.map((team) => (
          <div key={team._id} className="card border border-slate-100 hover:shadow-lg transition-all group cursor-pointer" onClick={() => navigate(`/admin/teams/${team._id}`)}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
              {team.logo ? (
                <img
                  src={team.logo}
                  alt={team.name}
                  className="w-14 h-14 object-contain rounded-lg border border-slate-100"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-slate-100 rounded-lg flex items-center justify-center font-black text-blue-600 text-xl">
                  {team.shortName || team.name?.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">{team.name}</h3>
                {team.ownername && <p className="text-sm text-slate-500 truncate">Owner: {team.ownername}</p>}
              </div>
              <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Player avatars + count */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-3">
              <div className="flex -space-x-1">
                {team.players?.slice(0, 5).map((player, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 bg-blue-100 border-2 border-white rounded-full flex items-center justify-center text-xs font-bold text-blue-700"
                  >
                    {(player.name || "P")?.substring(0, 1).toUpperCase()}
                  </div>
                ))}
                {getTeamPlayerCount(team) === 0 && (
                  <div className="w-7 h-7 bg-slate-200 border-2 border-white rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-slate-600">
                {getTeamPlayerCount(team)} {getTeamPlayerCount(team) === 1 ? "Player" : "Players"}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => openPlayerModal(team)}
                className="flex-1 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-lg transition-all"
              >
                👥 Players
              </button>
              <button
                onClick={() => onEdit(team)}
                className="flex-1 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 hover:border-blue-400 rounded-lg transition-all"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(team._id)}
                className="flex-1 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 hover:border-red-400 rounded-lg transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {teams.length === 0 && !loading && (
          <div className="col-span-full text-center py-16">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-slate-500 text-lg font-medium">No teams yet</p>
            <p className="text-slate-400 text-sm mt-1">Create your first team using the form above.</p>
          </div>
        )}
      </div>

      {/* Player Management Modal */}
      {showPlayerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Modal Header */}
            <div className="p-5 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {showPlayerModal.logo ? (
                    <img src={showPlayerModal.logo} className="w-10 h-10 rounded-lg object-contain bg-white/20 p-1" alt="" />
                  ) : (
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-black text-sm">
                      {showPlayerModal.shortName || showPlayerModal.name?.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">{showPlayerModal.name} — Squad</h3>
                    <p className="text-blue-200 text-sm">{selectedPlayers.length} players selected</p>
                  </div>
                </div>
                <button onClick={closePlayerModal} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-4 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setPlayerTab("current")}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${playerTab === "current"
                    ? "bg-white text-blue-700 shadow"
                    : "text-blue-100 hover:text-white"
                    }`}
                >
                  Current Squad ({selectedPlayers.length})
                </button>
                <button
                  onClick={() => { setPlayerTab("add"); setPlayerSearch(""); }}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all ${playerTab === "add"
                    ? "bg-white text-blue-700 shadow"
                    : "text-blue-100 hover:text-white"
                    }`}
                >
                  Add Players ({getAddablePlayers().length} available)
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {playerTab === "current" ? (
                <div className="p-4">
                  {getCurrentPlayers().length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                      </svg>
                      <p className="text-slate-500 font-medium">No players in squad yet</p>
                      <button
                        onClick={() => setPlayerTab("add")}
                        className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium underline"
                      >
                        Add players →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getCurrentPlayers().map((player, i) => (
                        <div
                          key={player._id}
                          className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {i + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{player.name}</p>
                              <p className="text-xs text-slate-500">{player.role || "No role"}{player.Campus ? ` • ${player.Campus}` : ""}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => togglePlayer(player._id)}
                            className="p-1.5 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Remove from squad"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      value={playerSearch}
                      onChange={(e) => setPlayerSearch(e.target.value)}
                      placeholder="Search by name, role, or campus..."
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  {/* Players list */}
                  {getAddablePlayers().length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <p>{playerSearch ? "No players match your search." : "All available players are already in this squad."}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {getAddablePlayers().map((player) => (
                        <button
                          key={player._id}
                          onClick={() => togglePlayer(player._id)}
                          className="w-full flex items-center justify-between p-3 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                              {player.name?.substring(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{player.name}</p>
                              <p className="text-xs text-slate-500">{player.role || "No role"}{player.Campus ? ` • ${player.Campus}` : ""}</p>
                            </div>
                          </div>
                          {player.team && (player.team._id || player.team) !== showPlayerModal._id && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full border border-amber-200">
                              {player.team.name || "In another team"}
                            </span>
                          )}
                          <div className="w-5 h-5 rounded border-2 border-slate-300 hover:border-blue-500 flex items-center justify-center ml-2 shrink-0">
                            <svg className="w-3 h-3 text-transparent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-slate-50 flex gap-3">
              <button
                onClick={closePlayerModal}
                disabled={savingPlayers}
                className="flex-1 py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={savePlayerSelection}
                disabled={savingPlayers}
                className="flex-[2] py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {savingPlayers ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  `Save Squad (${selectedPlayers.length} players)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}