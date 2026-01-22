import { useEffect, useState } from "react";
import { createPlayer } from "../services/playerApi";
import { getTeams } from "../services/teamApi";

export default function PlayerForm({ onChange }) {
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({
    name: "",
    role: "",
    team: "",
  });

  useEffect(() => {
    getTeams().then(setTeams);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await createPlayer(form);
    setForm({ name: "", role: "", team: "" });
    onChange();
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-4 gap-2 mb-4">
      <input
        className="border p-2"
        placeholder="Name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />

      <input
        className="border p-2"
        placeholder="Role"
        value={form.role}
        onChange={e => setForm({ ...form, role: e.target.value })}
      />

      <select
        className="border p-2"
        value={form.team}
        onChange={e => setForm({ ...form, team: e.target.value })}
      >
        <option value="">Select Team</option>
        {teams.map(t => (
          <option key={t._id} value={t._id}>{t.name}</option>
        ))}
      </select>

      <button className="bg-blue-600 text-white rounded">
        Add
      </button>
    </form>
  );
}
