import { useEffect, useState } from "react";
import { createPlayer } from "../services/playerApi";
import { getTeams } from "../services/teamApi";
import { getSocket } from "../store/socket";

const PLAYING_ROLES = [
  "Batsman",
  "Bowler",
  "All-Rounder",
  "Batting-All-Rounder",
  "Bowling-All-Rounder",
  "Wicket-Keeper"
];

const BATTING_STYLES = [
  "Right-handed",
  "Left-handed"
];

const BOWLING_STYLES = [
  "Right-arm Fast",
  "Right-arm Fast-Medium",
  "Right-arm Medium",
  "Right-arm Medium-Pace",
  "Right-arm Off-break",
  "Right-arm Leg-break",
  "Right-arm Slow",
  "Left-arm Fast",
  "Left-arm Fast-Medium",
  "Left-arm Medium",
  "Left-arm Medium-Pace",
  "Left-arm Orthodox",
  "Left-arm Chinaman",
  "Left-arm Slow",
  "Not Applicable"
];

export default function PlayerForm() {
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({
    name: "",
    playingRole: "Batsman",
    battingStyle: "Right-handed",
    bowlingStyle: "Not Applicable",
    role: "",
    Campus: "",
    team: "",
    imageUrl: ""
  });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    getTeams().then(setTeams);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Player name is required");
      return;
    }
    const player = await createPlayer(form);

    setForm({
      name: "",
      playingRole: "Batsman",
      battingStyle: "Right-handed",
      bowlingStyle: "Not Applicable",
      role: "",
      Campus: "",
      team: "",
      imageUrl: ""
    });
    setExpanded(false);

    getSocket()?.emit("players:updated", player);
    alert("Player added successfully");
  };

  return (
    <div className="mb-6">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all"
        >
          + Add New Player
        </button>
      ) : (
        <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Add New Player</h3>
            <button
              onClick={() => setExpanded(false)}
              className="text-slate-500 hover:text-slate-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Basic Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Player Name *
                </label>
                <input
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Playing Role
                </label>
                <select
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.playingRole}
                  onChange={e => setForm({ ...form, playingRole: e.target.value })}
                >
                  {PLAYING_ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Team
                </label>
                <select
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.team}
                  onChange={e => setForm({ ...form, team: e.target.value })}
                >
                  <option value="">Select Team</option>
                  {teams.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Batting & Bowling Styles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Batting Style
                </label>
                <select
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.battingStyle}
                  onChange={e => setForm({ ...form, battingStyle: e.target.value })}
                >
                  {BATTING_STYLES.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Bowling Style
                </label>
                <select
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.bowlingStyle}
                  onChange={e => setForm({ ...form, bowlingStyle: e.target.value })}
                >
                  {BOWLING_STYLES.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Role/Position
                </label>
                <input
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Captain, VP"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Campus/City
                </label>
                <input
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Campus name"
                  value={form.Campus}
                  onChange={e => setForm({ ...form, Campus: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Image URL
                </label>
                <input
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Profile image URL"
                  value={form.imageUrl}
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 rounded-lg font-bold transition-all shadow-lg"
              >
                Add Player
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
