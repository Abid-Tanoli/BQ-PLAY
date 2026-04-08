import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function PreMatchSelection({ match, onUpdate }) {
  const [activeTab, setActiveTab] = useState(match.teams?.[0]?._id || match.teams?.[0]);
  const [saving, setSaving] = useState(false);
  const team1 = match.teams?.[0];
  const team2 = match.teams?.[1];
  const matchTime = match.startAt ? new Date(match.startAt) : null;
  const today = new Date();
  const isToday = matchTime && matchTime.toDateString() === today.toDateString();
  const timeStr = matchTime ? matchTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : "TBD";
  const dateStr = isToday ? "Today" : matchTime ? matchTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "TBD";
  const tossInfo = match.tossWinner ? `${match.tossWinner.shortName || match.tossWinner.name || 'Team'} chose to ${match.tossDecision === 'bat' ? 'bat' : 'field'}` : "Toss pending";

  const [squadData, setSquadData] = useState({
    [match.teams?.[0]?._id || match.teams?.[0]]: { squad: [], captain: null, viceCaptain: null, wicketKeepers: [] },
    [match.teams?.[1]?._id || match.teams?.[1]]: { squad: [], captain: null, viceCaptain: null, wicketKeepers: [] }
  });
  const [playingXI, setPlayingXI] = useState({
    [match.teams?.[0]?._id || match.teams?.[0]]: [],
    [match.teams?.[1]?._id || match.teams?.[1]]: []
  });

  useEffect(() => {
    if (match.squad15) {
      const nsd = { ...squadData };
      match.squad15.forEach(s => {
        const tid = s.team._id || s.team;
        nsd[tid] = { squad: s.players.map(p => p._id || p), captain: s.captain?._id || s.captain, viceCaptain: s.viceCaptain?._id || s.viceCaptain, wicketKeepers: s.wicketKeepers.map(w => w._id || w) };
      });
      setSquadData(nsd);
    }
    if (match.playingXI) {
      const nxi = { ...playingXI };
      match.playingXI.forEach(xi => {
        const tid = xi.team._id || xi.team;
        nxi[tid] = xi.players.map(p => p._id || p);
      });
      setPlayingXI(nxi);
    }
  }, [match]);

  const getTeamPlayers = async (teamId) => {
    try {
      const res = await api.get(`/teams/${teamId}`);
      return res.data.players || res.data.playerList || [];
    } catch (err) { return []; }
  };
  const [teamPlayers, setTeamPlayers] = useState({});
  useEffect(() => {
    match.teams?.forEach(async (team) => {
      const tid = team._id || team;
      const players = await getTeamPlayers(tid);
      setTeamPlayers(prev => ({ ...prev, [tid]: players }));
    });
  }, [match.teams]);

  const togglePlayingXI = (tid, pid) => {
    if (playingXI[tid].includes(pid)) {
      if (playingXI[tid].length > 11) setPlayingXI(prev => ({ ...prev, [tid]: prev[tid].filter(id => id !== pid) }));
    } else {
      if (playingXI[tid].length < 11) setPlayingXI(prev => ({ ...prev, [tid]: [...prev[tid], pid] }));
      else alert("Maximum 11 players allowed in Playing XI");
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const tid of [match.teams?.[0]?._id || match.teams?.[0], match.teams?.[1]?._id || match.teams?.[1]]) {
        const data = squadData[tid];
        if (data.squad.length >= 11 && data.captain && data.viceCaptain && data.wicketKeepers.length > 0) {
          await api.put(`/matches/${match._id}/squad15`, { teamId: tid, players: data.squad, captain: data.captain, viceCaptain: data.viceCaptain, wicketKeepers: data.wicketKeepers });
        }
        if (playingXI[tid].length === 11) {
          await api.put(`/matches/${match._id}/playing-xi`, { teamId: tid, players: playingXI[tid] });
        }
      }
      alert("Pre-match selections saved successfully!"); onUpdate();
    } catch (err) { console.error(err); alert("Failed to save pre-match selections"); } finally { setSaving(false); }
  };

  const ctid = activeTab;
  const cs = squadData[ctid];
  const players = teamPlayers[ctid] || [];
  const t1d = squadData[match.teams?.[0]?._id || match.teams?.[0]];
  const t2d = squadData[match.teams?.[1]?._id || match.teams?.[1]];
  const isReady = t1d.squad.length >= 11 && t1d.captain && t1d.viceCaptain && t1d.wicketKeepers.length > 0 && t2d.squad.length >= 11 && t2d.captain && t2d.viceCaptain && t2d.wicketKeepers.length > 0;

  const handleSquadToggle = (pid) => {
    if (cs.squad.includes(pid)) {
      if (cs.squad.length > 11) {
        setSquadData(prev => ({ ...prev, [ctid]: { ...prev[ctid], squad: prev[ctid].squad.filter(id => id !== pid), captain: prev[ctid].captain === pid ? null : prev[ctid].captain, viceCaptain: prev[ctid].viceCaptain === pid ? null : prev[ctid].viceCaptain, wicketKeepers: prev[ctid].wicketKeepers.filter(id => id !== pid) } }));
      }
    } else {
      if (cs.squad.length < 20) setSquadData(prev => ({ ...prev, [ctid]: { ...prev[ctid], squad: [...prev[ctid].squad, pid] } }));
    }
  };

  const handleWKToggle = (pid) => {
    if (cs.wicketKeepers.includes(pid)) {
      if (cs.wicketKeepers.length > 1) setSquadData(prev => ({ ...prev, [ctid]: { ...prev[ctid], wicketKeepers: prev[ctid].wicketKeepers.filter(id => id !== pid) } }));
      else alert("At least one wicket-keeper required");
    } else {
      setSquadData(prev => ({ ...prev, [ctid]: { ...prev[ctid], wicketKeepers: [...prev[ctid].wicketKeepers, pid] } }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Pre-Match Header */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-[#031d44] via-[#0a2d5e] to-[#031d44] text-white py-8 px-6">
          <div className="flex items-center justify-center gap-2 text-sm text-blue-300 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{dateStr} • {timeStr}</span>
            {match.venue && (<><span className="text-slate-500">•</span><span className="text-slate-300">{match.venue}</span></>)}
          </div>
          <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-3 border-2 border-white/20">
                {team1?.logo ? (<img src={team1.logo} alt={team1.name} className="w-16 h-16 object-contain" />) : (<span className="text-3xl font-black text-white/80">{team1?.name?.charAt(0) || "T"}</span>)}
              </div>
              <h3 className="text-lg font-bold uppercase tracking-tight">{team1?.shortName || team1?.name}</h3>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-white/30">VS</span>
              <span className={`mt-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${match.status === "upcoming" ? "bg-blue-500 text-white" : "bg-green-500 text-white"}`}>{match.status === "upcoming" ? "Upcoming" : "Start Soon"}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-3 border-2 border-white/20">
                {team2?.logo ? (<img src={team2.logo} alt={team2.name} className="w-16 h-16 object-contain" />) : (<span className="text-3xl font-black text-white/80">{team2?.name?.charAt(0) || "T"}</span>)}
              </div>
              <h3 className="text-lg font-bold uppercase tracking-tight">{team2?.shortName || team2?.name}</h3>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-center gap-6">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${match.tossWinner ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
              <span className="text-lg">{match.tossWinner ? "🪙" : "⏳"}</span>
              <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">TOSS</p><p className="text-sm font-bold text-slate-800">{tossInfo}</p></div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-lg">🏏</span>
              <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">FORMAT</p><p className="text-sm font-bold text-slate-800">{match.matchType || "T20"}</p></div>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 border-l-4 border-amber-500 px-6 py-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-black text-amber-900 text-sm uppercase tracking-wider">Pre-Match Selections Required</h4>
              <p className="text-xs text-amber-700 mt-1">Complete the following before the match starts:</p>
              <ul className="text-xs text-amber-700 mt-2 space-y-1 ml-4 list-disc">
                <li>Select <strong>Squad (11-20 players)</strong> for each team</li>
                <li>Set <strong>Captain, Vice-Captain & Wicket-Keepers</strong></li>
                <li>Perform <strong>Toss</strong></li>
                <li>Select <strong>Playing XI</strong> after toss</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Squad Selection */}
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <div className="flex border-b">
          {match.teams?.map(team => {
            const tid = team._id || team;
            const d = squadData[tid];
            const ready = d.squad.length >= 11 && d.captain && d.viceCaptain && d.wicketKeepers.length > 0;
            return (
              <button key={tid} onClick={() => setActiveTab(tid)} className={`flex-1 py-3 px-4 text-sm font-bold transition-colors ${activeTab === tid ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-slate-600 hover:bg-slate-50"}`}>
                <div className="flex items-center justify-center gap-2">
                  <span>{team.shortName || team.name}</span>
                  {ready && <span className="text-green-600">✓</span>}
                </div>
              </button>
            );
          })}
        </div>
        <div className="p-6 space-y-4">
          {/* Squad Selection */}
          <div>
            <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">11-20 Players</span>
              Squad Selection ({cs.squad.length}/20)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3 bg-slate-50">
              {players.map(player => (
                <button key={player._id} onClick={() => handleSquadToggle(player._id)}
                  className={`p-2 rounded border text-sm transition-all ${cs.squad.includes(player._id) ? "bg-purple-50 border-purple-400" : "bg-white border-slate-200 hover:border-purple-200"}`}>
                  {player.name}{cs.squad.includes(player._id) && <span className="text-purple-600 float-right">✓</span>}
                </button>
              ))}
            </div>
          </div>
          {/* Captain & Vice-Captain */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Captain *</label>
              <select value={cs.captain || ""} onChange={(e) => setSquadData(prev => ({ ...prev, [ctid]: { ...prev[ctid], captain: e.target.value } }))} className="w-full p-2 border rounded-lg">
                <option value="">Select Captain</option>
                {cs.squad.map(pid => { const p = players.find(x => x._id === pid); return <option key={pid} value={pid}>{p?.name}</option>; })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Vice-Captain *</label>
              <select value={cs.viceCaptain || ""} onChange={(e) => setSquadData(prev => ({ ...prev, [ctid]: { ...prev[ctid], viceCaptain: e.target.value } }))} className="w-full p-2 border rounded-lg">
                <option value="">Select Vice-Captain</option>
                {cs.squad.map(pid => { const p = players.find(x => x._id === pid); return <option key={pid} value={pid} disabled={pid === cs.captain}>{p?.name}</option>; })}
              </select>
            </div>
          </div>
          {/* Wicket-Keepers */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Wicket-Keepers (Select at least 1)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {cs.squad.map(pid => {
                const p = players.find(x => x._id === pid);
                const isWK = p?.playingRole === "Wicket-Keeper";
                return (
                  <label key={pid} className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${cs.wicketKeepers.includes(pid) ? "bg-green-50 border-green-300" : "bg-white border-slate-200"}`}>
                    <input type="checkbox" checked={cs.wicketKeepers.includes(pid)} onChange={() => handleWKToggle(pid)} className="w-4 h-4" />
                    <span className="text-sm">{p?.name}</span>
                    {isWK && <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded">WK</span>}
                  </label>
                );
              })}
            </div>
          </div>
          {/* Playing XI */}
          <div>
            <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">11 Players</span>
              Playing XI ({playingXI[ctid]?.length || 0}/11)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3 bg-slate-50">
              {cs.squad.map(pid => {
                const p = players.find(x => x._id === pid);
                const sel = playingXI[ctid]?.includes(pid);
                return (
                  <button key={pid} onClick={() => togglePlayingXI(ctid, pid)}
                    className={`p-2 rounded border text-sm transition-all ${sel ? "bg-green-50 border-green-400" : "bg-white border-slate-200 hover:border-green-200"}`}>
                    {p?.name}{sel && <span className="text-green-600 float-right">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
          {!isReady && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 font-bold text-sm">⚠️ Complete all selections for both teams before toss can begin</p>
            </div>
          )}
        </div>
      </div>
      <button onClick={handleSaveAll} disabled={saving} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all disabled:opacity-50">
        {saving ? "Saving..." : "Save All Pre-Match Selections"}
      </button>
    </div>
  );
}
