import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlayers } from "../store/slices/playersSlice";

export default function ManagePlayers() {
  const dispatch = useDispatch();
  const { players, loading } = useSelector((s) => s.players);

  useEffect(() => {
    dispatch(fetchPlayers());
  }, [dispatch]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Players</h2>

      <div className="card">
        {loading && <div>Loading players...</div>}
        <div className="space-y-2">
          {players.map((p) => (
            <div key={p._id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-slate-500">{p.role}</div>
              </div>
              <div className="text-sm text-slate-600">#{p.ranking || "-"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}