import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("matches");
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [teams, setTeams] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [formTeamA, setFormTeamA] = useState("");
  const [formTeamB, setFormTeamB] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formVenue, setFormVenue] = useState("");
  const [formCategory, setFormCategory] = useState("local-club");
  const [formSubcategory, setFormSubcategory] = useState("");

  useEffect(() => { loadData(); loadTeams(); }, [eventId]);

  const loadData = async () => {
    try {
      const res = await api.get(`/events/${eventId}`);
      setEvent(res.data);
      // Fetch all matches for this event
      const matchRes = await api.get(`/tournaments/${eventId}/fixtures`).catch(() => ({ data: [] }));
      setMatches(matchRes.data);
    } catch (err) { console.error("Failed to load event:", err); } finally { setLoading(false); }
  };

  const loadTeams = async () => {
    try {
      const res = await api.get("/teams");
      setTeams(res.data);
    } catch (err) { console.error(err); }
  };

  const onCreateMatch = async (e) => {
    e.preventDefault();
    if (!formTeamA || !formTeamB || !formStartTime) { alert("All fields required"); return; }
    if (formTeamA === formTeamB) { alert("Teams must be different"); return; }
    setFormLoading(true);
    try {
      const teamA = teams.find(t => t._id === formTeamA);
      const teamB = teams.find(t => t._id === formTeamB);
      await api.post("/matches", {
        title: `${teamA.name} vs ${teamB.name}`,
        teams: [formTeamA, formTeamB],
        startAt: formStartTime,
        venue: formVenue || event?.venue || "",
        matchType: event?.format || "T20",
        matchCategory: formCategory || "local-club",
        matchSubcategory: formSubcategory || "",
        tournament: eventId,
        series: event?.name,
      });
      setShowMatchForm(false);
      setFormTeamA(""); setFormTeamB(""); setFormStartTime(""); setFormVenue(""); setFormCategory("local-club"); setFormSubcategory("");
      loadData();
    } catch (err) { alert(err.response?.data?.message || "Failed to create match"); } finally { setFormLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!event) return <div className="text-center py-20"><p className="text-xl font-bold">Event not found</p><Link to="/admin/events" className="text-blue-600">← Back</Link></div>;

  const etLabel = { "single-match": "Single Match", "series": "Series", "tri-series": "Tri-Series", "tournament": "Tournament", "world-cup": "World Cup", "champions-trophy": "Champions Trophy", "league": "League" };
  const tabs = ["overview", "matches", "squads", "points", "media"];

  const completedMatches = matches.filter(m => m.status === "completed");
  const upcomingMatches = matches.filter(m => m.status === "upcoming" || m.status === "scheduled");
  const liveMatches = matches.filter(m => m.status === "live");

  return (
    <div className="space-y-6 bg-[#f8fafc] min-h-screen p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#031d44] via-[#0a2d5e] to-[#031d44] p-6 rounded-2xl shadow-xl text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/events" className="text-blue-300 hover:text-white transition-colors text-sm font-bold">← Events</Link>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">{event.name}</h2>
            <p className="text-blue-200/60 text-xs mt-1 font-medium">{etLabel[event.eventType] || event.eventType} • {event.format} • {event.totalMatches || 0} Matches</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to={`/series/${event.slug || event._id}`} target="_blank" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors">👁 View Public Page</Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200 w-fit">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === t ? "bg-[#031d44] text-white shadow" : "text-slate-600 hover:bg-slate-100"}`}>
            {t} {t === "matches" && `(${matches.length})`}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Event Details</h4>
            <div className="space-y-4 text-sm">
              <div><span className="text-slate-500 font-bold block">Type</span><span className="text-slate-800 font-black">{etLabel[event.eventType]}</span></div>
              <div><span className="text-slate-500 font-bold block">Format</span><span className="text-slate-800 font-black">{event.format}</span></div>
              <div><span className="text-slate-500 font-bold block">Venue</span><span className="text-slate-800 font-black">{event.venue || "TBD"}</span></div>
              <div><span className="text-slate-500 font-bold block">Duration</span><span className="text-slate-800 font-black">{event.startDate ? new Date(event.startDate).toLocaleDateString() : "TBD"} - {event.endDate ? new Date(event.endDate).toLocaleDateString() : "TBD"}</span></div>
              <div><span className="text-slate-500 font-bold block">Status</span><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${event.status === "live" ? "bg-red-100 text-red-700" : event.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{event.status}</span></div>
              {event.description && <div><span className="text-slate-500 font-bold block">Description</span><p className="text-slate-800">{event.description}</p></div>}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Teams ({event.teams?.length || 0})</h4>
            <div className="space-y-2">
              {event.teams?.map(team => (
                <div key={team._id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                  {team.logo && <img src={team.logo} alt={team.name} className="w-8 h-8 rounded object-cover" />}
                  <span className="text-sm font-bold text-slate-800">{team.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Stats</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"><span className="text-xs font-bold text-blue-600">Total Matches</span><span className="text-2xl font-black text-[#031d44]">{event.totalMatches || 0}</span></div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg"><span className="text-xs font-bold text-green-600">Completed</span><span className="text-2xl font-black text-green-800">{completedMatches.length}</span></div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"><span className="text-xs font-bold text-purple-600">Upcoming</span><span className="text-2xl font-black text-purple-800">{upcomingMatches.length}</span></div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"><span className="text-xs font-bold text-amber-600">Squads Set</span><span className="text-2xl font-black text-amber-800">{(event.eventSquads || []).filter(s => s.players?.length >= 11).length}/{event.teams?.length || 0}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Matches Tab */}
      {activeTab === "matches" && (
        <div className="space-y-6">
          {/* Add Match Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <button onClick={() => setShowMatchForm(!showMatchForm)} className="w-full py-3 bg-[#031d44] text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors">
              {showMatchForm ? "✕ Cancel" : "+ Schedule New Match"}
            </button>
            {showMatchForm && (
              <form onSubmit={onCreateMatch} className="mt-4 space-y-4 border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Team A</label>
                    <select value={formTeamA} onChange={e => setFormTeamA(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                      <option value="">Select</option>
                      {event.teams?.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Team B</label>
                    <select value={formTeamB} onChange={e => setFormTeamB(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                      <option value="">Select</option>
                      {event.teams?.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Match Category */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Match Category *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <label
                      onClick={() => { setFormCategory("international"); setFormSubcategory(""); }}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${formCategory === "international" ? "border-purple-500 bg-purple-50" : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <span className="text-xl block">🌍</span>
                      <span className="text-xs font-bold text-slate-800 block mt-1">International</span>
                    </label>
                    <label
                      onClick={() => { setFormCategory("league"); setFormSubcategory(""); }}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${formCategory === "league" ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <span className="text-xl block">🏆</span>
                      <span className="text-xs font-bold text-slate-800 block mt-1">League</span>
                    </label>
                    <label
                      onClick={() => { setFormCategory("domestic"); setFormSubcategory(""); }}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${formCategory === "domestic" ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <span className="text-xl block">🏛️</span>
                      <span className="text-xs font-bold text-slate-800 block mt-1">Domestic</span>
                    </label>
                    <label
                      onClick={() => { setFormCategory("local-club"); setFormSubcategory(""); }}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${formCategory === "local-club" ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <span className="text-xl block">🏟️</span>
                      <span className="text-xs font-bold text-slate-800 block mt-1">Local Club</span>
                    </label>
                  </div>
                </div>

                {/* Match Subcategory */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Match Subcategory</label>
                  <select value={formSubcategory} onChange={e => setFormSubcategory(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                    <option value="">Select Subcategory (Optional)</option>
                    {formCategory === "international" && (
                      <>
                        <option value="test-championship">Test Championship</option>
                        <option value="odi-world-cup">ODI World Cup</option>
                        <option value="t20-world-cup">T20 World Cup</option>
                        <option value="champions-trophy">Champions Trophy</option>
                        <option value="bilateral-test">Bilateral Test</option>
                        <option value="bilateral-odi">Bilateral ODI</option>
                        <option value="bilateral-t20i">Bilateral T20I</option>
                        <option value="asia-cup">Asia Cup</option>
                      </>
                    )}
                    {formCategory === "league" && (
                      <>
                        <option value="ipl">IPL</option>
                        <option value="psl">PSL</option>
                        <option value="bbl">BBL</option>
                        <option value="cpl">CPL</option>
                        <option value="t20-blast">T20 Blast</option>
                        <option value="the-hundred">The Hundred</option>
                        <option value="other-league">Other League</option>
                      </>
                    )}
                    {formCategory === "domestic" && (
                      <>
                        <option value="national-t20">National T20</option>
                        <option value="national-one-day">National One-Day</option>
                        <option value="national-first-class">National First-Class</option>
                        <option value="regional">Regional</option>
                        <option value="departmental">Departmental</option>
                      </>
                    )}
                    {formCategory === "local-club" && (
                      <>
                        <option value="club-tournament">Club Tournament</option>
                        <option value="friendly">Friendly Match</option>
                        <option value="tape-ball">Tape Ball</option>
                        <option value="hard-ball">Hard Ball</option>
                        <option value="corporate">Corporate Match</option>
                        <option value="school-college">School/College</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Start Time</label>
                    <input type="datetime-local" value={formStartTime} onChange={e => setFormStartTime(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Venue</label>
                    <input value={formVenue} onChange={e => setFormVenue(e.target.value)} placeholder={event.venue || "Enter venue"} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800" />
                  </div>
                </div>

                <button type="submit" disabled={formLoading} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm disabled:opacity-50">{formLoading ? "Creating..." : "Create Match"}</button>
              </form>
            )}
          </div>

          {/* Live Matches */}
          {liveMatches.length > 0 && (
            <div>
              <h3 className="text-lg font-black text-[#031d44] uppercase mb-3 flex items-center gap-2"><span className="w-2 h-6 bg-red-600 rounded-full animate-pulse"></span> Live ({liveMatches.length})</h3>
              <div className="space-y-3">
                {liveMatches.map(m => (
                  <div key={m._id} className="bg-white rounded-xl shadow-lg p-4 border-2 border-red-300 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{m.title}</p>
                      <p className="text-xs text-slate-500">{m.venue}</p>
                    </div>
                    <Link to={`/admin/live/${m._id}`} className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold animate-pulse">🔴 LIVE - Manage</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Matches */}
          {completedMatches.length > 0 && (
            <div>
              <h3 className="text-lg font-black text-[#031d44] uppercase mb-3 flex items-center gap-2"><span className="w-2 h-6 bg-green-600 rounded-full"></span> Results ({completedMatches.length})</h3>
              <div className="space-y-3">
                {completedMatches.sort((a, b) => b.matchNumber - a.matchNumber).map(m => (
                  <div key={m._id} className="bg-white rounded-xl shadow-lg p-4 border border-slate-200 flex items-center justify-between hover:shadow-xl transition-all">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400">M{m.matchNumber || "?"}</span>
                        <p className="font-bold text-slate-800">{m.title}</p>
                      </div>
                      <p className="text-xs text-slate-500">{new Date(m.startAt).toLocaleDateString()} • {m.venue}</p>
                      {m.result?.description && <p className="text-sm text-green-600 font-bold mt-1 italic">{m.result.description}</p>}
                      {/* Show scores if available */}
                      {m.innings?.length > 0 && (
                        <div className="flex gap-4 mt-2 text-xs">
                          {m.innings.map((inn, idx) => {
                            const team = m.teams?.[idx] || {};
                            return <span key={idx} className="font-bold text-slate-700">{team.shortName || team.name || `Team ${idx + 1}`}: {inn.runs}/{inn.wickets} ({inn.overs}.{inn.balls % 6})</span>;
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/admin/live/${m._id}`} className="px-3 py-1.5 bg-[#031d44] text-white rounded-lg text-xs font-bold hover:bg-slate-800">Manage</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Matches */}
          {upcomingMatches.length > 0 && (
            <div>
              <h3 className="text-lg font-black text-[#031d44] uppercase mb-3 flex items-center gap-2"><span className="w-2 h-6 bg-blue-600 rounded-full"></span> Upcoming ({upcomingMatches.length})</h3>
              <div className="space-y-3">
                {upcomingMatches.sort((a, b) => new Date(a.startAt) - new Date(b.startAt)).map(m => (
                  <div key={m._id} className="bg-white rounded-xl shadow-lg p-4 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400">M{m.matchNumber || "?"}</span>
                        <p className="font-bold text-slate-800">{m.title}</p>
                      </div>
                      <p className="text-xs text-slate-500">{new Date(m.startAt).toLocaleString()} • {m.venue || "TBD"}</p>
                    </div>
                    <Link to={`/admin/live/${m._id}`} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Open</Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matches.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
              <span className="text-4xl block mb-3">🏏</span>
              <p className="text-slate-500 font-bold">No matches scheduled</p>
              <p className="text-xs text-slate-400 mt-1">Click "Schedule New Match" to add one</p>
            </div>
          )}
        </div>
      )}

      {/* Squads Tab */}
      {activeTab === "squads" && (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-[#031d44] uppercase">Event Squads (Select once for all matches)</h3>
          <p className="text-sm text-slate-500">Each team selects 11-20 players. These squads apply to the entire event.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.teams?.map(team => {
              const squad = event.eventSquads?.find(s => (s.team?._id || s.team) === (team._id || team));
              const isReady = squad?.players?.length >= 11;
              return (
                <div key={team._id} className={`bg-white rounded-xl shadow-lg p-6 border-2 ${isReady ? "border-green-300" : "border-slate-200"}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {team.logo && <img src={team.logo} alt={team.name} className="w-12 h-12 rounded-lg object-cover" />}
                      <div>
                        <h5 className="font-bold text-slate-800">{team.name}</h5>
                        <p className={`text-xs font-bold ${isReady ? "text-green-600" : "text-slate-500"}`}>{squad?.players?.length || 0}/20 players {isReady ? "✓" : "(Min 11)"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        console.log('=== EVENT DETAIL: OPENING SQUAD ===');
                        console.log('Event ID:', eventId);
                        console.log('Team ID:', team._id);
                        console.log('Navigation URL:', `/admin/events/${eventId}/squad/${team._id}`);
                        navigate(`/admin/events/${eventId}/squad/${team._id}`);
                      }}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                    >
                      {squad ? "Edit Squad" : "Set Squad"}
                    </button>
                  </div>
                  {squad && squad.players?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {squad.players.slice(0, 12).map(p => (
                        <span key={p._id} className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold">
                          {p.name}
                          {p._id === squad.captain && <span className="ml-1 text-blue-600">(C)</span>}
                          {p._id === squad.viceCaptain && <span className="ml-1 text-green-600">(VC)</span>}
                          {squad.wicketKeepers?.includes(p._id) && <span className="ml-1 text-orange-600">(WK)</span>}
                        </span>
                      ))}
                      {squad.players.length > 12 && <span className="px-2 py-1 bg-slate-200 rounded text-[10px] font-bold">+{squad.players.length - 12}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Points Tab */}
      {activeTab === "points" && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-black text-[#031d44] uppercase">Points Table</h3>
          </div>
          {event.pointsTable?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold">
                  <tr>
                    <th className="px-4 py-3">Pos</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-2 py-3 text-center">M</th>
                    <th className="px-2 py-3 text-center">W</th>
                    <th className="px-2 py-3 text-center">L</th>
                    <th className="px-2 py-3 text-center">T/NR</th>
                    <th className="px-4 py-3 text-center">NRR</th>
                    <th className="px-4 py-3 text-center bg-blue-50 text-blue-800">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...event.pointsTable].sort((a, b) => b.points - a.points || b.netRunRate - a.netRunRate).map((entry, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{entry.team?.name || "Team"}</td>
                      <td className="px-2 py-3 text-center">{entry.matchesPlayed || 0}</td>
                      <td className="px-2 py-3 text-center text-green-600 font-bold">{entry.won || 0}</td>
                      <td className="px-2 py-3 text-center text-red-600 font-bold">{entry.lost || 0}</td>
                      <td className="px-2 py-3 text-center text-slate-500">{(entry.tied || 0) + (entry.noResult || 0)}</td>
                      <td className="px-4 py-3 text-center font-bold text-blue-600">{(entry.netRunRate || 0).toFixed(3)}</td>
                      <td className="px-4 py-3 text-center font-black bg-blue-50 text-blue-900 text-lg">{entry.points || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center"><p className="text-slate-500 font-bold">No points data yet</p></div>
          )}
        </div>
      )}

      {/* Media Tab */}
      {activeTab === "media" && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
          <span className="text-5xl block mb-4">📸</span>
          <h4 className="text-xl font-black text-[#031d44] uppercase">Media Gallery</h4>
          <p className="text-slate-500 text-sm mt-2">Upload images and videos for this event (coming soon)</p>
        </div>
      )}
    </div>
  );
}
