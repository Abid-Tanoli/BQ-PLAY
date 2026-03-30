import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlayers, updatePlayerStats, deletePlayerById } from "../store/slices/playersSlice";

const ROLE_COLORS = {
  "Batsman": "bg-blue-100 text-blue-700",
  "Bowler": "bg-green-100 text-green-700",
  "All-Rounder": "bg-purple-100 text-purple-700",
  "Batting-All-Rounder": "bg-cyan-100 text-cyan-700",
  "Bowling-All-Rounder": "bg-lime-100 text-lime-700",
  "Wicket-Keeper": "bg-orange-100 text-orange-700"
};

const BATTING_STYLE_ICONS = {
  "Right-handed": "🤜",
  "Left-handed": "🤛"
};

export default function PlayerList() {
  const dispatch = useDispatch();
  const { players, loading, error } = useSelector(state => state.players);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [view, setView] = useState("table"); // table or card

  useEffect(() => {
    dispatch(fetchPlayers());
  }, [dispatch]);

  const filtered = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "All" || p.playingRole === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div><p className="mt-2">Loading players...</p></div>;
  if (error) return <p className="text-red-500 font-bold">{error}</p>;

  return (
    <div className="space-y-4">
      {/* Header with Search & Filters */}
      <div className="space-y-3">
        <input
          className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="🔍 Search player by name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterRole("All")}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${filterRole === "All" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}
          >
            All Players ({players.length})
          </button>
          {["Batsman", "Bowler", "All-Rounder", "Batting-All-Rounder", "Bowling-All-Rounder", "Wicket-Keeper"].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${filterRole === role ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}
            >
              {role} ({players.filter(p => p.playingRole === role).length})
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView("table")}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${view === "table" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"}`}
          >
            📊 Table View
          </button>
          <button
            onClick={() => setView("card")}
            className={`flex-1 py-2 rounded-lg font-bold transition-colors ${view === "card" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"}`}
          >
            🎴 Card View
          </button>
        </div>
      </div>

      {/* Table View */}
      {view === "table" && (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-900 text-white sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left font-bold">Player</th>
                <th className="px-4 py-3 text-center font-bold">Role</th>
                <th className="px-4 py-3 text-center font-bold">Bat Style</th>
                <th className="px-4 py-3 text-center font-bold">Bowl Style</th>
                <th className="px-4 py-3 text-center font-bold">Team</th>
                <th className="px-4 py-3 text-right font-bold">Runs</th>
                <th className="px-4 py-3 text-right font-bold">Wickets</th>
                <th className="px-4 py-3 text-center font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map(p => (
                <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-bold text-slate-800">{p.name}</p>
                      {p.Campus && <p className="text-xs text-slate-500">{p.Campus}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${ROLE_COLORS[p.playingRole] || "bg-slate-100 text-slate-700"}`}>
                      {p.playingRole}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-lg">{BATTING_STYLE_ICONS[p.battingStyle]}</span>
                      <span className="text-sm font-medium">{p.battingStyle}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-medium text-slate-600">{p.bowlingStyle}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-medium">{p.team?.name || "-"}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600">{p.stats?.runs || 0}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-600">{p.stats?.wickets || 0}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      className="text-red-600 hover:text-red-800 font-bold text-sm"
                      onClick={() => {
                        if (confirm(`Delete ${p.name}?`)) {
                          dispatch(deletePlayerById(p._id));
                        }
                      }}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Card View */}
      {view === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <div key={p._id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
              {/* Header */}
              <div className={`${ROLE_COLORS[p.playingRole] || "bg-slate-100"} px-4 py-3`}>
                <h3 className="font-bold text-lg">{p.name}</h3>
                <p className="text-sm opacity-75">{p.playingRole}</p>
              </div>

              {/* Body */}
              <div className="px-4 py-3 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Bat Style</p>
                    <p className="font-bold">{BATTING_STYLE_ICONS[p.battingStyle]} {p.battingStyle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Bowl Style</p>
                    <p className="font-bold text-xs">{p.bowlingStyle}</p>
                  </div>
                </div>

                {p.Campus && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Campus</p>
                    <p className="font-medium text-sm">{p.Campus}</p>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <p className="text-xs text-slate-500 uppercase font-bold">Team</p>
                  <p className="font-medium">{p.team?.name || "Not assigned"}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Runs</p>
                    <p className="text-xl font-bold text-blue-600">{p.stats?.runs || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Wickets</p>
                    <p className="text-xl font-bold text-green-600">{p.stats?.wickets || 0}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-slate-50 border-t flex gap-2">
                <button
                  className="flex-1 text-sm text-blue-600 hover:text-blue-800 font-bold"
                >
                  Edit
                </button>
                <button
                  className="flex-1 text-sm text-red-600 hover:text-red-800 font-bold"
                  onClick={() => {
                    if (confirm(`Delete ${p.name}?`)) {
                      dispatch(deletePlayerById(p._id));
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p className="text-lg font-medium">No players found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}