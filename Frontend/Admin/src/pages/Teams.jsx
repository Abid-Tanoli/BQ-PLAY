import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    addPlayersToTeam,
} from '../store/slices/teamSlice';
import { fetchPlayers } from '../store/slices/playersSlice';
import { initSocket } from '../store/socket';

const Teams = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { teams, loading } = useSelector((state) => state.teams);
    const { players } = useSelector((state) => state.players);
    const { register, handleSubmit, reset, setValue } = useForm();

    const [editMode, setEditMode] = useState(false);
    const [currentTeam, setCurrentTeam] = useState(null);
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [playerTab, setPlayerTab] = useState('squad');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlayers, setSelectedPlayers] = useState([]);

    useEffect(() => {
        dispatch(fetchTeams());
        dispatch(fetchPlayers());
        const socket = initSocket();
        return () => {
            if (socket) socket.disconnect();
        };
    }, [dispatch]);

    const onSubmit = async (data) => {
        if (editMode) {
            await dispatch(updateTeam({ id: currentTeam._id, data }));
        } else {
            await dispatch(createTeam(data));
        }
        reset();
        setEditMode(false);
        setCurrentTeam(null);
        dispatch(fetchTeams());
    };

    const handleEdit = (team) => {
        setEditMode(true);
        setCurrentTeam(team);
        setValue('name', team.name);
        setValue('shortName', team.shortName);
        setValue('owner', team.owner);
        setValue('logo', team.logo);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this team?')) {
            await dispatch(deleteTeam(id));
            dispatch(fetchTeams());
        }
    };

    const openPlayerModal = (team) => {
        setCurrentTeam(team);
        setSelectedPlayers(team.players || []);
        setShowPlayerModal(true);
        setPlayerTab('squad');
    };

    const togglePlayerSelection = (playerId) => {
        setSelectedPlayers((prev) =>
            prev.includes(playerId)
                ? prev.filter((id) => id !== playerId)
                : [...prev, playerId]
        );
    };

    const saveSquad = async () => {
        await dispatch(addPlayersToTeam({ teamId: currentTeam._id, playerIds: selectedPlayers }));
        setShowPlayerModal(false);
        dispatch(fetchTeams());
    };

    const filteredPlayers = players.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const squadPlayers = filteredPlayers.filter((p) => selectedPlayers.includes(p._id));
    const freeAgents = filteredPlayers.filter((p) => !selectedPlayers.includes(p._id));

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 p-6 lg:p-10">
            <h1 className="text-4xl lg:text-5xl font-black text-[#031d44] mb-8">Teams Management</h1>

            {/* Team Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 mb-8">
                <h2 className="text-2xl font-bold text-[#031d44] mb-4">
                    {editMode ? 'Edit Team' : 'Create New Team'}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                        {...register('name', { required: true })}
                        placeholder="Team Name"
                        className="border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#031d44]"
                    />
                    <input
                        {...register('shortName', { required: true })}
                        placeholder="Short Name"
                        className="border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#031d44]"
                    />
                    <input
                        {...register('owner')}
                        placeholder="Owner"
                        className="border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#031d44]"
                    />
                    <input
                        {...register('logo')}
                        placeholder="Logo URL"
                        className="border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#031d44]"
                    />
                    <div className="flex gap-2 col-span-full">
                        <button
                            type="submit"
                            className="bg-[#031d44] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl px-6 py-3"
                        >
                            {editMode ? 'Update Team' : 'Create Team'}
                        </button>
                        {editMode && (
                            <button
                                type="button"
                                onClick={() => {
                                    reset();
                                    setEditMode(false);
                                    setCurrentTeam(null);
                                }}
                                className="bg-slate-200 hover:bg-slate-300 text-[#031d44] font-black text-xs uppercase tracking-widest rounded-xl px-6 py-3"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => (
                    <div
                        key={team._id}
                        className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-shadow"
                    >
                        <div className="h-32 bg-gradient-to-r from-[#031d44] to-blue-900 flex items-center justify-center">
                            {team.logo ? (
                                <img src={team.logo} alt={team.name} className="h-20 w-20 object-contain rounded-full" />
                            ) : (
                                <span className="text-4xl font-black text-white">{team.shortName}</span>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="text-xl font-bold text-[#031d44]">{team.name}</h3>
                            <p className="text-slate-500 text-sm">Owner: {team.owner || 'N/A'}</p>
                            <p className="text-slate-500 text-sm">Players: {team.players?.length || 0}</p>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleEdit(team)}
                                    className="bg-[#031d44] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl px-4 py-2"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => openPlayerModal(team)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-xl px-4 py-2"
                                >
                                    Manage Squad
                                </button>
                                <button
                                    onClick={() => handleDelete(team._id)}
                                    className="bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl px-4 py-2"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Player Management Modal */}
            {showPlayerModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="bg-[#031d44] text-white p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Manage Squad - {currentTeam?.name}</h2>
                            <button
                                onClick={() => setShowPlayerModal(false)}
                                className="text-2xl hover:text-slate-300"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-200">
                            <button
                                onClick={() => setPlayerTab('squad')}
                                className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider ${playerTab === 'squad'
                                        ? 'bg-[#031d44] text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                Current Squad ({squadPlayers.length})
                            </button>
                            <button
                                onClick={() => setPlayerTab('free')}
                                className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider ${playerTab === 'free'
                                        ? 'bg-[#031d44] text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                Free Agents ({freeAgents.length})
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b border-slate-200">
                            <input
                                type="text"
                                placeholder="Search players..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#031d44]"
                            />
                        </div>

                        {/* Player List */}
                        <div className="overflow-y-auto max-h-[50vh] p-4">
                            {(playerTab === 'squad' ? squadPlayers : freeAgents).map((player) => (
                                <div
                                    key={player._id}
                                    onClick={() => togglePlayerSelection(player._id)}
                                    className={`flex items-center justify-between p-3 mb-2 rounded-xl cursor-pointer border-2 transition-all ${selectedPlayers.includes(player._id)
                                            ? 'border-[#031d44] bg-blue-50'
                                            : 'border-slate-200 hover:border-slate-400'
                                        }`}
                                >
                                    <div>
                                        <p className="font-bold text-[#031d44]">{player.name}</p>
                                        <p className="text-sm text-slate-500">{player.role}</p>
                                    </div>
                                    <div
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlayers.includes(player._id)
                                                ? 'bg-[#031d44] border-[#031d44]'
                                                : 'border-slate-300'
                                            }`}
                                    >
                                        {selectedPlayers.includes(player._id) && (
                                            <span className="text-white text-xs">&#10003;</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Save Button */}
                        <div className="p-4 border-t border-slate-200">
                            <button
                                onClick={saveSquad}
                                className="w-full bg-[#031d44] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl px-6 py-3"
                            >
                                Save Squad
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Teams;
