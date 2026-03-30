import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const ROLE_COLORS = {
  "Batsman": "bg-blue-100 text-blue-700 border-blue-300",
  "Bowler": "bg-green-100 text-green-700 border-green-300",
  "All-Rounder": "bg-purple-100 text-purple-700 border-purple-300",
  "Batting-All-Rounder": "bg-cyan-100 text-cyan-700 border-cyan-300",
  "Bowling-All-Rounder": "bg-lime-100 text-lime-700 border-lime-300",
  "Wicket-Keeper": "bg-orange-100 text-orange-700 border-orange-300"
};

const BATTING_STYLE_ICONS = {
  "Right-handed": "🤜",
  "Left-handed": "🤛"
};

const ROLE_BADGES = {
  "Batsman": "🏏",
  "Bowler": "⚾",
  "All-Rounder": "🎯",
  "Batting-All-Rounder": "🏏⚾",
  "Bowling-All-Rounder": "⚾🏏",
  "Wicket-Keeper": "🥅"
};

export default function PlayerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);

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
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading player profile...</p>
      </div>
    );
    if (!player) return <div className="p-8 text-center text-red-500 font-bold">Player not found</div>;

    const bgColor = ROLE_COLORS[player.playingRole] || "bg-slate-100";
    const roleEmoji = ROLE_BADGES[player.playingRole] || "👤";

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Players
            </button>

            {/* Header Section */}
            <div className={`${bgColor} rounded-xl p-8 border-2`}>
                <div className="flex gap-8 items-start">
                    {/* Player Image */}
                    {player.imageUrl ? (
                        <img 
                          src={player.imageUrl} 
                          alt={player.name} 
                          className="w-40 h-40 rounded-lg object-cover border-4 border-white shadow-lg"
                        />
                    ) : (
                        <div className="w-40 h-40 rounded-lg bg-white bg-opacity-50 flex items-center justify-center text-5xl font-bold">
                            {roleEmoji}
                        </div>
                    )}

                    {/* Player Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-black">{player.name}</h1>
                            <span className="text-3xl">{roleEmoji}</span>
                        </div>
                        <p className="text-lg font-bold opacity-90 mb-4">{player.playingRole}</p>
                        
                        <div className="flex gap-3 mb-4 flex-wrap">
                            <span className="px-4 py-2 rounded-full bg-white bg-opacity-30 font-bold text-sm">
                                {BATTING_STYLE_ICONS[player.battingStyle]} {player.battingStyle}
                            </span>
                            <span className="px-4 py-2 rounded-full bg-white bg-opacity-30 font-bold text-sm">
                                {player.bowlingStyle}
                            </span>
                            {player.role && (
                                <span className="px-4 py-2 rounded-full bg-white bg-opacity-30 font-bold text-sm">
                                    {player.role}
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm opacity-75 font-bold">TEAM</p>
                                <p className="text-xl font-bold">{player.team?.name || "Unassigned"}</p>
                            </div>
                            {player.Campus && (
                                <div>
                                    <p className="text-sm opacity-75 font-bold">CAMPUS</p>
                                    <p className="text-xl font-bold">{player.Campus}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-slate-200 p-6 text-center hover:shadow-lg transition-shadow">
                    <p className="text-slate-600 text-xs font-bold uppercase mb-2">Matches</p>
                    <p className="text-4xl font-black text-blue-600">{player.stats?.matches || 0}</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-6 text-center hover:shadow-lg transition-shadow">
                    <p className="text-slate-600 text-xs font-bold uppercase mb-2">Runs</p>
                    <p className="text-4xl font-black text-green-600">{player.stats?.runs || 0}</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-6 text-center hover:shadow-lg transition-shadow">
                    <p className="text-slate-600 text-xs font-bold uppercase mb-2">Wickets</p>
                    <p className="text-4xl font-black text-orange-600">{player.stats?.wickets || 0}</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-6 text-center hover:shadow-lg transition-shadow">
                    <p className="text-slate-600 text-xs font-bold uppercase mb-2">Avg</p>
                    <p className="text-4xl font-black text-purple-600">{(player.stats?.average || 0).toFixed(1)}</p>
                </div>
            </div>

            {/* Batting & Bowling Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Batting Stats */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
                        <h3 className="text-xl font-black flex items-center gap-2">
                            <span className="text-2xl">{BATTING_STYLE_ICONS[player.battingStyle]}</span>
                            Batting Statistics
                        </h3>
                    </div>
                    <div className="p-6 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border-l-4 border-blue-600 pl-3">
                                <p className="text-xs text-slate-500 font-bold uppercase">Runs</p>
                                <p className="text-3xl font-black text-blue-600">{player.stats?.runs || 0}</p>
                            </div>
                            <div className="border-l-4 border-blue-600 pl-3">
                                <p className="text-xs text-slate-500 font-bold uppercase">Innings</p>
                                <p className="text-3xl font-black text-blue-600">{player.stats?.innings || 0}</p>
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium">Average</span>
                                <span className="text-lg font-black text-slate-800">{(player.stats?.average || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium">Strike Rate</span>
                                <span className="text-lg font-black text-slate-800">{(player.stats?.strikeRate || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium">Highest Score</span>
                                <span className="text-lg font-black text-slate-800">{player.stats?.highScore || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium">Not Outs</span>
                                <span className="text-lg font-black text-slate-800">{player.stats?.notOuts || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium">Fifties</span>
                                <span className="text-lg font-black text-green-600">{player.stats?.fifties || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium">Centuries</span>
                                <span className="text-lg font-black text-green-600">{player.stats?.hundreds || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bowling Stats */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4">
                        <h3 className="text-xl font-black flex items-center gap-2">
                            <span className="text-2xl">⚾</span>
                            Bowling Statistics
                        </h3>
                    </div>
                    <div className="p-6 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border-l-4 border-green-600 pl-3">
                                <p className="text-xs text-slate-500 font-bold uppercase">Wickets</p>
                                <p className="text-3xl font-black text-green-600">{player.stats?.wickets || 0}</p>
                            </div>
                            <div className="border-l-4 border-green-600 pl-3">
                                <p className="text-xs text-slate-500 font-bold uppercase">Overs</p>
                                <p className="text-3xl font-black text-green-600">-</p>
                            </div>
                        </div>

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium">Economy Rate</span>
                                <span className="text-lg font-black text-slate-800">{(player.stats?.economy || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium">Bowling Average</span>
                                <span className="text-lg font-black text-slate-800">{(player.stats?.bowlingAverage || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium">Best Bowling</span>
                                <span className="text-lg font-black text-slate-800">{player.stats?.bestBowling || "-"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium">Dot Balls</span>
                                <span className="text-lg font-black text-slate-800">{player.stats?.dotBalls || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium">4-Wicket Hauls</span>
                                <span className="text-lg font-black text-orange-600">{player.stats?.fourWickets || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium">5-Wicket Hauls</span>
                                <span className="text-lg font-black text-orange-600">{player.stats?.fiveWickets || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Playing Style Summary */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Playing Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xl font-black text-blue-700 mb-1">{BATTING_STYLE_ICONS[player.battingStyle]}</p>
                        <p className="text-sm text-slate-600 font-bold uppercase">Batting Stance</p>
                        <p className="font-bold text-slate-800">{player.battingStyle}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xl font-black text-green-700 mb-1">⚾</p>
                        <p className="text-sm text-slate-600 font-bold uppercase">Bowling Arm</p>
                        <p className="font-bold text-slate-800">{player.bowlingStyle}</p>
                    </div>
                    <div className={`p-4 rounded-lg border-2 ${bgColor}`}>
                        <p className="text-xl font-black mb-1">{roleEmoji}</p>
                        <p className="text-sm font-bold uppercase opacity-75">Playing Role</p>
                        <p className="font-bold">{player.playingRole}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
