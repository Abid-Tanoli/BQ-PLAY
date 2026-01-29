import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlayers, createPlayer, updatePlayerStats, deletePlayer } from "../store/slices/playersSlice";
import { fetchTeams } from "../store/slices/teamSlice";
import { useForm } from "react-hook-form";

export default function ManagePlayers() {
  const dispatch = useDispatch();
  const { players, loading } = useSelector((state) => state.players);
  const { teams } = useSelector((state) => state.teams);
  const [search, setSearch] = useState("");
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    dispatch(fetchPlayers());
    dispatch(fetchTeams());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      await dispatch(createPlayer(data));
      reset();
    } catch (err) {
      console.error(err);
      alert("Failed to create player");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this player?")) {
      await dispatch(deletePlayer(id));
    }
  };

  const filtered = players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Manage Players</h2>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Add New Player</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input {...register("name", { required: true })} placeholder="Player Name" className="p-2 border rounded-lg" />
          <input {...register("role")} placeholder="Role (Batsman/Bowler)" className="p-2 border rounded-lg" />
          <input {...register("Campus")} placeholder="Campus" className="p-2 border rounded-lg" />
          <select {...register("team")} className="p-2 border rounded-lg">
            <option value="">Select Team</option>
            {teams.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Add Player</button>
        </form>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">All Players</h3>
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-lg w-64"
          />
        </div>

        {loading && <div className="text-center py-8">Loading...</div>}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Team</th>
                <th className="p-3 text-left">Campus</th>
                <th className="p-3 text-left">Runs</th>
                <th className="p-3 text-left">Wickets</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.role || "-"}</td>
                  <td className="p-3">{p.team?.name || "-"}</td>
                  <td className="p-3">{p.Campus || "-"}</td>
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
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-8 text-slate-500">No players found</div>}
        </div>
      </div>
    </div>
  );
}