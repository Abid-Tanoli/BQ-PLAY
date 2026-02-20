import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlayers, createPlayer, updatePlayer, updatePlayerStats, deletePlayer } from "../store/slices/playersSlice";
import { fetchTeams } from "../store/slices/teamSlice";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

export default function ManagePlayers() {
  const dispatch = useDispatch();
  const { players, loading, pagination } = useSelector((state) => state.players);
  const { teams } = useSelector((state) => state.teams);
  const [search, setSearch] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [filterCampus, setFilterCampus] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    dispatch(fetchPlayers({ page, search: debouncedSearch, team: filterTeam, Campus: filterCampus }));
  }, [dispatch, page, debouncedSearch, filterTeam, filterCampus]);

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await dispatch(updatePlayer({ id: editingId, data }));
        setEditingId(null);
      } else {
        await dispatch(createPlayer(data));
      }
      reset();
    } catch (err) {
      console.error(err);
      alert(editingId ? "Failed to update player" : "Failed to create player");
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setValue("name", p.name);
    setValue("role", p.role);
    setValue("Campus", p.Campus);
    setValue("imageUrl", p.imageUrl);
    setValue("team", p.team?._id || p.team || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this player?")) {
      await dispatch(deletePlayer(id));
    }
  };

  // Removed filtered constant as filtering is now done on the backend

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Manage Players</h2>
        <Link
          to="/admin/bulk-import"
          state={{ tab: "players" }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Bulk Import
        </Link>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{editingId ? "Edit Player" : "Add New Player"}</h3>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Cancel Edit
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input {...register("name", { required: true })} placeholder="Player Name" className="p-2 border rounded-lg" />
          <input {...register("role")} placeholder="Role" className="p-2 border rounded-lg" />
          <input {...register("Campus")} placeholder="Campus" className="p-2 border rounded-lg" />
          <input {...register("imageUrl")} placeholder="Image URL" className="p-2 border rounded-lg" />
          <select {...register("team")} className="p-2 border rounded-lg">
            <option value="">Select Team</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
          <button className={`${editingId ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-lg font-medium transition-colors`}>
            {editingId ? "Update Player" : "Add Player"}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold flex-grow">All Players</h3>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterTeam}
              onChange={(e) => { setFilterTeam(e.target.value); setPage(1); }}
              className="px-3 py-2 border rounded-lg text-sm bg-white min-w-[150px]"
            >
              <option value="">All Teams</option>
              {teams.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Filter by Campus..."
              value={filterCampus}
              onChange={(e) => { setFilterCampus(e.target.value); setPage(1); }}
              className="px-3 py-2 border rounded-lg text-sm w-48"
            />

            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm w-48"
            />
          </div>
        </div>

        {loading && <div className="text-center py-8">Loading...</div>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left">Player</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Team</th>
                <th className="p-3 text-left">Campus</th>
                <th className="p-3 text-left">Runs</th>
                <th className="p-3 text-left">Wickets</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p._id} className="border-t hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <Link to={`/admin/players/${p._id}`} className="flex items-center gap-3 group">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover bg-slate-100 group-hover:ring-2 ring-blue-500 transition-all" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs group-hover:bg-slate-200 transition-all">
                          {p.name?.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{p.name}</span>
                    </Link>
                  </td>
                  <td className="p-3 text-slate-600">{p.role || "-"}</td>
                  <td className="p-3 text-slate-600">{p.team?.name || "-"}</td>
                  <td className="p-3 text-slate-600">{p.Campus || "-"}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      defaultValue={p.stats?.runs || 0}
                      onBlur={(e) =>
                        dispatch(updatePlayerStats({ id: p._id, stats: { ...p.stats, runs: +e.target.value } }))
                      }
                      className="w-20 p-1 border rounded"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      defaultValue={p.stats?.wickets || 0}
                      onBlur={(e) =>
                        dispatch(updatePlayerStats({ id: p._id, stats: { ...p.stats, wickets: +e.target.value } }))
                      }
                      className="w-20 p-1 border rounded"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {players.length === 0 && <div className="text-center py-8 text-slate-500">No players found</div>}
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-sm text-slate-500">
              Showing page <span className="font-semibold text-slate-700">{pagination.currentPage}</span> of <span className="font-semibold text-slate-700">{pagination.totalPages}</span> ({pagination.totalPlayers} total players)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={page === pagination.totalPages}
                className="px-3 py-1 border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}