import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMatches, createMatch } from "../store/slices/matchesSlice";
import { useForm } from "react-hook-form";

export default function ManageMatches() {
  const dispatch = useDispatch();
  const { matches, loading } = useSelector((s) => s.matches);

  useEffect(() => {
    dispatch(fetchMatches());
  }, [dispatch]);

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    await dispatch(createMatch(data));
    reset();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Matches</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="font-medium mb-2">Create Match</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <input {...register("teamA")} placeholder="Team A" className="w-full p-2 border rounded"/>
            <input {...register("teamB")} placeholder="Team B" className="w-full p-2 border rounded"/>
            <input {...register("startTime")} type="datetime-local" className="w-full p-2 border rounded"/>
            <button className="w-full bg-green-600 text-white p-2 rounded">Create</button>
          </form>
        </div>

        <div className="md:col-span-2">
          <div className="card">
            <h3 className="font-medium mb-2">Matches</h3>
            {loading && <div>Loading...</div>}
            <div className="space-y-2">
              {matches.map((m) => (
                <div key={m._id} className="p-2 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{m.teamA} vs {m.teamB}</div>
                    <div className="text-sm text-slate-500">{new Date(m.startTime).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-slate-600">{m.status || "scheduled"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}