import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeams, createTeam, updateTeam, deleteTeam } from "../store/slices/teamSlice";
import { useForm } from "react-hook-form";

export default function Teams() {
  const dispatch = useDispatch();
  const { teams, loading } = useSelector((state) => state.teams);
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await dispatch(updateTeam({ id: editingId, data }));
        setEditingId(null);
      } else {
        await dispatch(createTeam(data));
      }
      reset();
    } catch (err) {
      console.error(err);
      alert("Failed to save team");
    }
  };

  const onEdit = (team) => {
    setEditingId(team._id);
    setValue("name", team.name);
    setValue("ownername", team.ownername || "");
    setValue("logo", team.logo || "");
  };

  const onDelete = async (id) => {
    if (window.confirm("Delete this team?")) {
      await dispatch(deleteTeam(id));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Manage Teams</h2>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">{editingId ? "Edit Team" : "Add New Team"}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            {...register("name", { required: true })}
            placeholder="Team Name"
            className="p-2 border rounded-lg"
          />
          <input {...register("ownername")} placeholder="Owner Name" className="p-2 border rounded-lg" />
          <input {...register("logo")} placeholder="Logo URL" className="p-2 border rounded-lg" />
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  reset();
                }}
                className="px-4 bg-slate-200 hover:bg-slate-300 rounded-lg"
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
                <th className="p-3 text-left">Owner</th>
                <th className="p-3 text-left">Logo</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team._id} className="border-t">
                  <td className="p-3 font-medium">{team.name}</td>
                  <td className="p-3">{team.ownername || "-"}</td>
                  <td className="p-3">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="w-10 h-10 object-contain" />
                    ) : (
                      "-"
                    )}
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
            <div className="text-center py-12 text-slate-500">No teams found. Create your first team!</div>
          )}
        </div>
      </div>
    </div>
  );
}