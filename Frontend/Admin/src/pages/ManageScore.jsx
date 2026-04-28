import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import BallByBallFeed from '../components/BallByBallFeed';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || ''; 

const FIELD_POSITIONS = [
    { id: 'long_off', name: 'Long Off', x: 140, y: 40 },
    { id: 'long_on', name: 'Long On', x: 260, y: 40 },
    { id: 'mid_off', name: 'Mid Off', x: 160, y: 130 },
    { id: 'mid_on', name: 'Mid On', x: 240, y: 130 },
    { id: 'cover', name: 'Cover', x: 90, y: 150 },
    { id: 'point', name: 'Point', x: 60, y: 200 },
    { id: 'fine_leg', name: 'Fine Leg', x: 280, y: 350 },
    { id: 'square_leg', name: 'Square Leg', x: 340, y: 200 },
    { id: 'mid_wicket', name: 'Mid Wicket', x: 300, y: 150 },
    { id: 'gully', name: 'Gully', x: 100, y: 250 },
    { id: 'slip', name: 'Slip', x: 140, y: 280 },
    { id: 'third_man', name: 'Third Man', x: 120, y: 360 },
    { id: 'short_fine_leg', name: 'Short Fine Leg', x: 250, y: 290 },
    { id: 'deep_cover', name: 'Deep Cover', x: 40, y: 100 },
    { id: 'extra_cover', name: 'Extra Cover', x: 110, y: 90 },
    { id: 'backward_point', name: 'Backward Point', x: 70, y: 240 },
    { id: 'deep_mid_wicket', name: 'Deep Mid Wicket', x: 350, y: 90 },
    { id: 'deep_square_leg', name: 'Deep Square Leg', x: 370, y: 230 },
    { id: 'short_mid_wicket', name: 'Short Mid Wicket', x: 270, y: 180 },
    { id: 'cow_corner', name: 'Cow Corner', x: 300, y: 60 },
    { id: 'deep_backward_square_leg', name: 'Deep Backward Square Leg', x: 350, y: 280 },
    { id: 'short_cover', name: 'Short Cover', x: 150, y: 180 }
];
const WICKET_TYPES = ['bowled', 'caught', 'lbw', 'run out', 'stumped', 'hit wicket'];

export default function ManageScore() {
    const { token } = useSelector((state) => state.auth);
    const [matches, setMatches] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const [selectedRuns, setSelectedRuns] = useState(0);
    const [selectedExtra, setSelectedExtra] = useState(null);
    const [selectedWicket, setSelectedWicket] = useState('');
    const [manualCommentary, setManualCommentary] = useState('');
    const [fieldPos, setFieldPos] = useState('');
    const [isWicketDropdownOpen, setIsWicketDropdownOpen] = useState(false);
    const [loadingCommentary, setLoadingCommentary] = useState(false);
    const [toast, setToast] = useState('');
    const [isDRSModalOpen, setIsDRSModalOpen] = useState(false);
    const [drsData, setDrsData] = useState({ result: 'upheld', type: 'lbw' });

    const [activeTab, setActiveTab] = useState('live');
    const [showSelectionModal, setShowSelectionModal] = useState('');
    const [useAICommentary, setUseAICommentary] = useState(true);

    const [setupState, setSetupState] = useState({
        team1XI: [],
        team2XI: [],
        tossWinner: '',
        tossDecision: 'bat',
        strikerId: '',
        nonStrikerId: '',
        bowlerId: '',
        wicketDismissal: '',
        wicketFielder: '',
        wicketNewBatter: ''
    });

    const [wizardStep, setWizardStep] = useState(1);
    const [isPreMatchComplete, setIsPreMatchComplete] = useState(true);

    const formatOvers = (balls) => {
        const overs = Math.floor(balls / 6);
        const rem = balls % 6;
        return `${overs}.${rem}`;
    };

    const tabs = [
        { id: 'live', label: 'LIVE', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
        { id: 'scorecard', label: 'SCORECARD', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
        { id: 'commentary', label: 'COMMENTARY', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
        { id: 'stats', label: 'LIVE STATS', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
        { id: 'overs', label: 'OVERS', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'xi', label: 'PLAYING XI', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
        { id: 'table', label: 'TABLE', icon: 'M9 19V5h6v14H9z' },
        { id: 'photos', label: 'PHOTOS', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'videos', label: 'VIDEOS', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'blogs', label: 'BLOGS', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' }
    ];

    const curInn = selectedMatch?.innings[selectedMatch?.currentInnings] || null;
    const battingTeamId = curInn?.team?._id || curInn?.team;
    
    // Win Probability Logic
    const calculateWinProb = () => {
        if (!selectedMatch || !curInn) return { team1: 50, team2: 50 };
        if (selectedMatch.status === 'completed') return { team1: selectedMatch.result.winner === selectedMatch.teams[0]._id ? 100 : 0, team2: selectedMatch.result.winner === selectedMatch.teams[1]._id ? 100 : 0 };
        
        // Simple heuristic for demo: (Required RR vs Current RR)
        if (selectedMatch.currentInnings === 1 && curInn.target > 0) {
            const rrr = curInn.requiredRunRate || 0;
            const crr = curInn.runRate || 0;
            const prob = Math.max(10, Math.min(90, 50 + (crr - rrr) * 5));
            return { team1: 100 - prob, team2: prob };
        }
        return { team1: 50, team2: 50 };
    }
    const winProb = calculateWinProb();

    const battingTeamTeam = selectedMatch?.teams?.find(t => String(t._id) === String(battingTeamId)) || selectedMatch?.teams?.[0];
    const bowlingTeamTeam = selectedMatch?.teams?.find(t => String(t._id) !== String(battingTeamId)) || selectedMatch?.teams?.[1];

    const getPlayingXI = (teamId) => {
        if (!teamId || !selectedMatch) return [];
        const pxi = selectedMatch.playingXI?.find(p => String(p.team?._id || p.team) === String(teamId));
        if (!pxi || !pxi.players) return [];
        
        // Ensure we return player objects with names
        return pxi.players.map(p => {
            if (typeof p === 'object' && p !== null && p.name) return p;
            // Lookup in teams.players if p is an ID or incomplete object
            const pid = p._id || p;
            for (const team of (selectedMatch.teams || [])) {
                const found = team.players?.find(pl => String(pl._id || pl) === String(pid));
                if (found && typeof found === 'object') return found;
            }
            return typeof p === 'object' ? p : { _id: p, name: `Player ${p}` };
        });
    }

    // Get squad (squad15) for a team, falling back to playingXI
    const getSquad = (teamId) => {
        if (!teamId || !selectedMatch) return [];
        const squad = selectedMatch.squad15?.find(s => String(s.team?._id || s.team) === String(teamId));
        
        let players = [];
        if (squad && squad.players && squad.players.length > 0) {
            players = squad.players;
        } else {
            players = getPlayingXI(teamId);
        }

        if (players.length > 0) {
            // Ensure objects
            return players.map(p => {
                if (typeof p === 'object' && p !== null && p.name) return p;
                const pid = p._id || p;
                for (const team of (selectedMatch.teams || [])) {
                    const found = team.players?.find(pl => String(pl._id || pl) === String(pid));
                    if (found && typeof found === 'object') return found;
                }
                return typeof p === 'object' ? p : { _id: p, name: `Player ${p}` };
            });
        }
        
        // Final fallback: use all players assigned to the team
        const team = selectedMatch.teams?.find(t => String(t._id) === String(teamId));
        return team?.players || [];
    }
    const getSquadMeta = (teamId) => {
        if (!teamId || !selectedMatch) return null;
        return selectedMatch.squad15?.find(s => String(s.team?._id || s.team) === String(teamId)) || null;
    }
    // Use squad for batting/bowling player lists (larger pool than just XI)
    const battingXI = useMemo(() => getSquad(battingTeamId), [selectedMatch, battingTeamId]);
    const bowlingXI = useMemo(() => getSquad(bowlingTeamTeam?._id), [selectedMatch, bowlingTeamTeam]);

    // Derived current match state
    const strikerId = curInn?.onStrikeBatsman?._id || curInn?.onStrikeBatsman;
    const bat1Id = curInn?.currentBatsman1?._id || curInn?.currentBatsman1;
    const bat2Id = curInn?.currentBatsman2?._id || curInn?.currentBatsman2;
    const nonStrikerId = (String(bat1Id) === String(strikerId) ? bat2Id : bat1Id);
    const bowlerId = curInn?.currentBowler?._id || curInn?.currentBowler;

    const strikerStats = useMemo(() => curInn?.batting?.find(b => String(b.player?._id || b.player) === String(strikerId)), [curInn, strikerId]);
    const nonStrikerStats = useMemo(() => curInn?.batting?.find(b => String(b.player?._id || b.player) === String(nonStrikerId)), [curInn, nonStrikerId]);
    const activeBowlerStats = useMemo(() => curInn?.bowling?.find(b => String(b.player?._id || b.player) === String(bowlerId)), [curInn, bowlerId]);

    const currentPartnership = useMemo(() => {
        if (!curInn || !curInn.partnerships || curInn.partnerships.length === 0) return { runs: 0, balls: 0 };
        const lastP = curInn.partnerships[curInn.partnerships.length - 1];
        // If it's an active partnership (no wicket associated yet)
        if (lastP && lastP.wicket === undefined) return lastP;
        return { runs: 0, balls: 0 };
    }, [curInn]);

    const formattedHistory = useMemo(() => {
        if (!selectedMatch || !curInn || !curInn.oversHistory) return [];

        const balls = [];
        curInn.oversHistory.forEach(over => {
            over.balls.forEach(ball => {
                balls.push({
                    ...ball,
                    overNumber: over.overNumber,
                    batsmanName: ball.batsmanOnStrike?.name || (battingXI.find(p => String(p._id) === String(ball.batsmanOnStrike?._id || ball.batsmanOnStrike))?.name) || "Batsman",
                    bowlerName: ball.bowler?.name || (bowlingXI.find(p => String(p._id) === String(ball.bowler?._id || ball.bowler))?.name) || "Bowler",
                    ballNumber: over.overNumber * 6 + ball.ballNumber
                });
            });
        });
        return balls;
    }, [selectedMatch, curInn, battingXI, bowlingXI]);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/matches`, { headers: { Authorization: `Bearer ${token}` } });
            setMatches(res.data?.matches || res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMatch = async (matchId) => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/matches/${matchId}`);
            setSelectedMatch(res.data);
            
            const t1XI = res.data.playingXI?.find(p => (p.team?._id||p.team) === res.data.teams[0]?._id)?.players?.map(p=>p._id||p) || [];
            const t2XI = res.data.playingXI?.find(p => (p.team?._id||p.team) === res.data.teams[1]?._id)?.players?.map(p=>p._id||p) || [];
            const curInn = res.data.innings[res.data.currentInnings];
            const strikeId = curInn?.onStrikeBatsman?._id || curInn?.onStrikeBatsman || '';
            const bat1Id = curInn?.currentBatsman1?._id || curInn?.currentBatsman1 || '';
            const bat2Id = curInn?.currentBatsman2?._id || curInn?.currentBatsman2 || '';
            const nonStrikeId = (bat1Id === strikeId ? bat2Id : bat1Id);
            
            setSetupState(prev => ({
                ...prev,
                team1XI: t1XI,
                team2XI: t2XI,
                tossWinner: res.data.tossWinner?._id || res.data.tossWinner || '',
                tossDecision: res.data.tossDecision || 'bat',
                strikerId: strikeId,
                nonStrikerId: nonStrikeId,
                bowlerId: curInn?.currentBowler?._id || curInn?.currentBowler || ''
            }));

            checkRoles(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const checkRoles = (matchData) => {
        if (!matchData) return;
        const curInn = matchData.innings[matchData.currentInnings];
        if (!curInn) return;

        // 1. Check Playing XI
        const team1XI = matchData.playingXI?.find(p => (p.team?._id||p.team) === matchData.teams[0]?._id);
        const team2XI = matchData.playingXI?.find(p => (p.team?._id||p.team) === matchData.teams[1]?._id);
        const hasPlayingXI = team1XI && team2XI && team1XI.players.length === 11 && team2XI.players.length === 11;

        // 2. Check Toss
        const hasToss = !!(matchData.tossWinner && matchData.tossDecision);

        // 3. Check openers
        const hasOpeners = curInn.onStrikeBatsman && curInn.currentBatsman1 && curInn.currentBatsman2 && curInn.currentBowler;

        if (!hasPlayingXI || !hasToss || !hasOpeners) {
            setIsPreMatchComplete(false);
            if (!hasPlayingXI) setWizardStep(1);
            else if (!hasToss) setWizardStep(2);
            else setWizardStep(3);
        } else {
            setIsPreMatchComplete(true);
            setWizardStep(4);
            const ballsTossed = curInn.balls % 6;
            const overNum = curInn.overs;
            const overHist = curInn.oversHistory.find(o => o.overNumber === overNum);
            if (overHist?.balls?.length > 0 && ballsTossed === 0) {
                setShowSelectionModal('bowler');
            } else {
                setShowSelectionModal('');
            }
        }
    };

    const submitBall = async () => {
        if (!selectedMatch) return;
        const curInn = selectedMatch.innings[selectedMatch.currentInnings];
        if (!curInn.onStrikeBatsman || !curInn.currentBowler) {
            alert("Ensure players are selected");
            return;
        }

        const batsmanOnStrike = curInn.onStrikeBatsman?._id || curInn.onStrikeBatsman;
        const b1Id = curInn.currentBatsman1?._id || curInn.currentBatsman1;
        const b2Id = curInn.currentBatsman2?._id || curInn.currentBatsman2;
        const batsmanNonStrike = (String(b1Id) === String(batsmanOnStrike) ? b2Id : b1Id);
        
        let aiLine1 = manualCommentary || "Played securely.";

        const ballData = {
            inningsIndex: selectedMatch.currentInnings,
            runs: selectedRuns,
            isWide: selectedExtra === 'WIDE',
            isNoBall: selectedExtra === 'NO BALL',
            isBye: selectedExtra === 'BYE',
            isLegBye: selectedExtra === 'LEG BYE',
            isWicket: !!selectedWicket,
            wicketType: selectedWicket,
            fielderId: setupState.wicketFielder || undefined,
            batsmanOnStrikeId: batsmanOnStrike,
            batsmanNonStrikeId: batsmanNonStrike,
            bowlerId: curInn.currentBowler?._id || curInn.currentBowler,
            fieldingZone: FIELD_POSITIONS.find(p => p.id === fieldPos)?.name || fieldPos,
            commentaryText: manualCommentary,
            customCommentary: !useAICommentary && !!manualCommentary,
            nextBatsmanId: setupState.wicketNewBatter || undefined
        };

        try {
            const res = await axios.post(`${API_URL}/matches/${selectedMatch._id}/score`, ballData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setToast(res.data.isOverComplete ? "Over Completed!" : "Ball Submitted");
            setSelectedMatch(res.data.match);
            setSelectedRuns(0);
            setSelectedExtra(null);
            setSelectedWicket('');
            setFieldPos('');
            setManualCommentary('');
            
            if (res.data.shouldEndInnings) {
                setToast("Innings should be ended!");
            }
            
            // If there's a new batter selected from the wicket modal, assign them
            if (selectedWicket && setupState.wicketNewBatter) {
                try {
                    const newRole = selectedWicket === 'run out' ? 'nonStriker' : 'striker'; // Simplification, ideally user chooses who is out
                    // Wait for state to settle, then set role
                    await setRole(setupState.wicketNewBatter, 'striker');
                } catch (e) { console.error(e); }
                setSetupState(s => ({ ...s, wicketDismissal: '', wicketFielder: '', wicketNewBatter: '' }));
            } else {
                checkRoles(res.data.match);
            }
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const handleEndInnings = async () => {
        if (!window.confirm("End this innings?")) return;
        try {
            const res = await axios.post(`${API_URL}/matches/${selectedMatch._id}/end-innings`, {
                inningsIndex: selectedMatch.currentInnings
            }, { headers: { Authorization: `Bearer ${token}` } });
            setSelectedMatch(res.data.match);
            setToast("Innings Ended");
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    }

    const handleStartNext = async () => {
        try {
            const res = await axios.post(`${API_URL}/matches/${selectedMatch._id}/start-next-innings`, {
                previousInningsIndex: selectedMatch.currentInnings
            }, { headers: { Authorization: `Bearer ${token}` } });
            setSelectedMatch(res.data.match);
            setToast("Next Innings Started");
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    }

    const handleRevert = async () => {
        if (!window.confirm("Are you sure you want to undo the last ball? All associated stats will be reversed.")) return;
        if (!selectedMatch) return;
        try {
            const res = await axios.post(`${API_URL}/matches/${selectedMatch._id}/revert-ball`, 
            { inningsIndex: selectedMatch.currentInnings }, 
            { headers: { Authorization: `Bearer ${token}` }});
            setSelectedMatch(res.data.match);
            setToast("Reverted successfully");
        } catch(e) {
            alert(e.response?.data?.message || e.message);
        }
    };

    const handleResetInnings = async () => {
        if (!window.confirm("CRITICAL: This will reset ALL score data for the current innings (0 runs, 0 balls, clear stats). This cannot be undone. Proceed?")) return;
        try {
            const res = await axios.post(`${API_URL}/matches/${selectedMatch._id}/reset-innings`, {
                inningsIndex: selectedMatch.currentInnings
            }, { headers: { Authorization: `Bearer ${token}` } });
            setSelectedMatch(res.data.match);
            setToast("Innings Reset Successfully");
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const setRole = async (playerId, role) => {
        try {
            const updated = { ...selectedMatch };
            const curInn = updated.innings[updated.currentInnings];
            
            // To persist, we should hit the API
            if (role === 'striker' || role === 'nonStriker') {
                const currentStrikerId = curInn.onStrikeBatsman?._id || curInn.onStrikeBatsman;
                const currentNonStrikerId = (String(curInn.currentBatsman1?._id || curInn.currentBatsman1) === String(currentStrikerId)) 
                    ? (curInn.currentBatsman2?._id || curInn.currentBatsman2)
                    : (curInn.currentBatsman1?._id || curInn.currentBatsman1);

                let b1, b2;
                if (role === 'striker') {
                    b1 = playerId;
                    b2 = currentNonStrikerId;
                } else {
                    b1 = currentStrikerId;
                    b2 = playerId;
                }
                
                await axios.put(`${API_URL}/matches/${selectedMatch._id}/openers`, {
                    inningsIndex: selectedMatch.currentInnings,
                    batsman1Id: b1,
                    batsman2Id: b2
                }, { headers: { Authorization: `Bearer ${token}` } });
            } else if (role === 'bowler') {
                await axios.post(`${API_URL}/matches/${selectedMatch._id}/set-bowler`, {
                    inningsIndex: selectedMatch.currentInnings,
                    bowlerId: playerId
                }, { headers: { Authorization: `Bearer ${token}` } });
            }

            // Local update for immediate UI feedback
            if (role === 'striker') {
                curInn.onStrikeBatsman = playerId;
                curInn.currentBatsman1 = playerId;
                // currentBatsman2 stays what it was (the non-striker)
            } else if (role === 'nonStriker') {
                curInn.currentBatsman2 = playerId;
                // onStrike stays currentBatsman1
            } else if (role === 'bowler') {
                curInn.currentBowler = playerId;
            }
            
            setSelectedMatch({ ...updated });
            setShowSelectionModal('');
            // Re-fetch to ensure sync with backend
            const res = await axios.get(`${API_URL}/matches/${selectedMatch._id}`);
            setSelectedMatch(res.data);
            checkRoles(res.data);
        } catch (err) {
            alert("Failed to set role: " + (err.response?.data?.message || err.message));
        }
    };

    const handleSavePlayingXI = async () => {
        if (setupState.team1XI.length !== 11 || setupState.team2XI.length !== 11) {
            alert("Please select exactly 11 players for both teams.");
            return;
        }
        try {
            await axios.put(`${API_URL}/matches/${selectedMatch._id}/playing-xi`, { teamId: selectedMatch.teams[0]._id, players: setupState.team1XI }, { headers: { Authorization: `Bearer ${token}` } });
            await axios.put(`${API_URL}/matches/${selectedMatch._id}/playing-xi`, { teamId: selectedMatch.teams[1]._id, players: setupState.team2XI }, { headers: { Authorization: `Bearer ${token}` } });
            const res = await axios.get(`${API_URL}/matches/${selectedMatch._id}`);
            setSelectedMatch(res.data);
            checkRoles(res.data);
            setWizardStep(2);
            setToast("Playing XI Saved!");
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const handleSaveToss = async () => {
        if (!setupState.tossWinner || !setupState.tossDecision) {
            alert("Please select Toss Winner and Decision.");
            return;
        }
        try {
            await axios.put(`${API_URL}/matches/${selectedMatch._id}/toss`, {
                tossWinnerId: setupState.tossWinner,
                decision: setupState.tossDecision
            }, { headers: { Authorization: `Bearer ${token}` } });
            const res = await axios.get(`${API_URL}/matches/${selectedMatch._id}`);
            setSelectedMatch(res.data);
            checkRoles(res.data);
            setWizardStep(3);
            setToast("Toss Saved!");
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const handleSaveOpeners = async () => {
        if (!setupState.strikerId || !setupState.nonStrikerId || !setupState.bowlerId) {
            alert("Please select Striker, Non-Striker, and Bowler.");
            return;
        }
        if (setupState.strikerId === setupState.nonStrikerId) {
            alert("Striker and Non-Striker cannot be the same player.");
            return;
        }
        try {
            await axios.put(`${API_URL}/matches/${selectedMatch._id}/openers`, {
                inningsIndex: selectedMatch.currentInnings,
                batsman1Id: setupState.strikerId,
                batsman2Id: setupState.nonStrikerId
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            await axios.post(`${API_URL}/matches/${selectedMatch._id}/set-bowler`, {
                inningsIndex: selectedMatch.currentInnings,
                bowlerId: setupState.bowlerId
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setIsPreMatchComplete(true);
            const res = await axios.get(`${API_URL}/matches/${selectedMatch._id}`);
            setSelectedMatch(res.data);
            checkRoles(res.data);
            setToast("Match Ready to Start!");
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const handleTimeout = async () => {
        if (!window.confirm("Trigger Strategic Timeout?")) return;
        try {
            const res = await axios.post(`${API_URL}/matches/${selectedMatch._id}/timeout`, {
                teamId: battingTeamId
            }, { headers: { Authorization: `Bearer ${token}` } });
            setSelectedMatch(res.data.match);
            setToast("Strategic Timeout Started");
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const handleDRSReview = async () => {
        try {
            const res = await axios.post(`${API_URL}/matches/${selectedMatch._id}/drs`, {
                teamId: battingTeamId,
                result: drsData.result,
                type: drsData.type,
                over: Math.floor(curInn.balls / 6),
                ball: (curInn.balls % 6) || 6
            }, { headers: { Authorization: `Bearer ${token}` } });
            setSelectedMatch(res.data.match);
            setIsDRSModalOpen(false);
            setToast("DRS Review Recorded");
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const handleDeleteMatch = async (matchId, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this match permanently?")) return;
        try {
            await axios.delete(`${API_URL}/matches/${matchId}`, { headers: { Authorization: `Bearer ${token}` } });
            setMatches(prev => prev.filter(m => m._id !== matchId));
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    if (loading && !selectedMatch) return <div className="p-10 text-center text-xl font-bold bg-[#f1f5f9] min-h-screen">Loading matches...</div>;

    if (!selectedMatch) {
        return (
            <div className="p-8 max-w-[1200px] mx-auto min-h-screen bg-[#f1f5f9]">
                <h1 className="text-3xl font-black text-[#0d1b2a] mb-8 uppercase tracking-tight">Select Match to Score</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {matches.map(m => (
                        <div key={m._id} onClick={() => handleSelectMatch(m._id)} className="bg-white p-8 rounded-3xl shadow-sm border border-transparent hover:border-blue-400 cursor-pointer transition-all relative group overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                            <button 
                                onClick={(e) => handleDeleteMatch(m._id, e)} 
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete match"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{m.format} • {m.venue}</div>
                            <h2 className="text-xl font-black text-[#0d1b2a] leading-tight mb-4 uppercase">{m.teams[0]?.name} <br/><span className="text-blue-500">VS</span><br/> {m.teams[1]?.name}</h2>
                            <div className="flex items-center justify-between mt-4">
                                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${m.status === 'live' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>{m.status}</span>
                                <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!isPreMatchComplete) {
        return (
            <div className="min-h-screen bg-[#0a0e14] text-white flex flex-col items-center justify-center p-8">
                <div className="w-full max-w-4xl bg-[#141b24] rounded-[4rem] border border-white/5 shadow-2xl p-16 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-[#ff6b35]"></div>
                    
                    <div className="flex justify-between items-center mb-16">
                        <div className="space-y-2">
                            <h2 className="text-5xl font-black font-raj italic uppercase tracking-tighter">Match Setup Wizard</h2>
                            <p className="text-slate-400 font-medium tracking-wide uppercase text-xs">Step {wizardStep} of 3: {wizardStep === 1 ? 'Team Rosters' : wizardStep === 2 ? 'Toss Result' : 'Openers'}</p>
                        </div>
                        <button onClick={() => setSelectedMatch(null)} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest border border-white/10 px-6 py-3 rounded-full">Exit Setup</button>
                    </div>

                    {wizardStep === 1 && (
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {[0, 1].map(idx => (
                                    <div key={idx} className="space-y-6">
                                        <h4 className="text-sm font-black uppercase text-[#ff6b35] tracking-widest pl-2">{selectedMatch.teams[idx]?.name} Squad</h4>
                                        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                                            {(selectedMatch.teams[idx]?.players || []).map(p => {
                                                const pId = p._id || p;
                                                const isSelected = idx === 0 ? setupState.team1XI.includes(pId) : setupState.team2XI.includes(pId);
                                                return (
                                                    <button 
                                                        key={pId}
                                                        onClick={() => {
                                                            const teamKey = idx === 0 ? 'team1XI' : 'team2XI';
                                                            const current = setupState[teamKey];
                                                            setSetupState(s => ({
                                                                ...s,
                                                                [teamKey]: isSelected ? current.filter(id => id !== pId) : [...current, pId]
                                                            }));
                                                        }}
                                                        className={`p-4 rounded-2xl border-2 text-left transition-all ${isSelected ? 'bg-[#ff6b35]/10 border-[#ff6b35] text-white' : 'bg-white/2 border-white/5 text-slate-500 hover:border-white/20'}`}
                                                    >
                                                        <div className="font-bold">{p.name || `Player ${pId}`}</div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                                            {idx === 0 ? setupState.team1XI.length : setupState.team2XI.length} / 11 Selected
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleSavePlayingXI} className="w-full py-8 rounded-[2.5rem] bg-[#ff6b35] text-white font-black font-raj text-2xl italic tracking-tighter uppercase shadow-[0_20px_50px_rgba(255,107,53,0.3)] hover:scale-[1.02] transition-all">Save Playing XIs</button>
                        </div>
                    )}

                    {wizardStep === 2 && (
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-4">Toss Winner</label>
                                    <div className="grid grid-cols-1 gap-4">
                                        {selectedMatch.teams.map(t => (
                                            <button key={t._id} onClick={() => setSetupState(s => ({ ...s, tossWinner: t._id }))} className={`p-8 rounded-3xl border-2 font-black text-xl italic font-raj transition-all ${setupState.tossWinner === t._id ? 'bg-blue-600/10 border-blue-500 text-blue-500' : 'bg-white/2 border-white/5 text-slate-500'}`}>
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-4">Decision</label>
                                    <div className="grid grid-cols-1 gap-4">
                                        {['bat', 'bowl'].map(d => (
                                            <button key={d} onClick={() => setSetupState(s => ({ ...s, tossDecision: d }))} className={`p-8 rounded-3xl border-2 font-black text-xl italic font-raj uppercase transition-all ${setupState.tossDecision === d ? 'bg-[#ff6b35]/10 border-[#ff6b35] text-[#ff6b35]' : 'bg-white/2 border-white/5 text-slate-500'}`}>
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleSaveToss} className="w-full py-8 rounded-[2.5rem] bg-[#ff6b35] text-white font-black font-raj text-2xl italic tracking-tighter uppercase shadow-xl hover:scale-105 transition-all">Confirm Toss</button>
                        </div>
                    )}

                    {wizardStep === 3 && (
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase text-[#ff6b35] tracking-widest pl-2">Select Batters</h4>
                                    <select value={setupState.strikerId} onChange={(e) => setSetupState(s => ({ ...s, strikerId: e.target.value }))} className="w-full p-6 bg-black/40 border border-white/10 rounded-3xl text-white font-bold outline-none focus:border-[#ff6b35]">
                                        <option value="">Select Striker...</option>
                                        {battingXI.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                    </select>
                                    <select value={setupState.nonStrikerId} onChange={(e) => setSetupState(s => ({ ...s, nonStrikerId: e.target.value }))} className="w-full p-6 bg-black/40 border border-white/10 rounded-3xl text-white font-bold outline-none focus:border-[#ff6b35]">
                                        <option value="">Select Non-Striker...</option>
                                        {battingXI.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-widest pl-2">Select Bowler</h4>
                                    <select value={setupState.bowlerId} onChange={(e) => setSetupState(s => ({ ...s, bowlerId: e.target.value }))} className="w-full p-6 bg-black/40 border border-white/10 rounded-3xl text-white font-bold outline-none focus:border-blue-500">
                                        <option value="">Select Opening Bowler...</option>
                                        {bowlingXI.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button onClick={handleSaveOpeners} className="w-full py-8 rounded-[2.5rem] bg-[#ff6b35] text-white font-black font-raj text-2xl italic tracking-tighter uppercase shadow-xl hover:scale-105 transition-all">Start Live Scoring</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#0a0e14] text-white p-4 lg:p-8 gap-8">
            {/* MAIN CONTENT (Left) */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header / Match Info */}
                <div className="bg-[#141b24] rounded-[2.5rem] p-8 border border-white/5 shadow-xl mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-400">Live Match Tracking</span>
                        </div>
                        <div className="text-[10px] font-black tracking-[0.3em] uppercase text-[#ff6b35]">Match ID: {selectedMatch._id.slice(-6)}</div>
                    </div>
                    
                    <div className="flex justify-between items-end">
                        <div className="space-y-2">
                            <h1 className="text-5xl font-black font-raj italic tracking-tighter uppercase leading-none">
                                {battingTeamTeam?.name} <span className="text-[#ff6b35]">VS</span> {bowlingTeamTeam?.name}
                            </h1>
                            <div className="text-slate-400 font-medium">{selectedMatch.venue} • {selectedMatch.format}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-6xl font-black font-raj italic text-white leading-none">
                                {curInn?.runs}/{curInn?.wickets}
                            </div>
                            <div className="text-xl font-bold text-slate-500 mt-2">OVERS {formatOvers(curInn?.balls)}</div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex bg-[#141b24] rounded-full p-1 border border-white/5 mb-6 overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-full transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon} />
                            </svg>
                            <span className="text-[10px] font-black tracking-widest uppercase">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content Area */}
                <div className="flex-1 bg-[#141b24] rounded-[3.5rem] border border-white/5 shadow-2xl p-8 overflow-y-auto no-scrollbar min-h-[600px]">
                    {activeTab === 'live' && (
                        <div className="space-y-8 animate-fadeIn">
                            {/* Score Overlays, Batsmen, Bowlers */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Batsmen Card */}
                                <div className="bg-black/20 rounded-[2.5rem] p-8 border border-white/5">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Current Batters</h3>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-xl font-black text-white flex items-center gap-2">
                                                    {battingXI.find(p => String(p._id) === String(strikerId))?.name || 'Waiting...'}
                                                    <span className="text-[#ff6b35]">*</span>
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Striker</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-white">{Math.max(0, strikerStats?.runs || 0)} ({Math.max(0, strikerStats?.balls || 0)})</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">4s: {strikerStats?.fours || 0} | 6s: {strikerStats?.sixes || 0}</div>
                                            </div>
                                        </div>
                                        <div className="h-px bg-white/5" />
                                        <div className="flex justify-between items-center opacity-60">
                                            <div>
                                                <div className="text-xl font-black text-white">{battingXI.find(p => String(p._id) === String(nonStrikerId))?.name || 'Waiting...'}</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Non-Striker</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-white">{Math.max(0, nonStrikerStats?.runs || 0)} ({Math.max(0, nonStrikerStats?.balls || 0)})</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bowler Card */}
                                <div className="bg-black/20 rounded-[2.5rem] p-8 border border-white/5">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Active Bowler</h3>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-xl font-black text-blue-400">
                                                {bowlingXI.find(p => String(p._id) === String(bowlerId))?.name || 'Waiting...'}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Currently Bowling</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-white">
                                                {activeBowlerStats?.wickets || 0}/{activeBowlerStats?.runs || 0}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                                                OVERS: {formatOvers(activeBowlerStats?.balls || 0)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Win Probability Heuristic Visual */}
                                    <div className="mt-8 pt-8 border-t border-white/5">
                                        <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                                            <span>{selectedMatch.teams[0].name} {Math.round(winProb.team1)}%</span>
                                            <span>{selectedMatch.teams[1].name} {Math.round(winProb.team2)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                                            <div className="h-full bg-[#ff6b35]" style={{ width: `${winProb.team1}%` }} />
                                            <div className="h-full bg-blue-500" style={{ width: `${winProb.team2}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Balls */}
                            <div className="bg-black/20 rounded-[2.5rem] p-8 border border-white/5">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Recent Balls</h3>
                                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                    {formattedHistory.slice(-12).reverse().map((ball, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-2 min-w-[60px]">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm border-2 ${ball.isWicket ? 'bg-red-600 border-red-400 text-white animate-pulse' : ball.notation?.includes('4') || ball.runs === 4 ? 'bg-blue-600 border-blue-400 text-white' : ball.notation?.includes('6') || ball.runs === 6 ? 'bg-purple-600 border-purple-400 text-white' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                                                {ball.notation || (ball.isWicket ? 'W' : ball.runs)}
                                            </div>
                                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                                                {formatOvers(ball.ballNumber)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Last Ball Analysis */}
                            <div className="bg-black/20 rounded-[2.5rem] p-8 border border-white/5">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Last Ball Analysis</h3>
                                {formattedHistory.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="flex gap-4 items-start">
                                            <div className="text-xl font-black text-[#ff6b35] whitespace-nowrap">{formatOvers(formattedHistory[formattedHistory.length-1].ballNumber)}</div>
                                            <div className="space-y-2">
                                                <div className="text-lg font-bold text-white leading-tight">
                                                    {formattedHistory[formattedHistory.length-1].bowlerName} to {formattedHistory[formattedHistory.length-1].batsmanName}, {formattedHistory[formattedHistory.length-1].notation || (formattedHistory[formattedHistory.length-1].runs + (formattedHistory[formattedHistory.length-1].extraRuns || 0))}
                                                </div>
                                                <div className="text-slate-400 text-sm italic font-medium leading-relaxed">
                                                    {formattedHistory[formattedHistory.length-1].commentary}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-slate-500 italic text-sm">Waiting for the first ball to be bowled...</div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'scorecard' && (
                        <div className="space-y-12 animate-fadeIn">
                            {/* Batting Scorecard */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-black font-raj italic uppercase text-[#ff6b35] tracking-tight">{battingTeamTeam?.name} Innings</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                <th className="pb-4 pl-4">Batter</th>
                                                <th className="pb-4">Dismissal</th>
                                                <th className="pb-4 text-right">R</th>
                                                <th className="pb-4 text-right">B</th>
                                                <th className="pb-4 text-right">4s</th>
                                                <th className="pb-4 text-right">6s</th>
                                                <th className="pb-4 text-right pr-4">SR</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {(curInn?.batting || []).map((b, idx) => (
                                                <tr key={idx} className="group hover:bg-white/2">
                                                    <td className="py-4 pl-4 font-bold text-white">{b.player?.name || "Player"}</td>
                                                    <td className="py-4 text-xs text-slate-400 italic">{b.howOut || (b.isOut ? 'Dismissed' : 'not out')}</td>
                                                    <td className="py-4 text-right font-black">{b.runs}</td>
                                                    <td className="py-4 text-right text-slate-400">{b.balls}</td>
                                                    <td className="py-4 text-right text-slate-400">{b.fours}</td>
                                                    <td className="py-4 text-right text-slate-400">{b.sixes}</td>
                                                    <td className="py-4 text-right text-[#ff6b35] pr-4 font-bold">{(b.runs / (b.balls || 1) * 100).toFixed(1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Bowling Scorecard */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-black font-raj italic uppercase text-blue-400 tracking-tight">{bowlingTeamTeam?.name} Bowling</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                <th className="pb-4 pl-4">Bowler</th>
                                                <th className="pb-4 text-right">O</th>
                                                <th className="pb-4 text-right">M</th>
                                                <th className="pb-4 text-right">R</th>
                                                <th className="pb-4 text-right">W</th>
                                                <th className="pb-4 text-right pr-4">ECON</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {(curInn?.bowling || []).map((b, idx) => (
                                                <tr key={idx} className="group hover:bg-white/2">
                                                    <td className="py-4 pl-4 font-bold text-white">{b.player?.name || "Player"}</td>
                                                    <td className="py-4 text-right font-black">{formatOvers(b.balls)}</td>
                                                    <td className="py-4 text-right text-slate-400">{b.maidens || 0}</td>
                                                    <td className="py-4 text-right text-slate-400">{b.runs}</td>
                                                    <td className="py-4 text-right text-blue-400 font-black">{b.wickets}</td>
                                                    <td className="py-4 text-right text-slate-400 pr-4">{(b.runs / ((b.balls || 1) / 6)).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'commentary' && (
                        <div className="space-y-6 animate-fadeIn">
                            <h3 className="text-xl font-black font-raj italic uppercase text-[#ff6b35] tracking-tight">Ball by Ball Commentary</h3>
                            <div className="space-y-8">
                                {formattedHistory.slice().reverse().map((ball, idx) => (
                                    <div key={idx} className="flex gap-6 items-start group">
                                        <div className="w-16 flex flex-col items-center">
                                            <div className="text-lg font-black text-[#ff6b35]">{formatOvers(ball.ballNumber)}</div>
                                            <div className={`mt-2 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${ball.isWicket ? 'bg-red-600 text-white' : 'bg-white/5 text-slate-500'}`}>
                                                {ball.isWicket ? 'W' : ball.runs}
                                            </div>
                                        </div>
                                        <div className="flex-1 pb-8 border-b border-white/5 group-last:border-0">
                                            <div className="text-white font-bold text-lg mb-2">
                                                {ball.bowlerName} to {ball.batsmanName}, {ball.runs} {ball.runs === 1 ? 'run' : 'runs'}
                                            </div>
                                            <p className="text-slate-400 italic text-sm leading-relaxed">
                                                {ball.commentary || 'A solid defensive stroke played towards the covers.'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div className="space-y-12 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-black/20 rounded-[2.5rem] p-8 border border-white/5">
                                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6 text-center">Run Rate Comparison</h4>
                                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                                        {[20, 35, 45, 30, 55, 70, 65, 80, 95, 100].map((h, i) => (
                                            <div key={i} className="flex-1 bg-[#ff6b35]/20 rounded-t-lg relative group transition-all hover:bg-[#ff6b35]/40" style={{ height: `${h}%` }}>
                                                <div className="absolute inset-x-0 bottom-0 bg-[#ff6b35] rounded-t-lg transition-all h-2 group-hover:h-full opacity-50"></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-4 text-[9px] font-bold text-slate-600 px-2 uppercase">
                                        <span>Start</span>
                                        <span>Mid</span>
                                        <span>Death</span>
                                    </div>
                                </div>

                                <div className="bg-black/20 rounded-[2.5rem] p-8 border border-white/5">
                                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6 text-center">Partnership Growth</h4>
                                    <div className="h-64 flex items-end justify-between gap-1">
                                        {Array.from({length: 15}).map((_, i) => (
                                            <div key={i} className="flex-1 bg-blue-500/20 rounded-t-lg" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                                        ))}
                                    </div>
                                    <div className="text-center mt-4 text-[9px] font-bold text-slate-600 uppercase tracking-widest">Last 15 Overs</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                    { label: 'Dots %', val: '34.2%', color: 'text-slate-400' },
                                    { label: 'Boundaries', val: '12', color: 'text-[#ff6b35]' },
                                    { label: 'Singles', val: '45', color: 'text-blue-400' },
                                    { label: 'Projected', val: '342', color: 'text-green-500' }
                                ].map((s, i) => (
                                    <div key={i} className="bg-black/20 rounded-3xl p-6 border border-white/5 text-center">
                                        <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
                                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-2">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'xi' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fadeIn">
                            {[battingTeamTeam, bowlingTeamTeam].map((team, idx) => (
                                <div key={idx} className="space-y-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`w-2 h-8 ${idx === 0 ? 'bg-[#ff6b35]' : 'bg-blue-500'} rounded-full`}></div>
                                        <h3 className="text-2xl font-black font-raj italic uppercase tracking-tighter">{team?.name} XI</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {getPlayingXI(team?._id).map((p, pIdx) => (
                                            <div key={pIdx} className="bg-black/20 p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-white/20 transition-all">
                                                <span className="font-bold text-slate-300 group-hover:text-white transition-all">{p.name}</span>
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Player</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {['photos', 'videos', 'blogs'].includes(activeTab) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="group cursor-pointer">
                                    <div className="aspect-video bg-black/40 rounded-[2rem] border border-white/5 overflow-hidden relative mb-4">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                            <div className="w-12 h-12 rounded-full bg-[#ff6b35] flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                            </div>
                                        </div>
                                        {/* Dynamic placeholder text */}
                                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-700 uppercase tracking-widest group-hover:hidden">Media Preview {i}</div>
                                    </div>
                                    <h4 className="font-bold text-slate-300 group-hover:text-white transition-all px-2 uppercase text-sm tracking-tight">Match Highlight: {activeTab.slice(0, -1).toUpperCase()} #{i}</h4>
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] px-2 mt-2">2 Hours Ago • {activeTab.toUpperCase()}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* PERMANENT MANAGEMENT PANEL (Right Sidebar) */}
            <div className="lg:w-[500px] shrink-0 sticky top-32 h-[calc(100vh-160px)] flex flex-col bg-[#141b24] rounded-[3.5rem] border border-white/5 shadow-2xl p-12 overflow-y-auto no-scrollbar">
                <div className="mb-12 flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-black font-raj tracking-tighter italic text-white uppercase">Management Panel</h2>
                        <div className="text-[10px] font-black text-[#ff6b35] uppercase tracking-[0.3em] mt-1">Live Scoring Control</div>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={handleResetInnings} className="text-[9px] font-black text-[#ff6b35] border border-[#ff6b35]/30 px-3 py-1 rounded-full hover:bg-[#ff6b35] hover:text-white transition-all uppercase tracking-widest">Reset</button>
                         <button onClick={handleEndInnings} className="text-[9px] font-black text-red-500 border border-red-500/30 px-3 py-1 rounded-full hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest">End Innings</button>
                         {curInn?.target > 0 && <button onClick={handleStartNext} className="text-[9px] font-black text-green-500 border border-green-500/30 px-3 py-1 rounded-full hover:bg-green-500 hover:text-white transition-all uppercase tracking-widest">Next Innings</button>}
                    </div>
                </div>

                <div className="space-y-12">
                    {/* Role Selectors Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-widest pl-2">On Strike (*)</h4>
                            <button onClick={() => setShowSelectionModal('striker')} className="w-full p-6 bg-white/2 rounded-3xl border border-white/5 text-left font-black font-raj text-lg italic hover:bg-white/5 transition-all text-[#ff6b35]">
                                {battingXI.find(p => String(p._id) === String(strikerId))?.name || 'SELECT STRIKER'}
                            </button>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-widest pl-2">Non-Strike</h4>
                            <button onClick={() => setShowSelectionModal('nonStriker')} className="w-full p-6 bg-white/2 rounded-3xl border border-white/5 text-left font-black font-raj text-lg italic hover:bg-white/5 transition-all opacity-60">
                                {battingXI.find(p => String(p._id) === String(nonStrikerId))?.name || 'SELECT NON-STRIKER'}
                            </button>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <h4 className="text-[9px] font-black uppercase text-slate-500 tracking-widest pl-2">Active Bowler</h4>
                            <button onClick={() => setShowSelectionModal('bowler')} className="w-full p-6 bg-white/2 rounded-3xl border border-white/5 text-left font-black font-raj text-lg italic hover:bg-white/5 transition-all text-blue-500">
                                {bowlingXI.find(p => String(p._id) === String(bowlerId))?.name || 'SELECT BOWLER'}
                            </button>
                        </div>
                    </div>

                    {/* Scoring Buttons Section */}
                    <div className="space-y-8">
                        <div className="grid grid-cols-4 gap-4">
                            {[0, 1, 2, 3, 4, 6].map(num => (
                                <button 
                                    key={num}
                                    onClick={() => setSelectedRuns(num)}
                                    className={`h-20 rounded-3xl font-black font-raj text-2xl transition-all ${selectedRuns === num ? 'bg-[#ff6b35] text-white shadow-[0_15px_30px_rgba(255,107,53,0.3)] scale-110 z-10' : 'bg-white/5 text-white hover:bg-white/10'}`}
                                >
                                    {num === 0 ? 'DOT' : num}
                                </button>
                            ))}
                            <button onClick={handleRevert} className="h-20 rounded-3xl bg-white/2 text-slate-500 hover:text-white transition-all">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mx-auto"><path d="M9 14L4 9l5-5M4 9h12a5 5 0 015 5v3"/></svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {['WIDE', 'NO BALL', 'BYE', 'LEG BYE'].map(type => (
                                <button 
                                    key={type}
                                    onClick={() => setSelectedExtra(selectedExtra === type ? null : type)}
                                    className={`py-4 rounded-2xl text-[10px] font-black tracking-widest transition-all ${selectedExtra === type ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/2 text-slate-500 hover:text-white border border-transparent hover:border-white/5'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6">
                            <button 
                                onClick={() => setShowSelectionModal('wicket')}
                                className={`py-8 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] relative overflow-hidden transition-all h-32 ${selectedWicket ? 'bg-red-600 text-white shadow-xl' : 'bg-red-600/10 text-red-500 border-2 border-red-500/20 hover:bg-red-600/20 font-raj text-2xl italic'}`}
                            >
                                <div className="relative z-10">
                                    {selectedWicket ? `OUT: ${selectedWicket}` : 'FALLEN WICKET'}
                                </div>
                            </button>
                            <button 
                                onClick={submitBall} 
                                className="py-8 rounded-[2rem] bg-green-600 text-white font-black font-raj text-3xl italic tracking-tighter shadow-[0_20px_50px_rgba(22,163,74,0.3)] hover:scale-105 active:scale-95 transition-all uppercase h-32"
                            >
                                Submit Ball
                            </button>
                        </div>
                    </div>

                    {/* Map & Commentary Section */}
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] pl-2 mb-4">Shot Direction</h4>
                        <div className="bg-black/40 rounded-[3rem] p-8 flex justify-center border border-white/5 relative group">
                            <svg width="240" height="240" viewBox="0 0 400 400" className="drop-shadow-2xl">
                                <defs>
                                    <radialGradient id="fieldGradPro" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                        <stop offset="0%" stopColor="#1e293b" />
                                        <stop offset="100%" stopColor="#0a0e14" />
                                    </radialGradient>
                                </defs>
                                <circle cx="200" cy="200" r="195" fill="url(#fieldGradPro)" stroke="#ffffff10" strokeWidth="4" />
                                <circle cx="200" cy="200" r="110" fill="none" stroke="#ffffff08" strokeWidth="2" strokeDasharray="10 5" />
                                <rect x="188" y="140" width="24" height="120" fill="#cc9b6d10" rx="4" />
                                {FIELD_POSITIONS.map(pos => {
                                    const isActive = fieldPos === pos.id;
                                    return (
                                        <g key={pos.id} className="cursor-pointer" onClick={() => setFieldPos(isActive ? '' : pos.id)}>
                                            <circle cx={pos.x} cy={pos.y} r={isActive ? 12 : 6} fill={isActive ? '#ff6b35' : '#ffffff10'} className="transition-all duration-300" />
                                            {isActive && <circle cx={pos.x} cy={pos.y} r="20" fill="none" stroke="#ff6b35" strokeWidth="1" className="animate-ping" />}
                                        </g>
                                    );
                                })}
                            </svg>
                            <div className="absolute bottom-6 right-8 text-[11px] font-black font-raj italic text-[#ff6b35] uppercase tracking-tighter">
                                {fieldPos ? FIELD_POSITIONS.find(p=>p.id===fieldPos)?.name : 'Select Zone'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-12 text-center opacity-30 text-[9px] font-black tracking-[0.5em] uppercase">
                    Cricinfo Elite Scoring Engine 2026
                </div>
            </div>

            {/* Selection Modals */}
            {showSelectionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                    <div className="bg-[#141b24] w-full max-w-4xl rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden animate-zoomIn">
                        <div className="p-12">
                            <div className="flex justify-between items-center mb-12">
                                <h3 className="text-4xl font-black font-raj italic uppercase tracking-tighter text-white">
                                    {showSelectionModal === 'wicket' ? 'DISMISSAL DETAILS' :
                                     showSelectionModal === 'striker' ? 'SELECT NEW STRIKER' :
                                     showSelectionModal === 'nonStriker' ? 'SELECT NEW NON-STRIKER' :
                                     showSelectionModal === 'bowler' ? 'CHANGE BOWLER' : 'SELECTION'}
                                </h3>
                                <button onClick={() => setShowSelectionModal('')} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500 transition-all text-white">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </button>
                            </div>

                            {showSelectionModal === 'wicket' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {WICKET_TYPES.map(type => (
                                            <button key={type} onClick={() => setSelectedWicket(type)} className={`p-6 rounded-3xl border-2 font-black uppercase text-xs tracking-widest transition-all ${selectedWicket === type ? 'bg-red-600 border-red-400 text-white shadow-lg' : 'bg-white/2 border-white/5 text-slate-500 hover:border-white/20'}`}>
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-2">Next Batsman</label>
                                            <select value={setupState.wicketNewBatter} onChange={(e) => setSetupState(s => ({ ...s, wicketNewBatter: e.target.value }))} className="w-full p-6 bg-black/40 border border-white/10 rounded-3xl text-white font-black">
                                                <option value="">Select Next In...</option>
                                                {battingXI.filter(p => ![strikerId, nonStrikerId].includes(p._id)).map(p => (
                                                    <option key={p._id} value={p._id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-2">Fielder Involved</label>
                                            <select value={setupState.wicketFielder} onChange={(e) => setSetupState(s => ({ ...s, wicketFielder: e.target.value }))} className="w-full p-6 bg-black/40 border border-white/10 rounded-3xl text-white font-black">
                                                <option value="">Select Fielder...</option>
                                                {bowlingXI.map(p => (
                                                    <option key={p._id} value={p._id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowSelectionModal('')} className="w-full py-8 rounded-[2rem] bg-red-600 text-white font-black font-raj text-2xl italic tracking-tighter uppercase shadow-xl hover:scale-105 transition-all mt-8">Confirm Wicket Details</button>
                                </div>
                            )}

                            {(showSelectionModal === 'striker' || showSelectionModal === 'nonStriker') && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {battingXI.map(p => (
                                        <button key={p._id} onClick={() => setRole(p._id, showSelectionModal)} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-[#ff6b35] hover:bg-[#ff6b35]/5 transition-all text-left">
                                            <div className="text-xl font-black text-white">{p.name}</div>
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2 select-none">Select Batter</div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {showSelectionModal === 'bowler' && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {bowlingXI.map(p => (
                                        <button key={p._id} onClick={() => setRole(p._id, 'bowler')} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 hover:border-blue-500 hover:bg-blue-500/5 transition-all text-left">
                                            <div className="text-xl font-black text-white">{p.name}</div>
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2 select-none">Select Bowler</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
