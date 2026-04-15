import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useParams, useNavigate, Link } from 'react-router-dom';

const TeamProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await api.get(`/teams/${id}`);
                setTeam(res.data.data || res.data);
            } catch (err) {
                setError('Failed to fetch team details');
                console.error(err);
            }
            setLoading(false);
        };
        fetchTeam();
    }, [id]);

    const handleDelete = async () => {
        try {
            await api.delete(`/teams/${id}`);
            navigate('/teams');
        } catch (err) {
            console.error('Failed to delete team:', err);
        }
    };

    const getPlayerRoleColor = (role) => {
        const colors = {
            Batsman: 'bg-orange-100 text-orange-800',
            Bowler: 'bg-green-100 text-green-800',
            'All-rounder': 'bg-purple-100 text-purple-800',
            'Wicket-keeper': 'bg-blue-100 text-blue-800',
        };
        return colors[role] || 'bg-slate-100 text-slate-800';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 p-6 lg:p-10 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#031d44] mx-auto mb-4"></div>
                    <p className="text-slate-500 font-bold">Loading team profile...</p>
                </div>
            </div>
        );
    }

    if (error || !team) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 p-6 lg:p-10 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 font-bold text-xl mb-4">{error || 'Team not found'}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-[#031d44] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl px-6 py-3"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const players = team.players || [];
    const playerStats = {
        batsmen: players.filter((p) => p.role === 'Batsman').length,
        bowlers: players.filter((p) => p.role === 'Bowler').length,
        allRounders: players.filter((p) => p.role === 'All-rounder').length,
        wicketKeepers: players.filter((p) => p.role === 'Wicket-keeper').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 p-6 lg:p-10">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="text-slate-600 hover:text-[#031d44] font-bold text-sm mb-4 inline-block"
                >
                    &larr; Back
                </button>
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-[#031d44] to-blue-900" />
                    <div className="px-6 pb-6 -mt-16">
                        <div className="flex flex-col md:flex-row md:items-end gap-6">
                            {team.logo ? (
                                <img
                                    src={team.logo}
                                    alt={team.name}
                                    className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg object-cover bg-white"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg bg-[#031d44] flex items-center justify-center text-white text-4xl font-black">
                                    {team.shortName?.toUpperCase() || team.name?.charAt(0)}
                                </div>
                            )}
                            <div className="flex-1">
                                <h1 className="text-4xl lg:text-5xl font-black text-[#031d44]">{team.name}</h1>
                                <p className="text-slate-500 text-lg">{team.shortName}</p>
                                {team.owner && <p className="text-slate-500">Owner: {team.owner}</p>}
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    to={`/teams/${id}/edit`}
                                    className="bg-[#031d44] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl px-6 py-3"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl px-6 py-3"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 text-center">
                    <p className="text-4xl font-black text-[#031d44]">{players.length}</p>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-wider mt-1">Total Players</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 text-center">
                    <p className="text-4xl font-black text-orange-600">{playerStats.batsmen}</p>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-wider mt-1">Batsmen</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 text-center">
                    <p className="text-4xl font-black text-green-600">{playerStats.bowlers}</p>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-wider mt-1">Bowlers</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 text-center">
                    <p className="text-4xl font-black text-purple-600">{playerStats.allRounders}</p>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-wider mt-1">All-Rounders</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 text-center">
                    <p className="text-4xl font-black text-blue-600">{playerStats.wicketKeepers}</p>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-wider mt-1">Wicket-Keepers</p>
                </div>
            </div>

            {/* Players List */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
                <h2 className="text-2xl font-bold text-[#031d44] mb-4">Squad</h2>
                {players.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No players in this team yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#031d44] text-white">
                                    <th className="px-4 py-3 text-left">#</th>
                                    <th className="px-4 py-3 text-left">Player</th>
                                    <th className="px-4 py-3 text-left">Role</th>
                                    <th className="px-4 py-3 text-left">Batting</th>
                                    <th className="px-4 py-3 text-left">Bowling</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {players.map((player, idx) => (
                                    <tr key={player._id} className="border-b border-slate-200 hover:bg-slate-50">
                                        <td className="px-4 py-4 font-bold text-slate-500">{idx + 1}</td>
                                        <td className="px-4 py-4">
                                            <Link
                                                to={`/players/${player._id}`}
                                                className="font-bold text-[#031d44] hover:underline"
                                            >
                                                {player.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-bold ${getPlayerRoleColor(
                                                    player.role
                                                )}`}
                                            >
                                                {player.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-slate-600">{player.battingStyle || '-'}</td>
                                        <td className="px-4 py-4 text-slate-600">{player.bowlingStyle || '-'}</td>
                                        <td className="px-4 py-4 text-center">
                                            <Link
                                                to={`/players/${player._id}`}
                                                className="bg-[#031d44] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-lg px-3 py-2"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
                        <h2 className="text-2xl font-black text-[#031d44] mb-4">Delete Team?</h2>
                        <p className="text-slate-500 mb-6">
                            Are you sure you want to delete <strong>{team.name}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl px-6 py-3 flex-1"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="bg-slate-200 hover:bg-slate-300 text-[#031d44] font-black text-xs uppercase tracking-widest rounded-xl px-6 py-3 flex-1"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamProfile;
