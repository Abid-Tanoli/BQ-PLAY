import { useEffect, useState } from "react";
import { createPlayer } from "../services/playerApi";
import { getTeams } from "../services/teamApi";
import { getSocket } from "../store/socket";

export default function PlayerForm() {
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({
    name: "",
    role: "",
    Campus: "",
    team: "",
  });

  useEffect(() => {
    getTeams().then(setTeams);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const player = await createPlayer(form);

    setForm({ name: "", role: "", Campus: "", team: "" });

    getSocket()?.emit("players:updated", player);
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

      <input
        className="border p-2"
        placeholder="Campus"
        value={form.Campus}
        onChange={e => setForm({ ...form, Campus: e.target.value })}
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
