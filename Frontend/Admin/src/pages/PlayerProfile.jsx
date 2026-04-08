import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const ROLE_COLORS = {
    "Batsman": "bg-blue-600",
    "Bowler": "bg-green-600",
    "All-Rounder": "bg-purple-600",
    "Batting-All-Rounder": "bg-cyan-600",
    "Bowling-All-Rounder": "bg-lime-600",
    "Wicket-Keeper": "bg-orange-600"
};

const ROLE_EMOJIS = {
    "Batsman": "🏏",
    "Bowler": "⚾",
    "All-Rounder": "🎯",
    "Batting-All-Rounder": "🏏",
    "Bowling-All-Rounder": "⚾",
    "Wicket-Keeper": "🧤"
};

export default function PlayerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const fetchPlayer = async () => {
            try {
                const res = await api.get(`/players/${id}`);
                setPlayer(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayer();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Loading player profile...</p>
            </div>
        </div>
    );

    if (!player) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <p className="text-xl text-red-500 font-bold mb-4">Player not found</p>
                <Link to="/admin/players" className="text-blue-600 hover:underline">← Back to Players</Link>
            </div>
        </div>
    );

    const roleColor = ROLE_COLORS[player.playingRole] || "bg-slate-600";
    const roleEmoji = ROLE_EMOJIS[player.playingRole] || "👤";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <Link
                            to="/admin/players"
                            className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="font-medium">Back to Players</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            {player.team && (
                                <span className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium backdrop-blur-sm">
                                    {player.team.name}
                                </span>
                            )}
                            <span className={`px-4 py-2 ${roleColor} rounded-full text-sm font-bold uppercase tracking-wider`}>
                                {player.playingRole}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Profile Section */}
            <div className="max-w-7xl mx-auto px-4 -mt-8">
                <div className="bg-white rounded-t-xl shadow-xl border border-gray-200">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-b from-gray-50 to-white px-8 pt-8 pb-6 border-b border-gray-200">
                        <div className="flex items-start gap-8">
                            {/* Player Image */}
                            <div className="relative">
                                {player.imageUrl ? (
                                    <img
                                        src={player.imageUrl}
                                        alt={player.name}
                                        className="w-48 h-48 rounded-xl object-cover shadow-xl border-4 border-white"
                                    />
                                ) : (
                                    <div className="w-48 h-48 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-xl">
                                        <span className="text-7xl">{roleEmoji}</span>
                                    </div>
                                )}
                            </div>

                            {/* Player Details */}
                            <div className="flex-1 pt-4">
                                <h1 className="text-5xl font-black text-gray-900 mb-2">{player.name}</h1>

                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-lg text-gray-600 font-medium">
                                        {player.battingStyle} • {player.bowlingStyle}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Team</p>
                                        <p className="text-lg font-bold text-gray-900">{player.team?.name || "Unassigned"}</p>
                                    </div>
                                    {player.Campus && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Campus</p>
                                            <p className="text-lg font-bold text-gray-900">{player.Campus}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Role</p>
                                        <p className="text-lg font-bold text-gray-900">{player.playingRole || player.role}</p>
                                    </div>
                                    {player.age && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Age</p>
                                            <p className="text-lg font-bold text-gray-900">{player.age} years</p>
                                        </div>
                                    )}
                                    {player.birthInfo?.date && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Born</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {new Date(player.birthInfo.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                {player.birthInfo.place && ` - ${player.birthInfo.place}`}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="px-8 border-b border-gray-200">
                        <div className="flex gap-8">
                            {[
                                { id: "overview", label: "Overview", icon: "📊" },
                                { id: "batting", label: "Batting", icon: "🏏" },
                                { id: "bowling", label: "Bowling", icon: "⚾" },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-2 border-b-2 font-bold text-sm uppercase tracking-wider transition-all ${activeTab === tab.id
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="mt-6 space-y-6">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <>
                            {/* Quick Stats Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-xl">📋</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-500 uppercase">Matches</p>
                                    </div>
                                    <p className="text-4xl font-black text-gray-900">{player.stats?.matches || 0}</p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <span className="text-xl">🏏</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-500 uppercase">Runs</p>
                                    </div>
                                    <p className="text-4xl font-black text-gray-900">{player.stats?.runs || player.stats?.batting_runs || 0}</p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                            <span className="text-xl">⚾</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-500 uppercase">Wickets</p>
                                    </div>
                                    <p className="text-4xl font-black text-gray-900">{player.stats?.wickets || player.stats?.bowling_wickets || 0}</p>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                            <span className="text-xl">📈</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-500 uppercase">Average</p>
                                    </div>
                                    <p className="text-4xl font-black text-gray-900">
                                        {(player.stats?.average || player.stats?.batting_average || 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Batting & Bowling Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Batting Summary */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
                                        <h3 className="text-lg font-black flex items-center gap-2">
                                            <span>🏏</span> Batting Summary
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <StatBox label="Runs" value={player.stats?.runs || player.stats?.batting_runs || 0} color="text-blue-600" />
                                            <StatBox label="Innings" value={player.stats?.innings || 0} color="text-blue-600" />
                                            <StatBox label="Average" value={(player.stats?.average || player.stats?.batting_average || 0).toFixed(2)} color="text-blue-600" />
                                            <StatBox label="Strike Rate" value={(player.stats?.strikeRate || player.stats?.batting_strike_rate || 0).toFixed(2)} color="text-blue-600" />
                                            <StatBox label="Highest" value={player.stats?.highScore || "-"} color="text-blue-600" />
                                            <StatBox label="Not Outs" value={player.stats?.notOuts || 0} color="text-blue-600" />
                                            <StatBox label="Fifties" value={player.stats?.fifties || player.stats?.batting_fifties || 0} color="text-green-600" />
                                            <StatBox label="Centuries" value={player.stats?.hundreds || player.stats?.batting_centuries || 0} color="text-green-600" />
                                        </div>
                                    </div>
                                </div>

                                {/* Bowling Summary */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4">
                                        <h3 className="text-lg font-black flex items-center gap-2">
                                            <span>⚾</span> Bowling Summary
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <StatBox label="Wickets" value={player.stats?.wickets || player.stats?.bowling_wickets || 0} color="text-green-600" />
                                            <StatBox label="Overs" value={player.stats?.overs || "-"} color="text-green-600" />
                                            <StatBox label="Economy" value={(player.stats?.economy || player.stats?.bowling_economy || 0).toFixed(2)} color="text-green-600" />
                                            <StatBox label="Average" value={(player.stats?.bowlingAverage || 0).toFixed(2)} color="text-green-600" />
                                            <StatBox label="Best" value={player.stats?.bestBowling || "-"} color="text-green-600" />
                                            <StatBox label="Dot Balls" value={player.stats?.dotBalls || 0} color="text-green-600" />
                                            <StatBox label="4 Wickets" value={player.stats?.fourWickets || 0} color="text-orange-600" />
                                            <StatBox label="5 Wickets" value={player.stats?.fiveWickets || 0} color="text-orange-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Playing Style */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                    <span>🎯</span> Playing Profile
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <ProfileCard
                                        icon={player.battingStyle === "Left-handed" ? "🤛" : "🤜"}
                                        label="Batting Style"
                                        value={player.battingStyle || "Not specified"}
                                        color="bg-blue-50 border-blue-200"
                                    />
                                    <ProfileCard
                                        icon="⚾"
                                        label="Bowling Style"
                                        value={player.bowlingStyle || "Not specified"}
                                        color="bg-green-50 border-green-200"
                                    />
                                    <ProfileCard
                                        icon={roleEmoji}
                                        label="Playing Role"
                                        value={player.playingRole || player.role || "Not specified"}
                                        color={roleColor.replace("bg-", "bg-").replace("600", "50") + " border-" + roleColor.replace("bg-", "").replace("600", "200")}
                                    />
                                </div>
                            </div>

                            {/* Relations */}
                            {player.relations && player.relations.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                        <span>👨‍👩‍👦</span> Player Relations
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {player.relations.map((rel, index) => (
                                            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                                                    👤
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900">{rel.player?.name || "Unknown Player"}</p>
                                                    <p className="text-sm text-gray-500 font-medium">{rel.relationType}</p>
                                                </div>
                                                {rel.player?._id && (
                                                    <Link
                                                        to={`/admin/players/${rel.player._id}`}
                                                        className="text-blue-600 hover:text-blue-700 font-bold text-sm"
                                                    >
                                                        View Profile →
                                                    </Link>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Team History */}
                            {player.teamHistory && player.teamHistory.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                        <span>📅</span> Team History
                                    </h3>
                                    <div className="space-y-3">
                                        {player.teamHistory.map((th, index) => (
                                            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-xl">
                                                    {th.isCurrent ? "✓" : "🏏"}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-gray-900">{th.team?.name || "Unknown Team"}</p>
                                                        {th.isCurrent && (
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 font-medium">
                                                        {th.from ? new Date(th.from).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : "N/A"}
                                                        {" - "}
                                                        {th.to ? new Date(th.to).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : (th.isCurrent ? "Present" : "N/A")}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Batting Tab */}
                    {activeTab === "batting" && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-3xl">🏏</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Batting Statistics</h2>
                                    <p className="text-gray-500 font-medium">Career batting performance</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <DetailedStat label="Matches" value={player.stats?.matches || 0} />
                                <DetailedStat label="Innings" value={player.stats?.innings || 0} />
                                <DetailedStat label="Runs" value={player.stats?.runs || player.stats?.batting_runs || 0} highlight />
                                <DetailedStat label="Balls Faced" value={player.stats?.ballsFaced || 0} />
                                <DetailedStat label="Average" value={(player.stats?.average || player.stats?.batting_average || 0).toFixed(2)} highlight />
                                <DetailedStat label="Strike Rate" value={(player.stats?.strikeRate || player.stats?.batting_strike_rate || 0).toFixed(2)} highlight />
                                <DetailedStat label="Highest Score" value={player.stats?.highScore || "-"} />
                                <DetailedStat label="Not Outs" value={player.stats?.notOuts || 0} />
                                <DetailedStat label="Fifties" value={player.stats?.fifties || player.stats?.batting_fifties || 0} highlight />
                                <DetailedStat label="Centuries" value={player.stats?.hundreds || player.stats?.batting_centuries || 0} highlight />
                                <DetailedStat label="Fours" value={player.stats?.fours || 0} />
                                <DetailedStat label="Sixes" value={player.stats?.sixes || 0} highlight />
                            </div>
                        </div>
                    )}

                    {/* Bowling Tab */}
                    {activeTab === "bowling" && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                                    <span className="text-3xl">⚾</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">Bowling Statistics</h2>
                                    <p className="text-gray-500 font-medium">Career bowling performance</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <DetailedStat label="Matches" value={player.stats?.matches || 0} />
                                <DetailedStat label="Innings" value={player.stats?.bowlingInnings || 0} />
                                <DetailedStat label="Overs" value={player.stats?.overs || 0} />
                                <DetailedStat label="Runs Conceded" value={player.stats?.runsConceded || 0} />
                                <DetailedStat label="Wickets" value={player.stats?.wickets || player.stats?.bowling_wickets || 0} highlight />
                                <DetailedStat label="Best Bowling" value={player.stats?.bestBowling || "-"} highlight />
                                <DetailedStat label="Average" value={(player.stats?.bowlingAverage || 0).toFixed(2)} highlight />
                                <DetailedStat label="Economy" value={(player.stats?.economy || player.stats?.bowling_economy || 0).toFixed(2)} highlight />
                                <DetailedStat label="Strike Rate" value={(player.stats?.bowlingStrikeRate || 0).toFixed(2)} />
                                <DetailedStat label="Dot Balls" value={player.stats?.dotBalls || 0} />
                                <DetailedStat label="4 Wicket Hauls" value={player.stats?.fourWickets || 0} highlight />
                                <DetailedStat label="5 Wicket Hauls" value={player.stats?.fiveWickets || 0} highlight />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper Components
function StatBox({ label, value, color = "text-gray-900" }) {
    return (
        <div className="border-l-4 border-gray-200 pl-4 py-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
        </div>
    );
}

function ProfileCard({ icon, label, value, color }) {
    return (
        <div className={`p-6 rounded-xl border-2 ${color} text-center hover:shadow-md transition-shadow`}>
            <div className="text-4xl mb-3">{icon}</div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{label}</p>
            <p className="text-lg font-black text-gray-900">{value}</p>
        </div>
    );
}

function DetailedStat({ label, value, highlight = false }) {
    return (
        <div className={`p-6 rounded-xl border-2 ${highlight ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'} text-center hover:shadow-md transition-shadow`}>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
            <p className={`text-3xl font-black ${highlight ? 'text-blue-600' : 'text-gray-900'}`}>{value}</p>
        </div>
    );
}
