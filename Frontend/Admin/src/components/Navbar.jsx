import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();

  return (
    <div className="flex items-center justify-between p-10">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold">BQ-Play - Admin</h1>

        <nav className="hidden sm:flex gap-10 text-sm text-slate-600">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/live">Live Scores</Link>
          <Link to="/admin/matches">ManageMatches</Link>
          <Link to="/admin/players">ManagePlayers</Link>
          <Link to="/admin/score">ManageScore</Link>
          <Link to="/admin/tournament">Tournament</Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button className="text-sm px-3 py-1 border rounded" onClick={() => dispatch(logout())}>
          Logout
        </button>
      </div>
    </div>
  );
}