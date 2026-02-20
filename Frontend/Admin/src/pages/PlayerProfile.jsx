import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function PlayerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayer = async () => {
            try {
                const res = await api.get(`/players`);
                // Find the specific player since there might not be a single player endpoint
                const found = res.data.find(p => p._id === id);
                setPlayer(found);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayer();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading Profile...</div>;
    if (!player) return <div className="p-8 text-center text-red-500">Player not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h2 className="text-2xl font-bold text-slate-800">Player Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card flex flex-col items-center p-8 gap-4">
                    {player.imageUrl ? (
                        <img src={player.imageUrl} alt={player.name} className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-50" />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-3xl">
                            {player.name?.substring(0, 2).toUpperCase()}
                        </div>
                    )}
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-slate-800">{player.name}</h3>
                        <p className="text-slate-500 font-medium">{player.role || "No Role Specified"}</p>
                    </div>
                    <div className="w-full pt-4 border-t grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Team</p>
                            <p className="font-semibold text-slate-700">{player.team?.name || "-"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Campus</p>
                            <p className="font-semibold text-slate-700">{player.Campus || "-"}</p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="card">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">Career Statistics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-sm text-blue-600 font-bold mb-1">Runs</p>
                                <p className="text-3xl font-black text-blue-900">{player.stats?.runs || 0}</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                <p className="text-sm text-purple-600 font-bold mb-1">Wickets</p>
                                <p className="text-3xl font-black text-purple-900">{player.stats?.wickets || 0}</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                <p className="text-sm text-green-600 font-bold mb-1">Strike Rate</p>
                                <p className="text-3xl font-black text-green-900">{player.stats?.strikeRate || 0}</p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <p className="text-sm text-orange-600 font-bold mb-1">Economy</p>
                                <p className="text-3xl font-black text-orange-900">{player.stats?.economy || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Recent Performance</h3>
                        <p className="text-slate-500 italic text-sm">Detailed match-by-match history coming soon...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
