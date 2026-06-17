import React, { useEffect, useState } from "react";
import { api } from "../services/api";

export default function CreatePlayerProfile({ onSuccess, onCancel }) {
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({
    name: "",
    playingRole: "",
    battingStyle: "",
    bowlingStyle: "",
    team: "",
    imageUrl: "",
    category: "Other",
    subCategory: "",
    ageGroup: "Open",
    organization: "",
    "address.town": "",
    "address.district": "",
    "address.city": "",
    "address.province": "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get("/teams", { timeout: 8000 })
      .then(res => setTeams(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setErr(null);
    setLoading(true);
    try {
      const payload = { ...form };
      payload.address = {
        town: form["address.town"],
        district: form["address.district"],
        city: form["address.city"],
        province: form["address.province"],
      };
      delete payload["address.town"];
      delete payload["address.district"];
      delete payload["address.city"];
      delete payload["address.province"];
      if (!payload.team) delete payload.team;
      await api.post("/players", payload);
      setSuccess(true);
      setTimeout(() => onSuccess?.(), 1500);
    } catch (error) {
      setErr(error.response?.data?.message || "Failed to create player profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-cric-text/70 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-cric-border bg-cric-card shadow-sm">
        <div className="bg-cric-accent px-6 py-5 text-white flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest">Create Player Profile</h2>
          <button type="button" onClick={onCancel} className="rounded-lg bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/20">Close</button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-sm font-black text-green-700 uppercase tracking-wider">Player profile created successfully!</p>
            </div>
          )}

          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-cric-muted mb-2">Full Name</label>
            <input value={form.name} onChange={set("name")} required placeholder="Enter full name" className="w-full p-3 bg-cric-bg border border-cric-border rounded-xl focus:ring-2 focus:ring-cric-accent outline-none font-bold text-cric-text transition-all" />
          </div>

          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-cric-muted mb-2">Playing Role</label>
            <select value={form.playingRole} onChange={set("playingRole")} className="w-full p-3 bg-cric-bg border border-cric-border rounded-xl focus:ring-2 focus:ring-cric-accent outline-none font-bold text-cric-text">
              <option value="">Select Role</option>
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="All-Rounder">All-Rounder</option>
              <option value="Batting-All-Rounder">Batting-All-Rounder</option>
              <option value="Bowling-All-Rounder">Bowling-All-Rounder</option>
              <option value="Wicket-Keeper">Wicket-Keeper</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-cric-muted mb-2">Batting Style</label>
            <select value={form.battingStyle} onChange={set("battingStyle")} className="w-full p-3 bg-cric-bg border border-cric-border rounded-xl focus:ring-2 focus:ring-cric-accent outline-none font-bold text-cric-text">
              <option value="">Select Style</option>
              <option value="Right-handed">Right-handed</option>
              <option value="Left-handed">Left-handed</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-cric-muted mb-2">Bowling Style</label>
            <select value={form.bowlingStyle} onChange={set("bowlingStyle")} className="w-full p-3 bg-cric-bg border border-cric-border rounded-xl focus:ring-2 focus:ring-cric-accent outline-none font-bold text-cric-text">
              <option value="">Select Style</option>
              <option value="Right-arm Fast">Right-arm Fast</option>
              <option value="Right-arm Fast-Medium">Right-arm Fast-Medium</option>
              <option value="Right-arm Medium">Right-arm Medium</option>
              <option value="Right-arm Off-break">Right-arm Off-break</option>
              <option value="Right-arm Leg-break">Right-arm Leg-break</option>
              <option value="Left-arm Fast">Left-arm Fast</option>
              <option value="Left-arm Orthodox">Left-arm Orthodox</option>
              <option value="Not Applicable">Not Applicable</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-cric-muted mb-2">Team Assignment</label>
            <select value={form.team} onChange={set("team")} className="w-full p-3 bg-cric-bg border border-cric-border rounded-xl focus:ring-2 focus:ring-cric-accent outline-none font-bold text-cric-text">
              <option value="">Agent (No Team)</option>
              {teams.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-cric-muted mb-2">Photo URL</label>
            <input value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://..." className="w-full p-3 bg-cric-bg border border-cric-border rounded-xl focus:ring-2 focus:ring-cric-accent outline-none font-bold text-cric-text transition-all" />
          </div>

          <div className="bg-cric-bg p-4 rounded-xl border border-cric-border space-y-3">
            <label className="block text-[9px] font-black uppercase tracking-widest text-cric-muted mb-1">Categorization</label>
            <select value={form.category} onChange={set("category")} className="w-full p-2 bg-cric-card border border-cric-border rounded-lg text-xs font-bold text-cric-text">
              {["School", "College", "University", "Organization", "Business", "Industry", "Club", "International", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={form.subCategory} onChange={set("subCategory")} placeholder="Sub-Category (e.g. CS, Eng)" className="w-full p-2 bg-cric-card border border-cric-border rounded-lg text-xs font-bold text-cric-text" />
            <select value={form.ageGroup} onChange={set("ageGroup")} className="w-full p-2 bg-cric-card border border-cric-border rounded-lg text-xs font-bold text-cric-text">
              {["U-10", "U-13", "U-15", "U-17", "U-19", "Open"].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <input value={form.organization} onChange={set("organization")} placeholder="Institution Name" className="w-full p-2 bg-cric-card border border-cric-border rounded-lg text-xs font-bold text-cric-text" />
          </div>

          <div className="bg-cric-bg p-4 rounded-xl border border-cric-border space-y-2">
            <label className="block text-[9px] font-black uppercase tracking-widest text-cric-muted mb-1">Location</label>
            <input value={form["address.town"]} onChange={set("address.town")} placeholder="Town" className="w-full p-2 bg-cric-card border border-cric-border rounded-lg text-xs font-bold text-cric-text" />
            <input value={form["address.district"]} onChange={set("address.district")} placeholder="District" className="w-full p-2 bg-cric-card border border-cric-border rounded-lg text-xs font-bold text-cric-text" />
            <input value={form["address.city"]} onChange={set("address.city")} placeholder="City" className="w-full p-2 bg-cric-card border border-cric-border rounded-lg text-xs font-bold text-cric-text" />
            <input value={form["address.province"]} onChange={set("address.province")} placeholder="Province" className="w-full p-2 bg-cric-card border border-cric-border rounded-lg text-xs font-bold text-cric-text" />
          </div>

          {err && <p className="text-red-500 text-sm font-bold">{err}</p>}

          <button type="submit" disabled={loading} className="w-full py-4 bg-cric-accent hover:bg-cric-accent/90 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl active:scale-95 disabled:opacity-60">
            {loading ? "Creating..." : success ? "Done!" : "Enlist Player"}
          </button>
        </form>
      </div>
    </div>
  );
}