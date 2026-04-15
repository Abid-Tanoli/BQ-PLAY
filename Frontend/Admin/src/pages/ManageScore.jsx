import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import EnhancedScoringPanel from "../components/EnhancedScoringPanel";
import PlayingXISelection from "../components/PlayingXISelection";
import TossManager from "../components/TossManager";
import api from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ManageScore() {
    const [matches, setMatches] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useSelector((state) => state.auth);

    // Modal states
    const [showPlayingXIModal, setShowPlayingXIModal] = useState(false);
    const [xiTeam, setXiTeam] = useState(null);
    const [showTossModal, setShowTossModal] = useState(false);

    // Event data
    const [eventData, setEventData] = useState(null);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/matches`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMatches(res.data?.matches || res.data || []);
        } catch (err) {
            setError("Failed to fetch matches");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMatch = async (match) => {
        setSelectedMatch(match);
        setLoading(true);
        try {
            const res = await api.get(`/matches/${match._id}`);
            const matchData = res.data;
            setSelectedMatch(matchData);

            console.log('=== MATCH DATA ===');
            console.log('Match:', matchData);
            console.log('Tournament/Event ID:', matchData.tournament);

            // Load event data if match belongs to tournament/event
            if (matchData.tournament) {
                try {
                    const evRes = await api.get(`/events/${matchData.tournament}`);
                    console.log('=== EVENT DATA ===');
                    console.log('Event:', evRes.data);
                    console.log('Event ID:', evRes.data._id);
                    console.log('Event Squads:', evRes.data.eventSquads);
                    console.log('Event Squads length:', evRes.data.eventSquads?.length);
                    if (evRes.data.eventSquads?.length > 0) {
                        console.log('First event squad:', evRes.data.eventSquads[0]);
                        console.log('First event squad team:', evRes.data.eventSquads[0].team);
                        console.log('First event squad players:', evRes.data.eventSquads[0].players);
                        console.log('First event squad players count:', evRes.data.eventSquads[0].players?.length);
                    }
                    setEventData(evRes.data);
                } catch (err) {
                    console.error('Failed to load event:', err);
                    setEventData(null);
                }
            } else {
                console.log('No tournament associated with match');
                setEventData(null);
            }
        } catch (err) {
            console.error('Failed to fetch match details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitBall = async (ballData) => {
        if (!selectedMatch) return;

        try {
            const res = await axios.post(
                `${API_URL}/matches/${selectedMatch._id}/score`,
                ballData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSelectedMatch(res.data?.match || res.data);
        } catch (err) {
            alert("Error submitting ball: " + (err.response?.data?.message || err.message));
        }
    };

    const handleEndInnings = async () => {
        if (!selectedMatch) return;
        if (!window.confirm("End current innings?")) return;

        try {
            const res = await axios.post(
                `${API_URL}/matches/${selectedMatch._id}/end-innings`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSelectedMatch(res.data?.match || res.data);
        } catch (err) {
            alert("Error ending innings: " + (err.response?.data?.message || err.message));
        }
    };

    const handleTossSuccess = () => {
        fetchMatches();
        if (selectedMatch) handleSelectMatch(selectedMatch);
    };

    const handlePlayingXISuccess = () => {
        fetchMatches();
        if (selectedMatch) handleSelectMatch(selectedMatch);
    };

    const getCurrentBatsmen = () => {
        if (!selectedMatch?.innings?.[selectedMatch.currentInnings]) return [];
        const batting = selectedMatch.innings[selectedMatch.currentInnings].batting || [];
        return batting.filter((b) => !b.isOut).slice(0, 2);
    };

    const getCurrentBowler = () => {
        if (!selectedMatch?.innings?.[selectedMatch.currentInnings]) return null;
        const bowling = selectedMatch.innings[selectedMatch.currentInnings].bowling || [];
        return bowling.length > 0 ? bowling[bowling.length - 1] : null;
    };

    const getCurrentScore = () => {
        if (!selectedMatch?.innings?.[selectedMatch.currentInnings]) return { runs: 0, wickets: 0, overs: "0.0" };
        const inn = selectedMatch.innings[selectedMatch.currentInnings];
        const balls = inn.balls || 0;
        const overs = Math.floor(balls / 6);
        const ballInOver = balls % 6;
        return {
            runs: inn.runs || 0,
            wickets: inn.wickets || 0,
            overs: `${overs}.${ballInOver}`,
        };
    };

    const getPlayingXI = (teamId) => {
        return selectedMatch?.playingXI?.find(x => x.team === teamId);
    };

    const getEventSquadForTeam = (teamId) => {
        if (!eventData?.eventSquads) {
            return null;
        }

        const teamIdStr = teamId?.toString();
        const squad = eventData.eventSquads.find(s => {
            // Handle both cases: team as ObjectId string or populated object
            const squadTeamId = typeof s.team === 'object' ? s.team?._id?.toString() : s.team?.toString();
            return squadTeamId === teamIdStr;
        });

        return squad || null;
    };

    // If match is in scoring mode
    const isScoringMode = selectedMatch?.status === 'live';

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 p-6 lg:p-10">
            <div className="mb-10">
                <h1 className="text-4xl lg:text-5xl font-black text-[#031d44] tracking-tight">
                    LIVE SCORING
                </h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Score matches in real-time with AI commentary
                </p>
            </div>

            {/* Match Selection */}
            {!selectedMatch && (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-6">
                        Select Match to Score
                    </h2>

                    {loading && (
                        <div className="text-center py-10">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                            <p className="mt-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                                Loading Matches...
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm mb-4">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {matches.map((match) => (
                            <button
                                key={match._id}
                                onClick={() => handleSelectMatch(match)}
                                className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg ${match.status === "upcoming"
                                    ? "border-green-200 bg-green-50 hover:border-green-400"
                                    : match.status === "live" || match.status === "pending_tie_resolution"
                                        ? "border-blue-200 bg-blue-50 hover:border-blue-400"
                                        : "border-slate-200 bg-slate-50 hover:border-slate-400"
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-3 h-3 rounded-full ${match.status === "live" ? "bg-green-500 animate-pulse" :
                                        match.status === "upcoming" ? "bg-blue-500" : "bg-slate-400"
                                        }`}></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        {match.status.replace(/_/g, " ")}
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-slate-800 mb-1">
                                    {match.teams?.[0]?.name || "Team A"} vs {match.teams?.[1]?.name || "Team B"}
                                </h3>
                                <p className="text-xs text-slate-500">{match.title}</p>
                                <p className="text-[10px] text-slate-400 mt-2">
                                    {match.venue || 'Venue TBA'} • {new Date(match.startAt).toLocaleDateString()}
                                </p>
                                {match.tossWinner && (
                                    <p className="text-[10px] text-blue-600 mt-1 font-bold">
                                        Toss: {match.teams?.find(t => t._id === match.tossWinner)?.name} elected to {match.tossDecision}
                                    </p>
                                )}
                            </button>
                        ))}
                    </div>

                    {matches.length === 0 && !loading && (
                        <div className="text-center py-10">
                            <p className="text-sm font-black text-slate-300 uppercase tracking-widest">
                                No Matches Available
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                                Create a match first from Manage Events
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Scoring Interface */}
            {selectedMatch && (
                <div className="space-y-6">
                    {/* Match Header */}
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <button
                                        onClick={() => { setSelectedMatch(null); fetchMatches(); }}
                                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors"
                                    >
                                        ← Back
                                    </button>
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${selectedMatch.status === "live" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                        }`}>
                                        {selectedMatch.status.replace(/_/g, " ")}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-[#031d44]">
                                    {selectedMatch.teams?.[0]?.name || "Team A"} vs{" "}
                                    {selectedMatch.teams?.[1]?.name || "Team B"}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">{selectedMatch.title}</p>
                                <p className="text-xs text-slate-400 mt-1">{selectedMatch.venue || 'Venue TBA'}</p>
                            </div>

                            {/* Score Display */}
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-4xl font-black text-[#031d44]">
                                        {getCurrentScore().runs}/{getCurrentScore().wickets}
                                    </p>
                                    <p className="text-xs font-bold text-slate-500 mt-1">
                                        Overs: {getCurrentScore().overs}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Match Setup Section */}
                        {!isScoringMode && (
                            <div className="mt-6 pt-6 border-t border-slate-200">
                                <h3 className="text-xs font-black text-slate-500 uppercase mb-3">Match Setup</h3>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {/* Playing XI Buttons */}
                                    {selectedMatch.teams?.map((team) => {
                                        const playingXI = getPlayingXI(team._id);
                                        const eventSquad = getEventSquadForTeam(team._id);
                                        const hasEventSquad = eventSquad?.players?.length >= 11;
                                        return (
                                            <button
                                                key={team._id}
                                                onClick={() => {
                                                    setXiTeam(team);
                                                    setShowPlayingXIModal(true);
                                                }}
                                                className={`p-4 rounded-xl text-xs font-bold transition-all ${playingXI
                                                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                                                    : hasEventSquad
                                                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                                        : 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                                                    }`}
                                            >
                                                <div className="font-black text-sm mb-1">🏏 Playing XI: {team.name}</div>
                                                <div className="text-[10px]">
                                                    {playingXI
                                                        ? `✓ Selected (${playingXI.players?.length || 11} players)`
                                                        : hasEventSquad
                                                            ? `Event Squad Ready (${eventSquad.players?.length} players)`
                                                            : '✗ Set Playing XI'
                                                    }
                                                </div>
                                            </button>
                                        );
                                    })}

                                    {/* Toss Button */}
                                    <button
                                        onClick={() => setShowTossModal(true)}
                                        className={`p-4 rounded-xl text-xs font-bold transition-all col-span-2 ${selectedMatch.tossWinner
                                            ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                            : 'bg-[#031d44] text-white hover:bg-slate-800'
                                            }`}
                                    >
                                        {selectedMatch.tossWinner
                                            ? `✓ Toss: ${selectedMatch.teams?.find(t => t._id === selectedMatch.tossWinner)?.name} elected to ${selectedMatch.tossDecision}`
                                            : '🪙 Conduct Toss'
                                        }
                                    </button>
                                </div>

                                {/* Event Squad Info */}
                                {eventData && (eventData.eventSquads || []).length > 0 && (
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                        <p className="text-xs font-bold text-blue-700 mb-2">📋 Event Squads (Managed at Series Level)</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedMatch.teams?.map(team => {
                                                const eventSquad = getEventSquadForTeam(team._id);
                                                return (
                                                    <div key={team._id} className="text-xs">
                                                        <p className="font-bold text-slate-800 mb-1">{team.name}</p>
                                                        {eventSquad ? (
                                                            <div className="space-y-0.5">
                                                                <p className="text-slate-600">C: {eventSquad.players?.find(p => p._id === eventSquad.captain)?.name || 'TBD'}</p>
                                                                <p className="text-slate-600">VC: {eventSquad.players?.find(p => p._id === eventSquad.viceCaptain)?.name || 'TBD'}</p>
                                                                <p className="text-slate-600">WK: {eventSquad.wicketKeepers?.length || 0}</p>
                                                                <p className="text-slate-600">Total: {eventSquad.players?.length || 0} players</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-slate-400">Squad not set</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Recent Balls */}
                    {selectedMatch?.innings?.[selectedMatch.currentInnings]?.oversHistory?.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
                                Recent Balls
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedMatch.innings[selectedMatch.currentInnings].oversHistory
                                    .slice(-2)
                                    .flatMap((over) => over.balls || [])
                                    .slice(-12)
                                    .map((ball, i) => (
                                        <div
                                            key={i}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${ball.isWicket ? "bg-red-500 text-white"
                                                : ball.runs === 4 || ball.runs === 6 ? "bg-green-500 text-white"
                                                    : ball.extra ? "bg-orange-500 text-white"
                                                        : ball.runs === 0 ? "bg-slate-200 text-slate-700"
                                                            : "bg-blue-500 text-white"
                                                }`}
                                        >
                                            {ball.isWicket ? 'W' : ball.runs}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Scoring Panel */}
                    <EnhancedScoringPanel
                        onSubmitBall={handleSubmitBall}
                        currentBatsmen={getCurrentBatsmen()}
                        currentBowler={getCurrentBowler()}
                        onEndInnings={handleEndInnings}
                    />

                    {/* Modals */}
                    {showTossModal && (
                        <TossManager
                            match={selectedMatch}
                            onClose={() => setShowTossModal(false)}
                            onSuccess={handleTossSuccess}
                        />
                    )}

                    {showPlayingXIModal && xiTeam && (
                        <PlayingXISelection
                            match={selectedMatch}
                            team={xiTeam}
                            eventSquad={getEventSquadForTeam(xiTeam._id)}
                            onClose={() => setShowPlayingXIModal(false)}
                            onSuccess={handlePlayingXISuccess}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
