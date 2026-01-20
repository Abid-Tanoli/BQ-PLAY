import React from "react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/live", label: "Live Scores" },
  { to: "/admin/matches", label: "Manage Matches" },
  { to: "/admin/players", label: "Manage Players" },
  { to: "/admin/score", label: "Manage Score" },
  { to: "/admin/tournament", label: "Tournament Table" },
];

export default function Sidebar() {
  return (
    <div className="p-4">
      <div className="mb-6 text-center">
        <div className="text-lg font-semibold">BQ-PLAY</div>
        <div className="text-xs text-slate-500">Admin Panel</div>
      </div>

      <nav className="flex flex-col gap-2">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `px-3 py-2 rounded text-sm ${isActive ? "bg-slate-100 font-medium" : "text-slate-700"}`
            }
          >
            {it.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}