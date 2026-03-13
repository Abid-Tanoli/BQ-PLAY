import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeams, updateTeam } from "../store/slices/teamSlice";
import { fetchMatches } from "../store/slices/matchesSlice";
import { fetchBlogs, createBlog, deleteBlog } from "../store/slices/blogSlice";

// ─── HELPER COMPONENTS & FUNCTIONS ───────────────────────────────────────────

function calcRating(player) {
    const s = player?.stats || {};
    const runs = s.runs || 0;
    const wickets = s.wickets || 0;
    const sr = s.strikeRate || 0;
    const economy = s.economy || 0;
    const role = (player?.role || "").toLowerCase();

    if (role.includes("bowl")) {
        const raw = wickets * 5 + Math.max(0, 10 - economy);
        return Math.min(100, Math.round(raw));
    }
    if (role.includes("all")) {
        const bat = runs / 10 + sr / 20;
        const bowl = wickets * 5 + Math.max(0, 10 - economy);
        return Math.min(100, Math.round((bat + bowl) / 2));
    }
    // default batsman
    const raw = runs / 10 + sr / 20;
    return Math.min(100, Math.round(raw));
}

function ratingColor(r) {
    if (r >= 70) return "bg-emerald-500";
    if (r >= 40) return "bg-amber-400";
    return "bg-red-400";
}

function ratingLabel(r) {
    if (r >= 80) return "Elite";
    if (r >= 60) return "Strong";
    if (r >= 40) return "Good";
    if (r >= 20) return "Average";
    return "Developing";
}

function fmtDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// Sub-component for Series/Tournaments
function SeriesTab({ teamMatches, teamId }) {
    const tournaments = Array.from(new Set(teamMatches.map(m => m.tournament?.name || m.tournament).filter(Boolean)));
    
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold font-black text-slate-800 border-l-4 border-blue-600 pl-4 uppercase tracking-tight">Participating Series</h3>
            {tournaments.length === 0 ? (
                <div className="card text-center py-10 text-slate-400 italic">No series data found for this team.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tournaments.map((t, idx) => {
                        const tMatches = teamMatches.filter(m => (m.tournament?.name || m.tournament) === t);
                        const tWins = tMatches.filter(m => String(m.winner?._id || m.winner) === teamId).length;
                        return (
                            <div key={idx} className="card hover:shadow-lg transition-all border-l-4 border-amber-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-black text-slate-800 text-lg uppercase">{t}</h4>
                                        <p className="text-xs text-slate-500 font-bold">{tMatches.length} Matches · {tWins} Wins</p>
                                    </div>
                                    <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 font-black text-xl">🏆</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── MAIN TEAM PROFILE COMPONENT ─────────────────────────────────────────────

export default function TeamProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { teams } = useSelector((s) => s.teams);
    const { matches } = useSelector((s) => s.matches);
    const { blogs, loading: blogsLoading } = useSelector((s) => s.blogs);

    const [team, setTeam] = useState(null);

    // Blog states
    const [blogTitle, setBlogTitle] = useState("");
    const [blogContent, setBlogContent] = useState("");
    const [blogCategory, setBlogCategory] = useState("Team");
    const [blogImage, setBlogImage] = useState("");
    const [isCreatingBlog, setIsCreatingBlog] = useState(false);
    const [showBlogForm, setShowBlogForm] = useState(false);

    // Media state
    const [mediaUrl, setMediaUrl] = useState("");
    const [mediaCaption, setMediaCaption] = useState("");
    const [savingMedia, setSavingMedia] = useState(false);

    useEffect(() => {
        if (!teams.length) dispatch(fetchTeams());
        if (!matches.length) dispatch(fetchMatches());
        dispatch(fetchBlogs());
    }, [dispatch]);

    useEffect(() => {
        const found = teams.find((t) => t._id === id);
        if (found) setTeam(found);
    }, [teams, id]);

    // Derived data
    const players = (team?.players || []).filter((p) => typeof p === "object" && p._id);
    const teamMatches = matches.filter((m) => {
        const t1 = m.team1?._id || m.team1;
        const t2 = m.team2?._id || m.team2;
        return String(t1) === id || String(t2) === id;
    });
    const upcoming = teamMatches.filter((m) => m.status === "upcoming" || m.status === "scheduled");
    const recent = teamMatches
        .filter((m) => m.status === "completed" || m.status === "live")
        .slice(0, 5);

    const wins = teamMatches.filter((m) => {
        const winner = m.winner?._id || m.winner;
        return String(winner) === id;
    }).length;
    const losses = teamMatches.filter((m) => {
        const winner = m.winner?._id || m.winner;
        return (m.status === "completed") && winner && String(winner) !== id;
    }).length;
    const played = teamMatches.filter((m) => m.status === "completed").length;

    const mediaList = team?.media || [];

    const addMedia = async () => {
        if (!mediaUrl.trim()) return;
        const updated = [...mediaList, { url: mediaUrl.trim(), caption: mediaCaption.trim(), addedAt: new Date().toISOString() }];
        setSavingMedia(true);
        try {
            await dispatch(updateTeam({ id, data: { media: updated } })).unwrap();
            await dispatch(fetchTeams());
            setMediaUrl("");
            setMediaCaption("");
        } catch (e) {
            alert(e || "Failed to save media");
        } finally {
            setSavingMedia(false);
        }
    };

    const removeMedia = async (idx) => {
        const updated = mediaList.filter((_, i) => i !== idx);
        setSavingMedia(true);
        try {
            await dispatch(updateTeam({ id, data: { media: updated } })).unwrap();
            await dispatch(fetchTeams());
        } catch (e) {
            alert(e || "Failed to remove media");
        } finally {
            setSavingMedia(false);
        }
    };

    const handleCreateBlog = async () => {
        if (!blogTitle.trim() || !blogContent.trim()) return;
        setIsCreatingBlog(true);
        try {
            await dispatch(createBlog({
                title: blogTitle,
                content: blogContent,
                category: blogCategory,
                relatedId: blogCategory === "Team" ? id : undefined,
                imageUrl: blogImage,
                author: "Admin"
            })).unwrap();
            setBlogTitle("");
            setBlogContent("");
            setBlogImage("");
            setShowBlogForm(false);
            dispatch(fetchBlogs());
        } catch (e) {
            alert(e || "Failed to create blog");
        } finally {
            setIsCreatingBlog(false);
        }
    };

    const handleDeleteBlog = async (blogId) => {
        if (window.confirm("Delete this blog?")) {
            try {
                await dispatch(deleteBlog(blogId)).unwrap();
                dispatch(fetchBlogs());
            } catch (e) {
                alert(e || "Failed to delete blog");
            }
        }
    };

    const teamBlogs = blogs.filter(b => b.category === "Team" && b.relatedId === id);

    const isVideo = (url) =>
        /youtube\.com|youtu\.be|vimeo\.com|\.mp4|\.webm|\.mov/i.test(url);

    const getOpponent = (match) => {
        const t1 = match.team1?._id || match.team1;
        return String(t1) === id ? match.team2 : match.team1;
    };

    const getResult = (match) => {
        if (match.status !== "completed") return match.status;
        const winner = match.winner?._id || match.winner;
        if (!winner) return "No result";
        return String(winner) === id ? "Won" : "Lost";
    };

    if (!team) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-slate-500 font-bold">Loading team...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-24 max-w-[1400px] mx-auto px-4 sm:px-6">
            
            {/* ── BACK NAVIGATION & HEADER ── */}
            <div className="flex flex-col gap-6 pt-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-fit flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-slate-600 font-bold text-sm shadow-sm transition-all group"
                >
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Squad
                </button>

                {/* HERO BANNER SECTION */}
                <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-slate-900 to-black opacity-80" />
                    <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                    
                    <div className="relative p-6 md:p-10 flex flex-col md:flex-row items-center gap-8">
                        {/* Team Logo */}
                        <div className="shrink-0 group">
                            <div className="relative p-3 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl group-hover:scale-105 transition-transform">
                                {team.logo ? (
                                    <img src={team.logo} alt={team.name} className="w-32 h-32 md:w-44 md:h-44 object-contain rounded-2xl" />
                                ) : (
                                    <div className="w-32 h-32 md:w-44 md:h-44 flex items-center justify-center font-black text-4xl md:text-5xl bg-gradient-to-br from-blue-400 to-blue-700 rounded-2xl">
                                        {team.shortName || team.name?.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Team Info & Meta Stats */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                                <h1 className="text-3xl md:text-6xl font-black tracking-tight drop-shadow-lg uppercase">{team.name}</h1>
                                {team.shortName && (
                                    <span className="px-4 py-1.5 bg-blue-600/30 border border-blue-400/30 rounded-full text-sm font-black tracking-widest text-blue-100 uppercase">
                                        {team.shortName}
                                    </span>
                                )}
                            </div>
                            
                            {team.ownername && (
                                <p className="text-blue-300 text-base md:text-lg font-bold mb-8 flex items-center justify-center md:justify-start gap-2">
                                    <span className="text-xl">👑</span> OWNER: <span className="text-white brightness-125 uppercase">{team.ownername}</span>
                                </p>
                            )}

                            {/* CORE PERFORMANCE STATS STRIP */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-6">
                                <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm text-center min-w-[100px]">
                                    <p className="text-3xl font-black text-white">{players.length}</p>
                                    <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Players</p>
                                </div>
                                <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm text-center min-w-[100px]">
                                    <p className="text-3xl font-black text-emerald-400">{wins}</p>
                                    <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Wins</p>
                                </div>
                                <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm text-center min-w-[100px]">
                                    <p className="text-3xl font-black text-red-400">{losses}</p>
                                    <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Losses</p>
                                </div>
                                <div className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm text-center min-w-[100px]">
                                    <p className="text-3xl font-black text-blue-300">{played}</p>
                                    <p className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Played</p>
                                </div>
                                {played > 0 && (
                                    <div className="px-5 py-3 bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-400/20 rounded-2xl backdrop-blur-sm text-center min-w-[100px]">
                                        <p className="text-3xl font-black text-amber-300">{Math.round((wins / played) * 100)}%</p>
                                        <p className="text-[10px] text-amber-200 uppercase font-bold tracking-wider">Win Rate</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Edit Action */}
                        <div className="shrink-0 self-end md:self-center">
                            <Link to="/admin/teams" state={{ openModal: team._id }} className="px-6 py-3 bg-white text-slate-900 hover:bg-blue-50 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center gap-3">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                MANAGE TEAM
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
                DASHBOARD GRID (QUICK VIEW)
            ══════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLL: MEDIA & TOP PLAYERS (Col 8) */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* DASHBOARD: LATEST MEDIA */}
                    <div className="card group">
                        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50">
                            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-purple-500 rounded-full" />
                                Latest Media
                            </h3>
                            <button onClick={() => document.getElementById('media-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs font-black text-blue-600 hover:tracking-widest transition-all">ALL MEDIA &rarr;</button>
                        </div>
                        {mediaList.length === 0 ? (
                            <div className="bg-slate-50 rounded-2xl py-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest border border-dashed border-slate-200">No media uploads yet</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[...mediaList].reverse().slice(0, 4).map((item, idx) => (
                                    <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer hover:shadow-xl transition-all" onClick={() => document.getElementById('media-section')?.scrollIntoView({ behavior: 'smooth' })}>
                                        {isVideo(item.url) ? (
                                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                                                </div>
                                                {item.url.includes("youtu") && (
                                                    <img src={`https://img.youtube.com/vi/${item.url.split('v=')[1]?.substring(0,11) || item.url.split('youtu.be/')[1]?.substring(0,11)}/hqdefault.jpg`} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />
                                                )}
                                            </div>
                                        ) : (
                                            <img src={item.url} className="w-full h-full object-cover" alt={item.caption} />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                            <p className="text-white text-sm font-black uppercase tracking-tight">{item.caption || "View Media"}</p>
                                            <p className="text-blue-300 text-[10px] font-bold">{fmtDate(item.addedAt)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DASHBOARD: KEY PLAYERS (TOP 3) */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50">
                            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
                                Top Performers
                            </h3>
                            <button onClick={() => document.getElementById('squad-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-xs font-black text-blue-600 hover:tracking-widest transition-all">SQUAD LIST &rarr;</button>
                        </div>
                        {players.length === 0 ? (
                            <div className="bg-slate-50 rounded-2xl py-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest border border-dashed border-slate-200">No players registered</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {[...players].sort((a,b) => calcRating(b) - calcRating(a)).slice(0, 3).map((p, i) => {
                                    const r = calcRating(p);
                                    const medals = ["🥇", "🥈", "🥉"];
                                    return (
                                        <div key={p._id} className="relative flex flex-col items-center p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-2xl transition-all cursor-pointer group" onClick={() => navigate(`/admin/players/${p._id}`)}>
                                            <div className="absolute top-3 left-3 text-2xl drop-shadow-sm">{medals[i]}</div>
                                            <div className="relative mb-4">
                                                <div className={`absolute -inset-1 rounded-full blur-[2px] opacity-30 ${ratingColor(r)}`} />
                                                {p.imageUrl ? (
                                                    <img src={p.imageUrl} alt={p.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg relative" />
                                                ) : (
                                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-slate-200 rounded-full flex items-center justify-center font-black text-blue-700 text-3xl border-4 border-white shadow-lg relative">
                                                        {p.name?.substring(0, 1).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className={`absolute -bottom-1 -right-1 w-9 h-9 rounded-full border-4 border-white flex items-center justify-center text-xs font-black text-white shadow-md ${ratingColor(r)}`}>
                                                    {r}
                                                </div>
                                            </div>
                                            <div className="text-center w-full">
                                                <p className="text-lg font-black text-slate-800 truncate uppercase">{p.name}</p>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">{p.role || "Squad"}</p>
                                            </div>
                                            <div className="mt-5 pt-4 border-t border-slate-100 w-full flex justify-around">
                                                <div className="text-center">
                                                    <p className="text-sm font-black text-slate-800">{p.stats?.runs || 0}</p>
                                                    <p className="text-[9px] text-slate-400 uppercase font-black">Runs</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-black text-slate-800">{p.stats?.wickets || 0}</p>
                                                    <p className="text-[9px] text-slate-400 uppercase font-black">Wkts</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLL: MATCH WIDGETS (Col 4) */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* WIDGET: NEXT MATCH */}
                    <div className="card overflow-hidden border-t-8 border-blue-600 bg-gradient-to-b from-blue-50/30 to-white shadow-lg relative">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/></svg>
                        </div>
                        <div className="flex items-center justify-between mb-6 pb-2 border-b border-blue-100">
                             <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                                <h3 className="font-black text-blue-900 text-xs uppercase tracking-widest">Upcoming</h3>
                             </div>
                             <button onClick={() => document.getElementById('fixtures-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-black text-blue-600 hover:scale-105 transition-transform">ALL &rarr;</button>
                        </div>

                        {upcoming.length > 0 ? (() => {
                            const m = upcoming[0];
                            const opp = getOpponent(m);
                            return (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-around gap-2">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center font-black text-blue-700 text-xl shadow-md border border-slate-100 ring-4 ring-blue-50">
                                                {team.shortName || team.name?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase">{team.shortName || "HOME"}</span>
                                        </div>
                                        <div className="text-xl font-black text-slate-300 italic">VS</div>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center font-black text-slate-400 text-xl shadow-md border border-slate-100 ring-4 ring-slate-50">
                                                {opp?.shortName || opp?.name?.substring(0, 2).toUpperCase() || "?"}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase">{opp?.shortName || "AWAY"}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-50 shadow-inner space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                            <span className="text-sm font-black text-slate-700">{fmtDate(m.date)}</span>
                                        </div>
                                        {m.venue && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-500 leading-tight">{m.venue}</span>
                                            </div>
                                        )}
                                    </div>
                                    {m.tournament && (
                                        <div className="text-center">
                                            <span className="inline-block px-5 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg border border-white/10">🏆 {m.tournament?.name || m.tournament}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })() : (
                            <div className="py-12 text-center text-slate-400 font-bold uppercase text-[10px] border-2 border-dashed border-blue-50 rounded-2xl">No upcoming matches</div>
                        )}
                    </div>

                    {/* WIDGET: LAST RESULT */}
                    <div className="card shadow-lg">
                        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-50">
                             <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Recent Result
                             </h3>
                             <button onClick={() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-black text-blue-600">VIEW ALL</button>
                        </div>

                        {recent.length > 0 ? (() => {
                            const m = recent[0];
                            const result = getResult(m);
                            const won = result === "Won";
                            return (
                                <div className={`relative p-5 rounded-3xl border-2 transition-all ${won ? "border-emerald-500 bg-emerald-50/30" : "border-red-500 bg-red-50/30"}`}>
                                    <div className="flex justify-between items-center mb-6">
                                        <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest ${won ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>{result}</span>
                                        <span className="text-[10px] text-slate-500 font-black">{fmtDate(m.date)}</span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-50">
                                            <span className="font-black text-slate-700 text-xs uppercase truncate max-w-[120px]">{m.team1?.shortName || m.team1?.name}</span>
                                            <span className="font-black text-slate-900 text-sm tracking-tighter">{m.innings?.[0]?.runs ?? "0"}/{m.innings?.[0]?.wickets ?? "0"}</span>
                                        </div>
                                        <div className="flex justify-between items-center px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-50">
                                            <span className="font-black text-slate-700 text-xs uppercase truncate max-w-[120px]">{m.team2?.shortName || m.team2?.name}</span>
                                            <span className="font-black text-slate-900 text-sm tracking-tighter">{m.innings?.[1]?.runs ?? "0"}/{m.innings?.[1]?.wickets ?? "0"}</span>
                                        </div>
                                    </div>
                                    
                                    {m.matchResult && (
                                        <div className="mt-6 pt-4 border-t border-slate-200/50 text-center">
                                           <p className="text-[10px] font-black text-slate-600 italic uppercase leading-tight px-2">{m.matchResult}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })() : (
                             <div className="py-12 text-center text-slate-400 font-bold uppercase text-[10px] border-2 border-dashed border-slate-50 rounded-2xl">No recent matches</div>
                        )}
                    </div>
                </div>
            </div>


            {/* ══════════════════════════════════════════
                SECTION: FULL SQUAD
            ══════════════════════════════════════════ */}
            <div id="squad-section" className="space-y-8 pt-12 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-slate-800 border-l-8 border-blue-600 pl-6 uppercase tracking-tight">Full Squad</h2>
                    <span className="px-6 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-black shadow-sm ring-1 ring-blue-100">{players.length} PLAYERS</span>
                </div>

                {players.length === 0 ? (
                    <div className="card text-center py-20 bg-slate-50 border-dashed border-2 border-slate-200 rounded-3xl">
                        <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Squad is currently empty</p>
                        <Link to="/admin/teams" className="mt-4 inline-block text-blue-600 font-black text-xs hover:underline uppercase tracking-wider">Add Players &rarr;</Link>
                    </div>
                ) : (
                    <div className="card overflow-hidden p-0 border-none shadow-2xl rounded-3xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-900 text-white">
                                        <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">Player</th>
                                        <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest hidden md:table-cell">Role</th>
                                        <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest">Performance</th>
                                        <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-center">Rating</th>
                                        <th className="px-6 py-5 font-black text-[10px] uppercase tracking-widest text-right">View</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {[...players].sort((a,b) => calcRating(b) - calcRating(a)).map((p, idx) => {
                                        const r = calcRating(p);
                                        const s = p.stats || {};
                                        return (
                                            <tr key={p._id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[10px] font-black text-slate-300 w-4">{idx+1}</span>
                                                        {p.imageUrl ? (
                                                            <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 group-hover:border-blue-400 transition-colors" />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 text-sm border-2 border-slate-100">
                                                                {p.name?.substring(0, 1).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <Link to={`/admin/players/${p._id}`} className="font-black text-slate-800 uppercase text-sm hover:text-blue-600 transition-colors leading-none">{p.name}</Link>
                                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase md:hidden">{p.role || "Squad"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                        (p.role || "").toLowerCase().includes("bowl") ? "bg-purple-100 text-purple-700" :
                                                        (p.role || "").toLowerCase().includes("all") ? "bg-amber-100 text-amber-700" : 
                                                        "bg-blue-100 text-blue-700"
                                                    }`}>
                                                        {p.role || "Player"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-center min-w-[40px]">
                                                            <p className="text-sm font-black text-slate-700 leading-none">{s.runs ?? "0"}</p>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase mt-1">Runs</p>
                                                        </div>
                                                        <div className="text-center min-w-[40px]">
                                                            <p className="text-sm font-black text-slate-700 leading-none">{s.wickets ?? "0"}</p>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase mt-1">Wkts</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                                                            <div className={`h-full rounded-full transition-all duration-500 ${ratingColor(r)}`} style={{ width: `${r}%` }} />
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{r}% · {ratingLabel(r)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link to={`/admin/players/${p._id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-400 transition-all shadow-sm">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════
                SECTION: MEDIA GALLERY
            ══════════════════════════════════════════ */}
            <div id="media-section" className="space-y-8 pt-12 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-slate-800 border-l-8 border-purple-500 pl-6 uppercase tracking-tight">Media Gallery</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upload Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="card sticky top-6 bg-gradient-to-br from-white to-purple-50/30">
                            <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em] mb-6 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-purple-500 flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg></span>
                                Add New Content
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest pl-1">Media URL</label>
                                    <input
                                        type="url"
                                        value={mediaUrl}
                                        onChange={(e) => setMediaUrl(e.target.value)}
                                        placeholder="Image or Video link..."
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none text-sm font-bold transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest pl-1">Caption</label>
                                    <input
                                        type="text"
                                        value={mediaCaption}
                                        onChange={(e) => setMediaCaption(e.target.value)}
                                        placeholder="What's this about?"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none text-sm font-bold transition-all"
                                    />
                                </div>
                                
                                {mediaUrl && (
                                    <div className="rounded-2xl overflow-hidden border-2 border-purple-100 shadow-xl bg-black">
                                        {isVideo(mediaUrl) ? (
                                            <div className="aspect-video flex items-center justify-center font-black text-white text-[10px] uppercase">Video Preview Ready</div>
                                        ) : (
                                            <img src={mediaUrl} alt="Preview" className="w-full aspect-video object-cover" />
                                        )}
                                    </div>
                                )}

                                <button
                                    onClick={addMedia}
                                    disabled={savingMedia || !mediaUrl.trim()}
                                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-purple-200 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {savingMedia ? "UPLOADING..." : "PUBLISH TO GALLERY"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Media Grid */}
                    <div className="lg:col-span-2">
                        {mediaList.length === 0 ? (
                            <div className="card h-full flex flex-col items-center justify-center py-20 text-slate-300 border-dashed border-2 border-slate-100 bg-slate-50/30 rounded-3xl">
                                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <p className="font-black text-xs uppercase tracking-[0.3em]">No Gallery Content</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {mediaList.map((item, idx) => (
                                    <div key={idx} className="relative group rounded-3xl overflow-hidden shadow-md bg-slate-900 border border-slate-800 aspect-video group shadow-purple-500/5">
                                        {isVideo(item.url) ? (
                                            item.url.includes("youtu") ? (
                                                <iframe src={item.url.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")} className="w-full h-full" allowFullScreen title={item.caption} />
                                            ) : (
                                                <video src={item.url} controls className="w-full h-full object-cover" />
                                            )
                                        ) : (
                                            <img src={item.url} alt={item.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 p-5 flex flex-col justify-end pointer-events-none">
                                            <p className="text-white font-black text-sm uppercase tracking-tight">{item.caption || "Untitled Content"}</p>
                                            <p className="text-purple-300 text-[9px] font-black mt-1 uppercase tracking-widest">{fmtDate(item.addedAt)}</p>
                                        </div>
                                        <button onClick={() => removeMedia(idx)} className="absolute top-3 right-3 w-8 h-8 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:scale-110">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════
                SECTION: MATCH RESULTS
            ══════════════════════════════════════════ */}
            <div id="results-section" className="space-y-8 pt-12 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-slate-800 border-l-8 border-emerald-500 pl-6 uppercase tracking-tight">Recent Matches</h2>
                    <span className="px-6 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-black shadow-sm ring-1 ring-emerald-100">{recent.length} COMPLETED</span>
                </div>

                {recent.length === 0 ? (
                    <div className="card py-16 text-center text-slate-400 font-black uppercase text-xs tracking-widest">No match results recorded.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {recent.map((m, idx) => {
                            const result = getResult(m);
                            const won = result === "Won";
                            return (
                                <div key={idx} className={`card border-l-8 hover:translate-y-[-4px] transition-all shadow-xl ${won ? 'border-emerald-500 bg-emerald-50/10' : 'border-red-500 bg-red-50/10'}`}>
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.tournament?.name || m.tournament || "Match Result"}</span>
                                            <span className="text-sm font-black text-slate-800 uppercase">{fmtDate(m.date)}</span>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-tighter ${won ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {result}
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-50 shadow-inner">
                                            <span className="font-black text-slate-700 text-xs uppercase">{m.team1?.name}</span>
                                            <span className="font-black text-slate-900 text-sm tracking-widest">{m.innings?.[0]?.runs}/{m.innings?.[0]?.wickets}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-50 shadow-inner">
                                            <span className="font-black text-slate-700 text-xs uppercase">{m.team2?.name}</span>
                                            <span className="font-black text-slate-900 text-sm tracking-widest">{m.innings?.[1]?.runs}/{m.innings?.[1]?.wickets}</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 text-center text-[10px] font-black text-slate-500 uppercase italic tracking-tight">{m.matchResult || "Tournament Match"}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════
                SECTION: FUTURE FIXTURES
            ══════════════════════════════════════════ */}
            <div id="fixtures-section" className="space-y-8 pt-12 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-slate-800 border-l-8 border-blue-400 pl-6 uppercase tracking-tight">Upcoming Fixtures</h2>
                    <span className="px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-black shadow-sm ring-1 ring-blue-100">{upcoming.length} SCHEDULED</span>
                </div>

                {upcoming.length === 0 ? (
                    <div className="card py-16 text-center text-slate-400 font-black uppercase text-xs tracking-widest">No scheduled matches at the moment.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcoming.map((m, idx) => {
                             const opp = getOpponent(m);
                             return (
                                 <div key={idx} className="card group hover:shadow-2xl transition-all border border-slate-100 ring-1 ring-slate-100 ring-inset">
                                     <div className="text-center mb-6">
                                         <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Coming Soon</p>
                                         <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{fmtDate(m.date)}</p>
                                     </div>
                                     <div className="flex items-center justify-between gap-4 mb-6">
                                         <div className="flex flex-col items-center flex-1">
                                             <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-xl font-black text-slate-800 border border-slate-100 group-hover:scale-110 transition-transform">{team.shortName || team.name?.substring(0, 1)}</div>
                                             <span className="text-[9px] font-black text-slate-500 uppercase mt-2">{team.shortName || "HOME"}</span>
                                         </div>
                                         <div className="text-sm font-black text-slate-200">VS</div>
                                         <div className="flex flex-col items-center flex-1">
                                             <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-xl font-black text-slate-800 border border-slate-100 group-hover:scale-110 transition-transform">{opp?.shortName || opp?.name?.substring(0, 1)}</div>
                                             <span className="text-[9px] font-black text-slate-500 uppercase mt-2">{opp?.shortName || "AWAY"}</span>
                                         </div>
                                     </div>
                                     <div className="bg-slate-50/50 rounded-2xl p-3 text-center">
                                         <p className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{m.venue || "TBD Venue"}</p>
                                         {m.tournament && <p className="text-[8px] font-black text-amber-600 uppercase mt-1">🏆 {m.tournament?.name || m.tournament}</p>}
                                     </div>
                                 </div>
                             );
                        })}
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════
                SECTION: BLOGS & UPDATES
            ══════════════════════════════════════════ */}
            <div id="blogs-section" className="space-y-8 pt-12 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-slate-800 border-l-8 border-orange-500 pl-6 uppercase tracking-tight">Team Blogs</h2>
                    <button onClick={() => setShowBlogForm(!showBlogForm)} className={`px-6 py-2 rounded-full text-sm font-black transition-all ${showBlogForm ? 'bg-slate-800 text-white' : 'bg-orange-100 text-orange-700 shadow-sm shadow-orange-200 uppercase tracking-widest'}`}>
                        {showBlogForm ? 'CLOSE EDITOR' : 'CREATE BLOG +'}
                    </button>
                </div>

                {showBlogForm && (
                    <div className="card border-2 border-orange-200 animate-in slide-in-from-top duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Blog Title</label>
                                    <input type="text" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="Engaging Title..." className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold text-sm" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Featured Image URL</label>
                                    <input type="url" value={blogImage} onChange={(e) => setBlogImage(e.target.value)} placeholder="Link to blog image..." className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Content</label>
                                <textarea value={blogContent} onChange={(e) => setBlogContent(e.target.value)} placeholder="Write your blog content here..." className="w-full h-[142px] px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold text-sm resize-none" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowBlogForm(false)} className="px-6 py-3 font-black text-xs text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest">Cancel</button>
                            <button onClick={handleCreateBlog} disabled={isCreatingBlog || !blogTitle.trim()} className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-orange-200 disabled:opacity-50">
                                {isCreatingBlog ? 'POSTING...' : 'PUBLISH BLOG'}
                            </button>
                        </div>
                    </div>
                )}

                {teamBlogs.length === 0 ? (
                    <div className="card py-16 text-center text-slate-300 font-bold uppercase text-[10px] border-dashed border-2 border-slate-100 rounded-3xl">No blogs found for this team. Start by creating one!</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teamBlogs.map(blog => (
                            <div key={blog._id} className="card group overflow-hidden p-0 border-none shadow-xl hover:shadow-2xl transition-all rounded-3xl bg-white flex flex-col">
                                {blog.imageUrl && (
                                    <div className="h-48 overflow-hidden relative">
                                        <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                        <div className="absolute top-4 right-4 bg-orange-500 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">TEAM UPDATE</div>
                                    </div>
                                )}
                                <div className="p-6 flex flex-col flex-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                                        {fmtDate(blog.createdAt)}
                                        <button onClick={() => handleDeleteBlog(blog._id)} className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </p>
                                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-3 group-hover:text-blue-600 transition-colors leading-tight">{blog.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed font-medium mb-6">{blog.content}</p>
                                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <Link to={`/admin/blogs`} className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Read More &rarr;</Link>
                                        <span className="text-[9px] font-black text-slate-400 uppercase">Author: {blog.author || "Admin"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════
                SECTION: SERIES & TOURNAMENTS
            ══════════════════════════════════════════ */}
            <div className="space-y-8 pt-12 border-t border-slate-100">
                <SeriesTab teamMatches={teamMatches} teamId={id} />
            </div>

        </div>
    );
}

