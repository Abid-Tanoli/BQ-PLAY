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

const RELATION_TYPES = [
  "Father",
  "Mother",
  "Brother",
  "Sister",
  "Son",
  "Daughter",
  "Husband",
  "Wife",
  "Coach",
  "Mentor",
  "Other"
];

export default function PlayerForm() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    playingRole: "Batsman",
    battingStyle: "Right-handed",
    bowlingStyle: "Not Applicable",
    role: "",
    Campus: "",
    team: "",
    imageUrl: "",
    birthDate: "",
    birthPlace: "",
    age: ""
  });
  const [expanded, setExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [relations, setRelations] = useState([]);
  const [teamHistory, setTeamHistory] = useState([]);

  useEffect(() => {
    getTeams().then(setTeams);
  }, []);

  // Calculate age from birth date
  useEffect(() => {
    if (form.birthDate) {
      const today = new Date();
      const birth = new Date(form.birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      setForm({ ...form, age: age >= 0 ? age : "" });
    }
  }, [form.birthDate]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Player name is required");
      return;
    }

    const payload = {
      name: form.name,
      playingRole: form.playingRole,
      battingStyle: form.battingStyle,
      bowlingStyle: form.bowlingStyle,
      role: form.role,
      Campus: form.Campus,
      team: form.team,
      imageUrl: form.imageUrl
    };

    // Add optional fields
    if (form.birthDate || form.birthPlace) {
      payload.birthInfo = {
        date: form.birthDate || undefined,
        place: form.birthPlace || ""
      };
    }
    if (form.age) {
      payload.age = parseInt(form.age);
    }
    if (relations.length > 0) {
      payload.relations = relations;
    }
    if (teamHistory.length > 0) {
      payload.teamHistory = teamHistory;
    }

    const player = await createPlayer(payload);

    setForm({
      name: "",
      playingRole: "Batsman",
      battingStyle: "Right-handed",
      bowlingStyle: "Not Applicable",
      role: "",
      Campus: "",
      team: "",
      imageUrl: "",
      birthDate: "",
      birthPlace: "",
      age: ""
    });
    setRelations([]);
    setTeamHistory([]);
    setShowAdvanced(false);
    setExpanded(false);

    getSocket()?.emit("players:updated", player);
    alert("Player added successfully");
  };

  const addRelation = () => {
    setRelations([...relations, { player: "", relationType: "Brother" }]);
  };

  const removeRelation = (index) => {
    setRelations(relations.filter((_, i) => i !== index));
  };

  const updateRelation = (index, field, value) => {
    const updated = [...relations];
    updated[index] = { ...updated[index], [field]: value };
    setRelations(updated);
  };

  const addTeamHistory = () => {
    setTeamHistory([...teamHistory, { team: "", from: "", to: "", isCurrent: false }]);
  };

  const removeTeamHistory = (index) => {
    setTeamHistory(teamHistory.filter((_, i) => i !== index));
  };

  const updateTeamHistory = (index, field, value) => {
    const updated = [...teamHistory];
    updated[index] = { ...updated[index], [field]: value };
    setTeamHistory(updated);
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
            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Born Date and Place */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Born (Date) <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.birthDate}
                  onChange={e => setForm({ ...form, birthDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Born (Place) <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Place of birth"
                  value={form.birthPlace}
                  onChange={e => setForm({ ...form, birthPlace: e.target.value })}
                />
              </div>
            </div>

            {/* Age (Auto-calculated) */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Age <span className="text-slate-400 font-normal">(Auto-calculated)</span>
              </label>
              <input
                type="number"
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.age}
                readOnly
              />
            </div>

            {/* Batting, Bowling & Playing Role */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>

            {/* Team */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Team (Current)
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

            {/* Advanced Fields Toggle */}
            <div className="pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-2 rounded-lg font-bold transition-colors"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced Options
              </button>
            </div>

            {/* Advanced Fields */}
            {showAdvanced && (
              <div className="space-y-4 pt-4 border-t">
                {/* Relations */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-700">
                      Relations (With Any Player) <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <button type="button" onClick={addRelation} className="text-xs text-blue-600 hover:text-blue-700 font-bold">+ Add</button>
                  </div>
                  {relations.map((rel, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                      <select
                        value={rel.player}
                        onChange={(e) => updateRelation(index, "player", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      >
                        <option value="">Select Player</option>
                        {players.map(p => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                      <select
                        value={rel.relationType}
                        onChange={(e) => updateRelation(index, "relationType", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      >
                        {RELATION_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => removeRelation(index)} className="bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-bold">×</button>
                    </div>
                  ))}
                </div>

                {/* Team History */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-700">
                      Teams (Current & Previous) <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <button type="button" onClick={addTeamHistory} className="text-xs text-blue-600 hover:text-blue-700 font-bold">+ Add</button>
                  </div>
                  {teamHistory.map((th, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 mb-2 items-end">
                      <select
                        value={th.team}
                        onChange={(e) => updateTeamHistory(index, "team", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      >
                        <option value="">Select Team</option>
                        {teams.map(t => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={th.from}
                        onChange={(e) => updateTeamHistory(index, "from", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      />
                      <input
                        type="date"
                        value={th.to}
                        onChange={(e) => updateTeamHistory(index, "to", e.target.value)}
                        className="w-full border border-slate-300 rounded-lg p-2 text-sm"
                      />
                      <div className="flex items-center gap-1">
                        <label className="flex items-center text-xs">
                          <input
                            type="checkbox"
                            checked={th.isCurrent}
                            onChange={(e) => updateTeamHistory(index, "isCurrent", e.target.checked)}
                            className="mr-1"
                          />
                          Current
                        </label>
                        <button type="button" onClick={() => removeTeamHistory(index)} className="bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-bold px-2">×</button>
                      </div>
                    </div>
                  ))}
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
              </div>
            )}

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
