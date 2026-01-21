import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchMatches } from "../store/slices/matchesSlice";

export default function Dashboard() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMatches());
  }, [dispatch]);

  return (
    <div className="flex flex-row items-center justify-between space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
        <div className="card">
          <h3 className="font-semibold">Live Matches</h3>
          <p className="text-sm text-slate-500">Live updates streaming</p>
        </div>

        <div className="card">
          <h3 className="font-semibold">Upcoming</h3>
          <p className="text-sm text-slate-500">Schedule & series</p>
        </div>

        <div className="card">
          <h3 className="font-semibold">Recent Results</h3>
          <p className="text-sm text-slate-500">Last matches data</p>
        </div>
      </div>
    </div>
  );
}