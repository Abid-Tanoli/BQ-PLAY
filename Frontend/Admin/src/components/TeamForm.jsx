import { useState } from "react";
import { useDispatch } from "react-redux";
import { addTeam } from "../store/slices/teamSlice";

export default function TeamForm() {
  const [form, setForm] = useState({ name: "", logo: "" });
  const dispatch = useDispatch();

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name) return alert("Team name is required");

    await dispatch(addTeam(form));
    setForm({ name: "", logo: "" });
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-3 gap-2 mb-4">
      <input
        className="border p-2"
        placeholder="Team Name"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />

      <input
        className="border p-2"
        placeholder="Logo URL (optional)"
        value={form.logo}
        onChange={e => setForm({ ...form, logo: e.target.value })}
      />

      <button className="bg-blue-600 text-white rounded">Add Team</button>
    </form>
  );
}
