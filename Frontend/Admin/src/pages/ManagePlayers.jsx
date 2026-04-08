import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlayers, createPlayer, updatePlayer, updatePlayerStats, deletePlayer } from "../store/slices/playersSlice";
import { fetchTeams } from "../store/slices/teamSlice";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

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

export default function ManagePlayers() {
  const dispatch = useDispatch();
  const { players, loading, pagination } = useSelector((state) => state.players);
  const { teams } = useSelector((state) => state.teams);
  const [search, setSearch] = useState("");
  const [filterTeam, setFilterTeam] = useState("");
  const [filterCampus, setFilterCampus] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [relations, setRelations] = useState([]);
  const [teamHistory, setTeamHistory] = useState([]);
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const birthDate = watch("birthDate");

  // Calculate age from birth date
  useEffect(() => {
    if (birthDate) {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      setValue("age", age >= 0 ? age : "");
    }
  }, [birthDate, setValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    dispatch(fetchPlayers({ page, search: debouncedSearch, team: filterTeam, Campus: filterCampus }));
  }, [dispatch, page, debouncedSearch, filterTeam, filterCampus]);

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        role: data.role,
        Campus: data.Campus,
        imageUrl: data.imageUrl,
        team: data.team,
        playingRole: data.playingRole,
        battingStyle: data.battingStyle,
        bowlingStyle: data.bowlingStyle,
      };

      // Add optional fields
      if (data.birthDate || data.birthPlace) {
        payload.birthInfo = {
          date: data.birthDate || undefined,
          place: data.birthPlace || ""
        };
      }
      if (data.age) {
        payload.age = parseInt(data.age);
      }
      if (relations.length > 0) {
        payload.relations = relations;
      }
      if (teamHistory.length > 0) {
        payload.teamHistory = teamHistory;
      }

      if (editingId) {
        await dispatch(updatePlayer({ id: editingId, data: payload }));
        setEditingId(null);
      } else {
        await dispatch(createPlayer(payload));
      }
      reset();
      setRelations([]);
      setTeamHistory([]);
      setShowAdvanced(false);
    } catch (err) {
      console.error(err);
      alert(editingId ? "Failed to update player" : "Failed to create player");
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setValue("name", p.name);
    setValue("role", p.role);
    setValue("Campus", p.Campus);
    setValue("imageUrl", p.imageUrl);
    setValue("team", p.team?._id || p.team || "");
    setValue("playingRole", p.playingRole || "Batsman");
    setValue("battingStyle", p.battingStyle || "Right-handed");
    setValue("bowlingStyle", p.bowlingStyle || "Not Applicable");
    if (p.birthInfo) {
      setValue("birthDate", p.birthInfo.date ? new Date(p.birthInfo.date).toISOString().split('T')[0] : "");
      setValue("birthPlace", p.birthInfo.place || "");
    }
    setValue("age", p.age || "");
    if (p.relations) {
      setRelations(p.relations.map(rel => ({
        player: rel.player?._id || rel.player,
        relationType: rel.relationType
      })));
    }
    if (p.teamHistory) {
      setTeamHistory(p.teamHistory);
    }
    setShowAdvanced(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
    setRelations([]);
    setTeamHistory([]);
    setShowAdvanced(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this player?")) {
      await dispatch(deletePlayer(id));
    }
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

  // Removed filtered constant as filtering is now done on the backend

  return (
    <div className="space-y-8 bg-[#f8fafc] min-h-screen p-6">
      {/* Header section with premium styling */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#031d44] p-8 rounded-3xl shadow-2xl text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
        <div className="relative">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Player Registry</h2>
          <p className="text-blue-200/60 font-medium text-sm mt-1 uppercase tracking-widest">Manage your league's official talent pool</p>
        </div>
        <div className="relative flex items-center gap-4">
          <Link
            to="/admin/bulk-import"
            state={{ tab: "players" }}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-black text-xs uppercase tracking-widest border border-white/10 backdrop-blur-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Bulk Import
          </Link>
          <button
            onClick={() => { setEditingId(null); reset(); }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/40 transition-all active:scale-95"
          >
            Assign Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Filter & Form Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          {/* Add/Edit Form */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
            <div className="bg-[#031d44] px-6 py-4 border-b border-white/10">
              <h3 className="text-white font-black uppercase tracking-widest text-xs">
                {editingId ? "Edit Personnel" : "Draft New Player"}
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 ml-1">Full Name *</label>
                  <input {...register("name", { required: true })} placeholder="e.g. Virat Kohli" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all" />
                </div>

                {/* Born Date and Place */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 ml-1">Born (Date & Place) <span className="text-slate-300">(Optional)</span></label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" {...register("birthDate")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all" />
                    <input {...register("birthPlace")} placeholder="Place of birth" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all" />
                  </div>
                </div>

                {/* Age (Auto-calculated) */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 ml-1">Age <span className="text-slate-300">(Auto-calculated)</span></label>
                  <input {...register("age")} type="number" placeholder="Auto-calculated from birth date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all bg-slate-100" readOnly />
                </div>

                {/* Batting Style */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 ml-1">Batting Style</label>
                  <select {...register("battingStyle")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all">
                    {BATTING_STYLES.map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>

                {/* Bowling Style */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 ml-1">Bowling Style</label>
                  <select {...register("bowlingStyle")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all">
                    {BOWLING_STYLES.map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>

                {/* Playing Role */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 ml-1">Playing Role</label>
                  <select {...register("playingRole")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all">
                    {PLAYING_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {/* Team Assignment */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 ml-1">Team Assignment (Current)</label>
                  <select {...register("team")} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all">
                    <option value="">No Team</option>
                    {teams.map((t) => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Advanced Fields Toggle */}
                <div className="pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    {showAdvanced ? "Hide" : "Show"} Advanced Options
                  </button>
                </div>

                {/* Advanced Fields */}
                {showAdvanced && (
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    {/* Relations */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 block ml-1">Relations (With Any Player) <span className="text-slate-300">(Optional)</span></label>
                        <button type="button" onClick={addRelation} className="text-[9px] font-bold text-blue-600 hover:text-blue-700 uppercase">+ Add</button>
                      </div>
                      {relations.map((rel, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                          <select
                            value={rel.player}
                            onChange={(e) => updateRelation(index, "player", e.target.value)}
                            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                          >
                            <option value="">Select Player</option>
                            {players.map(p => (
                              <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                          </select>
                          <select
                            value={rel.relationType}
                            onChange={(e) => updateRelation(index, "relationType", e.target.value)}
                            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                          >
                            {RELATION_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                          <button type="button" onClick={() => removeRelation(index)} className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs font-bold">×</button>
                        </div>
                      ))}
                    </div>

                    {/* Team History */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 block ml-1">Teams (Current & Previous) <span className="text-slate-300">(Optional)</span></label>
                        <button type="button" onClick={addTeamHistory} className="text-[9px] font-bold text-blue-600 hover:text-blue-700 uppercase">+ Add</button>
                      </div>
                      {teamHistory.map((th, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 mb-2 items-end">
                          <select
                            value={th.team}
                            onChange={(e) => updateTeamHistory(index, "team", e.target.value)}
                            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
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
                            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                            placeholder="From"
                          />
                          <input
                            type="date"
                            value={th.to}
                            onChange={(e) => updateTeamHistory(index, "to", e.target.value)}
                            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                            placeholder="To"
                          />
                          <div className="flex gap-1">
                            <label className="flex items-center text-[8px] font-bold text-slate-600 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={th.isCurrent}
                                onChange={(e) => updateTeamHistory(index, "isCurrent", e.target.checked)}
                                className="mr-1"
                              />
                              Current
                            </label>
                            <button type="button" onClick={() => removeTeamHistory(index)} className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded text-xs font-bold">×</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Photo URL */}
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 ml-1">Photo URL</label>
                      <input {...register("imageUrl")} placeholder="https://..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all" />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button className={`w-full py-4 ${editingId ? "bg-green-600 hover:bg-green-700" : "bg-[#031d44] hover:bg-slate-800"} text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95`}>
                    {editingId ? "Update File" : "Enlist Player"}
                  </button>
                  {editingId && (
                    <button type="button" onClick={cancelEdit} className="w-full mt-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-200">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Advanced Filters</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Filter by Franchise</label>
                <select
                  value={filterTeam}
                  onChange={(e) => { setFilterTeam(e.target.value); setPage(1); }}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all"
                >
                  <option value="">All Regions</option>
                  {teams.map(t => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Campus Location</label>
                <input
                  type="text"
                  placeholder="Enter campus..."
                  value={filterCampus}
                  onChange={(e) => { setFilterCampus(e.target.value); setPage(1); }}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Player Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-slate-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <h3 className="text-2xl font-black text-[#031d44] uppercase tracking-tighter italic shrink-0">
                Talent Roster
                <span className="ml-3 text-sm font-bold text-slate-300 not-italic tracking-normal">({pagination.totalPlayers || 0})</span>
              </h3>

              <div className="relative w-full max-w-md group">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search personnel by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-800 transition-all"
                />
              </div>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Records...</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {players.map((p) => (
                <div key={p._id} className="group relative bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                  <div className="flex items-start gap-5 mb-6">
                    <div className="relative shrink-0">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-2xl object-cover bg-slate-50 shadow-inner group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 font-black text-xl italic italic">
                          {p.name?.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#031d44] rounded-lg flex items-center justify-center border-2 border-white shadow-lg">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-800 uppercase tracking-tighter truncate leading-tight group-hover:text-blue-600 transition-colors">{p.name}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{p.role || "Prospect"}</p>
                      <p className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block uppercase tracking-wider">
                        {p.team?.name || "Free Agent"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 group-hover:bg-white transition-colors">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Runs</p>
                      <input
                        type="number"
                        defaultValue={p.stats?.runs || 0}
                        onBlur={(e) =>
                          dispatch(updatePlayerStats({ id: p._id, stats: { ...p.stats, runs: +e.target.value } }))
                        }
                        className="w-full bg-transparent font-black text-slate-800 outline-none focus:text-blue-600 transition-colors"
                      />
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 group-hover:bg-white transition-colors">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Wickets</p>
                      <input
                        type="number"
                        defaultValue={p.stats?.wickets || 0}
                        onBlur={(e) =>
                          dispatch(updatePlayerStats({ id: p._id, stats: { ...p.stats, wickets: +e.target.value } }))
                        }
                        className="w-full bg-transparent font-black text-slate-800 outline-none focus:text-red-600 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/admin/players/${p._id}`} className="flex-1 py-2.5 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-400 font-bold text-[9px] uppercase tracking-widest rounded-xl transition-all border border-slate-100 text-center">Profile</Link>
                    <button onClick={() => handleEdit(p)} className="flex-1 py-2.5 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-400 font-bold text-[9px] uppercase tracking-widest rounded-xl transition-all border border-slate-100">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="px-3 py-2.5 bg-slate-50 hover:bg-red-600 hover:text-white text-slate-400 font-bold rounded-xl transition-all border border-slate-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {players.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg>
                </div>
                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">No Personnel Recorded</h4>
                <p className="text-slate-400 text-sm mt-2">Try adjusting your filters or search criteria.</p>
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between mt-12 pt-8 border-t border-slate-100 gap-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full">
                  Registry Page <span className="text-[#031d44]">{pagination.currentPage}</span> of <span className="text-[#031d44]">{pagination.totalPages}</span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-6 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
                    disabled={page === pagination.totalPages}
                    className="px-6 py-3 bg-[#031d44] text-white rounded-xl hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/10"
                  >
                    Next Page
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}