import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeams, createTeam, updateTeam, deleteTeam, addPlayersToTeam } from "../store/slices/teamSlice";
import { fetchPlayers } from "../store/slices/playersSlice";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { initSocket } from "../store/socket";

export default function Teams() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { teams, loading } = useSelector((state) => state.teams);
  const { players } = useSelector((state) => state.players);
  const [editingId, setEditingId] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerTab, setPlayerTab] = useState("current"); // "current" | "add"
  const [savingPlayers, setSavingPlayers] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    dispatch(fetchTeams());
    // Fetch ALL players with a high limit so the modal pool is complete
    dispatch(fetchPlayers({ page: 1, limit: 500 }));

    const socket = initSocket();
    socket.emit("join-teams");
    socket.on("team:created", () => dispatch(fetchTeams()));
    socket.on("team:updated", () => dispatch(fetchTeams()));
    socket.on("team:deleted", () => dispatch(fetchTeams()));

    return () => {
      socket.off("team:created");
      socket.off("team:updated");
      socket.off("team:deleted");
    };
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await dispatch(updateTeam({ id: editingId, data })).unwrap();
        setEditingId(null);
      } else {
        await dispatch(createTeam(data)).unwrap();
      }
      reset();
    } catch (err) {
      alert(err || "Failed to save team");
    }
  };

  const onEdit = (team) => {
    setEditingId(team._id);
    setValue("name", team.name);
    setValue("ownername", team.ownername || "");
    setValue("logo", team.logo || "");
    setValue("shortName", team.shortName || "");
  };

  const onDelete = async (id) => {
    if (window.confirm("Delete this team? This will also remove team assignment from all players.")) {
      try {
        await dispatch(deleteTeam(id)).unwrap();
      } catch (err) {
        alert(err || "Failed to delete team");
      }
    }
  };

  const openPlayerModal = (team) => {
    setShowPlayerModal(team);
    // Pre-select players already in this team — ensure all IDs are plain strings
    const currentIds = (team.players || []).map(p => String(p._id || p));
    setSelectedPlayers(currentIds);
    setPlayerSearch("");
    setPlayerTab("current");
  };

  const closePlayerModal = () => {
    setShowPlayerModal(null);
    setSelectedPlayers([]);
    setPlayerSearch("");
  };

  const togglePlayer = (playerId) => {
    const id = String(playerId);
    setSelectedPlayers(prev =>
      prev.includes(id)
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
    );
  };

  const savePlayerSelection = async () => {
    if (!showPlayerModal) return;
    setSavingPlayers(true);
    try {
      await dispatch(addPlayersToTeam({
        id: showPlayerModal._id,
        playerIds: selectedPlayers
      })).unwrap();
      await dispatch(fetchTeams());
      closePlayerModal();
    } catch (err) {
      alert(err || "Failed to update team players");
    } finally {
      setSavingPlayers(false);
    }
  };

  // Players currently in this team — read directly from populated showPlayerModal.players
  // These are already populated objects from the API (name, role, _id etc.)
  const getCurrentPlayers = () => {
    if (!showPlayerModal) return [];
    // Use populated objects directly from the team object returned by API
    const populated = (showPlayerModal.players || []).filter(p => typeof p === 'object' && p._id);
    if (populated.length > 0) {
      // Filter by selectedPlayers to reflect any deselections made in the session
      return populated.filter(p => selectedPlayers.includes(String(p._id)));
    }
    // Fallback: use Redux store (for raw ID arrays)
    return players.filter(p => selectedPlayers.includes(String(p._id)));
  };


  // All players NOT currently selected, filtered by search
  const getAddablePlayers = () => {
    if (!showPlayerModal) return [];
    return players.filter(p => {
      const notSelected = !selectedPlayers.includes(String(p._id));
      const matchesSearch = !playerSearch ||
        p.name?.toLowerCase().includes(playerSearch.toLowerCase()) ||
        p.role?.toLowerCase().includes(playerSearch.toLowerCase()) ||
        p.Campus?.toLowerCase().includes(playerSearch.toLowerCase());
      return notSelected && matchesSearch;
    });
  };

  const getTeamPlayerCount = (team) => {
    return team.players?.length || 0;
  };

  return (
    <div className="space-y-8 bg-[#f8fafc] min-h-screen p-6">
      {/* Header section with premium styling */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#031d44] p-8 rounded-3xl shadow-2xl text-white">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Team Command Center</h2>
          <p className="text-blue-200/60 font-medium text-sm mt-1 uppercase tracking-widest">Manage your league's franchises and rosters</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/admin/bulk-import"
            state={{ tab: "teams" }}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all font-black text-xs uppercase tracking-widest border border-white/10 backdrop-blur-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Bulk Import
          </Link>
          <button 
            onClick={() => { setEditingId(null); reset(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/40 transition-all active:scale-95"
          >
            New Team
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Add/Edit Form as a sidebar card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 sticky top-6">
            <div className="bg-[#031d44] px-6 py-4 border-b border-white/10">
              <h3 className="text-white font-black uppercase tracking-widest text-xs">
                {editingId ? "Edit Team Profile" : "Register New Team"}
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 ml-1">Team Name</label>
                  <input
                    {...register("name", { required: true })}
                    placeholder="e.g. Mumbai Indians"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 placeholder:text-slate-300 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 ml-1">Short Name</label>
                  <input
                    {...register("shortName")}
                    placeholder="e.g. MI"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 placeholder:text-slate-300 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 ml-1">Owner / Manager</label>
                  <input
                    {...register("ownername")}
                    placeholder="Enter full name"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 placeholder:text-slate-300 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1.5 ml-1">Logo URL</label>
                  <input
                    {...register("logo")}
                    placeholder="https://..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 placeholder:text-slate-300 transition-all"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#031d44] hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 active:scale-95"
                  >
                    {loading ? "Processing..." : editingId ? "Update Team" : "Create Team"}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => { setEditingId(null); reset(); }}
                      className="w-full mt-3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                    >
                      Discard Changes
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side: Teams Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Fetching franchises...</p>
              </div>
            )}
            {teams.map((team) => (
              <div 
                key={team._id} 
                className="group relative bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-200 overflow-hidden cursor-pointer flex flex-col"
                onClick={() => navigate(`/admin/teams/${team._id}`)}
              >
                {/* Team Card Background Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-16 -mt-16 group-hover:bg-blue-50 transition-colors duration-500" />
                
                <div className="p-8 relative flex-1">
                  <div className="flex items-start gap-6">
                    {/* Logo with premium frame */}
                    <div className="relative">
                      <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-3 shadow-inner group-hover:scale-110 transition-transform duration-500">
                        {team.logo ? (
                          <img
                            src={team.logo}
                            alt={team.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-[#031d44] rounded-xl flex items-center justify-center font-black text-white text-2xl italic">
                            {team.shortName || team.name?.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg uppercase">
                        {team.shortName || "tm"}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter italic leading-none mb-2 group-hover:text-blue-600 transition-colors">
                        {team.name}
                      </h3>
                      {team.ownername && (
                        <div className="flex items-center gap-2">
                           <div className="w-1 h-1 bg-slate-300 rounded-full" />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Owner: {team.ownername}</p>
                        </div>
                      )}
                      
                      {/* Stat summary */}
                      <div className="mt-6 grid grid-cols-2 gap-4">
                         <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 group-hover:bg-white transition-colors">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Squad Size</p>
                            <p className="text-lg font-black text-slate-800">{getTeamPlayerCount(team)}</p>
                         </div>
                         <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 group-hover:bg-white transition-colors">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-[10px] font-black text-green-600 uppercase">Active</p>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openPlayerModal(team)}
                    className="flex-[2] py-2.5 text-[10px] font-black uppercase tracking-widest text-[#031d44] hover:bg-white bg-slate-200/50 rounded-xl transition-all border border-transparent hover:border-slate-200"
                  >
                    Manage Squad
                  </button>
                  <button
                    onClick={() => onEdit(team)}
                    className="flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-200 hover:border-transparent"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(team._id)}
                    className="flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-red-200 hover:border-transparent"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {teams.length === 0 && !loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">No Teams Found</h3>
                <p className="text-slate-400 text-sm mt-2 max-w-xs text-center">Start building your league by adding teams in the sidebar.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Player Management Modal - Re-styled for premium feel */}
      {showPlayerModal && (
        <div className="fixed inset-0 bg-[#031d44]/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

            {/* Modal Header */}
            <div className="p-8 border-b bg-[#031d44] text-white overflow-hidden relative">
              {/* Abstract Background patterns */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center p-2 backdrop-blur-md border border-white/20">
                    {showPlayerModal.logo ? (
                      <img src={showPlayerModal.logo} className="w-full h-full object-contain" alt="" />
                    ) : (
                      <div className="w-full h-full bg-white/20 rounded-xl flex items-center justify-center font-black text-lg italic">
                        {showPlayerModal.shortName || showPlayerModal.name?.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-2xl uppercase tracking-tighter italic">{showPlayerModal.name}</h3>
                    <p className="text-blue-300/60 font-black text-[10px] uppercase tracking-widest">Managing Official Roster • {selectedPlayers.length} Members</p>
                  </div>
                </div>
                <button onClick={closePlayerModal} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Enhanced Tabs */}
              <div className="flex gap-2 mt-8 bg-white/5 rounded-2xl p-1 border border-white/10 backdrop-blur-sm">
                <button
                  onClick={() => setPlayerTab("current")}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${playerTab === "current"
                    ? "bg-white text-[#031d44] shadow-lg shadow-black/20"
                    : "text-blue-200/50 hover:text-white"
                    }`}
                >
                  Current Squad
                </button>
                <button
                  onClick={() => { setPlayerTab("add"); setPlayerSearch(""); }}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${playerTab === "add"
                    ? "bg-white text-[#031d44] shadow-lg shadow-black/20"
                    : "text-blue-200/50 hover:text-white"
                    }`}
                >
                  Free Agents
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
              {playerTab === "current" ? (
                <div className="space-y-3">
                  {getCurrentPlayers().length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6 font-black text-slate-200 text-3xl">!</div>
                      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Squad is currently empty</p>
                      <button
                        onClick={() => setPlayerTab("add")}
                        className="mt-4 text-blue-600 hover:text-blue-700 text-[10px] font-black uppercase tracking-widest"
                      >
                        Recruit Players →
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getCurrentPlayers().map((player, i) => (
                        <div
                          key={player._id}
                          className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#031d44] text-white rounded-xl flex items-center justify-center font-black text-sm italic italic">
                              {i + 1}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-slate-800 uppercase tracking-tighter truncate">{player.name}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{player.role || "Unassigned"}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => togglePlayer(player._id)}
                            className="p-2.5 bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-600 rounded-xl transition-all"
                            title="Remove from squad"
                          >
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Modern Search */}
                  <div className="relative group">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      value={playerSearch}
                      onChange={(e) => setPlayerSearch(e.target.value)}
                      placeholder="Search scouts, roles, or campus..."
                      className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold text-slate-800 placeholder:text-slate-300 transition-all"
                    />
                  </div>

                  {/* Players list */}
                  {getAddablePlayers().length === 0 ? (
                    <div className="text-center py-16 text-slate-400 font-black uppercase tracking-widest text-[10px]">
                      {playerSearch ? "Search mission failed." : "All personnel deployed."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getAddablePlayers().map((player) => {
                        const isInCategory = selectedPlayers.includes(String(player._id));
                        return (
                          <button
                            key={player._id}
                            onClick={() => togglePlayer(player._id)}
                            className={`w-full flex items-center justify-between p-4 bg-white border rounded-2xl transition-all text-left ${
                              isInCategory ? "border-blue-500 ring-2 ring-blue-500/10" : "border-slate-200 hover:border-blue-300"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-sm">
                                {player.name?.substring(0, 1).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-slate-800 uppercase tracking-tighter truncate">{player.name}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{player.role || "No Role"}</p>
                              </div>
                            </div>
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                              isInCategory ? "bg-blue-600 border-blue-600" : "border-slate-200"
                            }`}>
                              {isInCategory && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-white flex gap-4">
              <button
                onClick={closePlayerModal}
                disabled={savingPlayers}
                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Close
              </button>
              <button
                onClick={savePlayerSelection}
                disabled={savingPlayers}
                className="flex-[2] py-4 bg-[#031d44] hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
              >
                {savingPlayers ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Synchronizing...
                  </>
                ) : (
                  <>Deploy Squad Improvements</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}