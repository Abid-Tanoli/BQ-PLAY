import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function Rankings() {
    const [batting, setBatting] = useState([]);
    const [bowling, setBowling] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRankings();
    }, []);

    const loadRankings = async () => {
        try {
            const [batRes, bowlRes] = await Promise.all([
                api.get("/rankings/batting"),
                api.get("/rankings/bowling"),
            ]);
            setBatting(batRes.data);
            setBowling(bowlRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 p-6 lg:p-10 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                        Loading Rankings...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 p-6 lg:p-10">
            <div className="mb-10">
                <h1 className="text-4xl lg:text-5xl font-black text-[#031d44] tracking-tight">
                    PLAYER RANKINGS
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Global standings across all tournaments
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Batting Rankings */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                        <h2 className="text-sm font-black uppercase tracking-widest">Top Batsmen</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {batting.slice(0, 10).map((r, i) => (
                            <div key={r._id || i} className="flex items-center justify-between p-4 hover:bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${i === 0 ? "bg-yellow-400 text-yellow-900" :
                                            i === 1 ? "bg-slate-300 text-slate-700" :
                                                i === 2 ? "bg-amber-600 text-white" :
                                                    "bg-slate-100 text-slate-500"
                                        }`}>
                                        {i + 1}
                                    </span>
                                    <div>
                                        <p className="font-bold text-slate-800">{r.player?.name || "Unknown"}</p>
                                        <p className="text-xs text-slate-400">{r.player?.team?.name || ""}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-800">{r.runs || 0}</p>
                                    <p className="text-xs text-slate-400">SR: {r.strikeRate || 0}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {batting.length === 0 && (
                        <div className="p-10 text-center">
                            <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No batting data</p>
                        </div>
                    )}
                </div>

                {/* Bowling Rankings */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-green-600 to-green-800 text-white">
                        <h2 className="text-sm font-black uppercase tracking-widest">Top Bowlers</h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {bowling.slice(0, 10).map((r, i) => (
                            <div key={r._id || i} className="flex items-center justify-between p-4 hover:bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${i === 0 ? "bg-yellow-400 text-yellow-900" :
                                            i === 1 ? "bg-slate-300 text-slate-700" :
                                                i === 2 ? "bg-amber-600 text-white" :
                                                    "bg-slate-100 text-slate-500"
                                        }`}>
                                        {i + 1}
                                    </span>
                                    <div>
                                        <p className="font-bold text-slate-800">{r.player?.name || "Unknown"}</p>
                                        <p className="text-xs text-slate-400">{r.player?.team?.name || ""}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-800">{r.wickets || 0}</p>
                                    <p className="text-xs text-slate-400">Econ: {r.economy || 0}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {bowling.length === 0 && (
                        <div className="p-10 text-center">
                            <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No bowling data</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
