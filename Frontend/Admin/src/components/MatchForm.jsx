import { useState } from "react";
import { createPlayer } from "../services/playerApi";

export default function PlayerForm({ onCreated }) {
  const [form, setForm] = useState({
    name: "",
    role: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name) return alert("Name required");

    await createPlayer(form);
    setForm({ name: "", role: "" });
    onCreated();
  };

  return (
    <form onSubmit={submit} className="space-y-2 mb-4">
      <input
        className="border p-2 w-full"
        placeholder="Player Name"
        name="name"
        value={form.name}
        onChange={handleChange}
      />

      <input
        className="border p-2 w-full"
        placeholder="Role (Batsman / Bowler)"
        name="role"
        value={form.role}
        onChange={handleChange}
      />

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Add Player
      </button>
    </form>
  );
}
