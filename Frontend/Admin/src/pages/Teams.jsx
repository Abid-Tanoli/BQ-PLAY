import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeams, createTeam, updateTeam, deleteTeam, addPlayersToTeam } from "../store/slices/teamSlice";
import { fetchPlayers } from "../store/slices/playersSlice";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { initSocket } from "../store/socket";

export default function Teams() {
  const dispatch = useDispatch();
  const { teams, loading } = useSelector((state) => state.teams);
  const { players } = useSelector((state) => state.players);
  const [editingId, setEditingId] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    dispatch(fetchTeams());
    dispatch(fetchPlayers());

    const socket = initSocket();

    socket.emit("join-teams");

    socket.on("team:created", () => {
      dispatch(fetchTeams());
    });

    socket.on("team:updated", () => {
      dispatch(fetchTeams());
    });

    socket.on("team:deleted", () => {
      dispatch(fetchTeams());
    });

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
      console.error(err);
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
    setSelectedPlayers(team.players?.map(p => p._id || p) || []);
  };

  const togglePlayer = (playerId) => {
    setSelectedPlayers(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const savePlayerSelection = async () => {
    if (!showPlayerModal) return;

    try {
      await dispatch(addPlayersToTeam({
        id: showPlayerModal._id,
        playerIds: selectedPlayers
      })).unwrap();

      setShowPlayerModal(null);
      setSelectedPlayers([]);
      dispatch(fetchTeams());
    } catch (err) {
      alert(err || "Failed to update team players");
    }
  };

  const getAvailablePlayers = () => {
    if (!showPlayerModal) return [];
    return players.filter(p =>
      !p.team ||
      p.team._id === showPlayerModal._id ||
      p.team === showPlayerModal._id
    );
  };

  return (
    <div className="space-y-6">
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
                onClick={() => {
                  setEditingId(null);
                  reset();
                }}
                className="px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">All Teams</h3>
        {loading && <div className="text-center py-8">Loading...</div>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Short Name</th>
                <th className="p-3 text-left">Owner</th>
                <th className="p-3 text-left">Logo</th>
                <th className="p-3 text-left">Players</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team._id} className="border-t hover:bg-slate-50">
                  <td className="p-3 font-medium">{team.name}</td>
                  <td className="p-3">{team.shortName || "-"}</td>
                  <td className="p-3">{team.ownername || "-"}</td>
                  <td className="p-3">
                    {team.logo ? (
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="w-10 h-10 object-contain rounded"
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center text-slate-500 text-xs">
                        No Logo
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => openPlayerModal(team)}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                    >
                      {team.players?.length || 0} Players
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(team)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(team._id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {teams.length === 0 && !loading && (
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-slate-500">No teams found. Create your first team!</p>
            </div>
          )}
        </div>
      </div>

      {showPlayerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  Manage Players - {showPlayerModal.name}
                </h3>
                <button
                  onClick={() => {
                    setShowPlayerModal(null);
                    setSelectedPlayers([]);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Select players to add to this team ({selectedPlayers.length} selected)
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {getAvailablePlayers().length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>No available players. All players are assigned to other teams.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {getAvailablePlayers().map((player) => (
                    <label
                      key={player._id}
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPlayers.includes(player._id)}
                        onChange={() => togglePlayer(player._id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{player.name}</p>
                        <p className="text-sm text-slate-500">
                          {player.role || "No role"} • {player.Campus || "No campus"}
                        </p>
                      </div>
                      {player.team && player.team !== showPlayerModal._id && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                          Currently in {player.team.name || "another team"}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-slate-50 flex gap-3">
              <button
                onClick={() => {
                  setShowPlayerModal(null);
                  setSelectedPlayers([]);
                }}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={savePlayerSelection}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Save Players ({selectedPlayers.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}