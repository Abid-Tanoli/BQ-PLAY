import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTournaments } from "../store/slices/tournamentsSlice";
import { Link } from "react-router-dom";

export default function ManageTournaments() {
  const dispatch = useDispatch();
  const { tournaments, loading } = useSelector((state) => state.tournaments);

  useEffect(() => {
    dispatch(fetchTournaments());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tournaments</h2>
        <Link 
          to="/admin/tournaments/create" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Create Tournament
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament) => (
          <Link 
            key={tournament._id} 
            to={`/admin/tournaments/${tournament._id}`}
            className="card hover:shadow-lg transition-shadow"
          >
            <h3 className="font-bold text-lg mb-2">{tournament.name}</h3>
            <p className="text-sm text-slate-600 mb-3">{tournament.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                {new Date(tournament.startDate).toLocaleDateString()}
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                tournament.status === "ongoing" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-slate-100 text-slate-700"
              }`}>
                {tournament.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}