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
                api.get('/rankings/batting'),
                api.get('/rankings/bowling')
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
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Player Rankings</h2>
                <p className="text-sm text-slate-500 mt-1">Global standings across all tournaments</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Batting Rankings */}
                <div className="card bg-white shadow-sm rounded-xl overflow-hidden border">
                    <div className="p-4 bg-slate-50 border-b">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Top Batsmen
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold">
                                <tr>
                                    <th className="px-4 py-3">Rank</th>
                                    <th className="px-4 py-3">Player</th>
                                    <th className="px-4 py-3 text-center">Innings</th>
                                    <th className="px-4 py-3 text-center">Runs</th>
                                    <th className="px-4 py-3 text-center">SR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {batting.map((r, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-4 py-4 font-bold text-slate-400">{r.rank}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">{r.player.name}</span>
                                                <span className="text-[10px] text-slate-500 uppercase">{r.player.team?.shortName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">{r.innings}</td>
                                        <td className="px-4 py-4 text-center font-black text-blue-600">{r.runs}</td>
                                        <td className="px-4 py-4 text-center text-slate-500">{r.strikeRate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bowling Rankings */}
                <div className="card bg-white shadow-sm rounded-xl overflow-hidden border">
                    <div className="p-4 bg-slate-50 border-b">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Top Bowlers
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold">
                                <tr>
                                    <th className="px-4 py-3">Rank</th>
                                    <th className="px-4 py-3">Player</th>
                                    <th className="px-4 py-3 text-center">Innings</th>
                                    <th className="px-4 py-3 text-center">Wickets</th>
                                    <th className="px-4 py-3 text-center">Econ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {bowling.map((r, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-4 py-4 font-bold text-slate-400">{r.rank}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">{r.player.name}</span>
                                                <span className="text-[10px] text-slate-500 uppercase">{r.player.team?.shortName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">{r.innings}</td>
                                        <td className="px-4 py-4 text-center font-black text-red-600">{r.wickets}</td>
                                        <td className="px-4 py-4 text-center text-slate-500">{r.economy}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
