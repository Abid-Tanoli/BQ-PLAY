import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMatches, createMatch } from "../store/slices/matchesSlice";
import { useForm } from "react-hook-form";
import api from "../services/api";
import { io } from "socket.io-client";

export default function ManageMatches() {
  const dispatch = useDispatch();
  const { matches, loading } = useSelector((s) => s.matches);
  const [teams, setTeams] = useState([]);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(import.meta.env.VITE_API_URL || "http://localhost:5000");
    setSocket(s);

    s.on("match:updateList", updatedMatch => {
      dispatch(fetchMatches());
    });

    return () => s.disconnect();
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchMatches());

    const fetchTeams = async () => {
      try {
        const res = await api.get("/teams");
        setTeams(res.data);
      } catch (err) {
        console.error("Failed to fetch teams:", err);
      }
    };
    fetchTeams();
  }, [dispatch]);

  const onSubmit = async (data) => {
    if (data.teamA === data.teamB) {
      alert("Team A and Team B must be different!");
      return;
    }

    try {
      if (editingMatchId) {
        // Update match
        await api.put(`/admin/matches/${editingMatchId}`, {
          title: `${teams.find(t => t._id === data.teamA)?.name} vs ${teams.find(t => t._id === data.teamB)?.name}`,
          teams: [data.teamA, data.teamB],
          startAt: data.startTime,
        });
        socket?.emit("match:updateList");
        setEditingMatchId(null);
      } else {
        // Create match
        await dispatch(createMatch({
          title: `${teams.find(t => t._id === data.teamA)?.name} vs ${teams.find(t => t._id === data.teamB)?.name}`,
          teams: [data.teamA, data.teamB],
          startAt: data.startTime,
        }));
      }
      reset();
    } catch (err) {
      console.error(err);
      alert("Failed to save match");
    }
  };

  const onEdit = (match) => {
    setEditingMatchId(match._id);
    setValue("teamA", match.teams?.[0]?._id);
    setValue("teamB", match.teams?.[1]?._id);
    setValue("startTime", new Date(match.startAt).toISOString().slice(0,16));
  };

  const onDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this match?")) return;
    try {
      await api.delete(`/admin/matches/${id}`);
      socket?.emit("match:updateList");
    } catch (err) {
      console.error(err);
      alert("Failed to delete match");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Matches</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 border rounded space-y-2">
          <h3 className="font-medium mb-2">{editingMatchId ? "Edit Match" : "Create Match"}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <select {...register("teamA")} className="w-full p-2 border rounded" required>
              <option value="">Select Team A</option>
              {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            <select {...register("teamB")} className="w-full p-2 border rounded" required>
              <option value="">Select Team B</option>
              {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            <input {...register("startTime")} type="datetime-local" className="w-full p-2 border rounded" required />
            <button className="w-full bg-green-600 text-white p-2 rounded mt-2">{editingMatchId ? "Update" : "Create"}</button>
            {editingMatchId && <button type="button" className="w-full bg-gray-500 text-white p-2 rounded mt-1" onClick={() => { reset(); setEditingMatchId(null); }}>Cancel</button>}
          </form>
        </div>

        <div className="md:col-span-2">
          <div className="card p-4 border rounded space-y-2">
            <h3 className="font-medium mb-2">Matches</h3>
            {loading && <div>Loading...</div>}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {matches.map((m) => (
                <div key={m._id} className="p-2 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {m.teams?.[0]?.name || "Team A"} vs {m.teams?.[1]?.name || "Team B"}
                    </div>
                    <div className="text-sm text-slate-500">{new Date(m.startAt).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-2 py-1 bg-blue-600 text-white rounded text-sm" onClick={() => onEdit(m)}>Edit</button>
                    <button className="px-2 py-1 bg-red-600 text-white rounded text-sm" onClick={() => onDelete(m._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
