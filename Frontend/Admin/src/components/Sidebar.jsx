import React from "react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { to: "/admin", label: "Dashboard", icon: "📊" },
  { to: "/admin/live", label: "Live Scores", icon: "🏏" },
  { to: "/admin/score", label: "Live Scoring", icon: "🎯" },
  { to: "/admin/events", label: "Manage Events", icon: "📅" },
  { to: "/admin/teams", label: "Manage Teams", icon: "👥" },
  { to: "/admin/players", label: "Manage Players", icon: "⭐" },
  { to: "/admin/bulk-import", label: "Bulk Import", icon: "📥" },
  { to: "/admin/blogs", label: "Manage Blogs", icon: "📝" },
  { to: "/admin/rankings", label: "Rankings", icon: "🎖️" },
];

export default function Sidebar({ onClose }) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-black text-[#031d44]">BQ-PLAY</h1>
        <p className="text-xs text-slate-500 mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/admin"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100"
                  }`
                }
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
