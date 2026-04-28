import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

const EnhancedMatchTabs = ({ match }) => {
    const [activeTab, setActiveTab] = useState('live');
    const { theme } = useTheme();

    if (!match) return null;

    const tabs = [
        { id: 'live', label: 'Live Score' },
        { id: 'scorecard', label: 'Scorecard' },
        { id: 'commentary', label: 'Commentary' },
        { id: 'stats', label: 'Stats' },
        { id: 'overs', label: 'Overs' },
        { id: 'xi', label: 'Playing XI' },
        { id: 'table', label: 'Points Table' },
        { id: 'photos', label: 'Photos' },
        { id: 'videos', label: 'Videos' },
        { id: 'blogs', label: 'Blogs' }
    ];

    const currentInnings = match.currentInnings || 0;
    const curInn = match.innings?.[currentInnings];
    const battingTeamId = curInn?.battingTeam?._id || curInn?.battingTeam;
    const bowlingTeamId = curInn?.bowlingTeam?._id || curInn?.bowlingTeam;

    const battingTeamObj = match.teams?.find(t => t._id === battingTeamId);
    const bowlingTeamObj = match.teams?.find(t => t._id === bowlingTeamId);

    const getSquad = (teamId) => {
        const squad = match.squad15?.find(s => (s.team?._id || s.team) === teamId);
        return squad?.players || [];
    };

    const getSquadMeta = (teamId) => {
        return match.squad15?.find(s => (s.team?._id || s.team) === teamId);
    };

    const formatOvers = (balls) => {
        if (!balls) return "0.0";
        return `${Math.floor(balls / 6)}.${balls % 6}`;
    };

    const strikerId = curInn?.onStrikeBatsman?._id || curInn?.onStrikeBatsman;
    const nonStrikerId = (curInn?.currentBatsman1?._id === strikerId ? curInn?.currentBatsman2?._id : curInn?.currentBatsman1?._id) || curInn?.currentBatsman1;
    const bowlerId = curInn?.currentBowler?._id || curInn?.currentBowler;

    const strikerStats = curInn?.batting?.find(b => (b.player?._id || b.player) === strikerId);
    const nonStrikerStats = curInn?.batting?.find(b => (b.player?._id || b.player) === nonStrikerId);
    const activeBowlerStats = curInn?.bowling?.find(b => (b.player?._id || b.player) === bowlerId);

    const playingXI = (teamId) => match.playingXI?.find(xi => (xi.team?._id || xi.team) === teamId)?.players || [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0e14] text-slate-900 dark:text-slate-300 transition-colors duration-500">
            {/* Professional Header Navigation */}
            <div className="sticky top-0 z-[60] bg-white/80 dark:bg-[#0a0e14]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
                <div className="max-w-[1600px] mx-auto px-10 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#ff6b35] rounded-2xl flex items-center justify-center font-black text-white shadow-lg rotate-3">BQ</div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter dark:text-white uppercase italic">Live <span className="text-[#ff6b35]">Match</span></h1>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Official Broadcast Feed</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="hidden lg:flex items-center gap-8">
                            {tabs.map(tab => (
                                <button 
                                    key={tab.id} 
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-[#ff6b35] relative py-2 ${activeTab === tab.id ? 'text-[#ff6b35]' : 'text-slate-400'}`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#ff6b35] rounded-full shadow-[0_0_10px_rgba(255,107,53,0.5)]" />}
                                </button>
                            ))}
                        </div>
                        <div className="h-10 w-px bg-slate-200 dark:bg-white/5 mx-4" />
                        <ThemeToggle />
                    </div>
                </div>
                
                {/* Mobile Tab Scroll */}
                <div className="lg:hidden flex overflow-x-auto no-scrollbar border-t border-slate-200 dark:border-white/5 px-6 gap-6 py-4 bg-white dark:bg-[#0d1b2a]">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`text-[9px] font-black uppercase tracking-widest whitespace-nowrap px-4 py-2 rounded-full transition-all ${activeTab === tab.id ? 'bg-[#ff6b35] text-white shadow-lg' : 'text-slate-500 bg-slate-100 dark:bg-white/5'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-12 px-10 max-w-[1600px] mx-auto pb-24">
                {/* Score Header */}
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-8 text-center md:text-left">
                    <div className="space-y-4">
                        <div className="text-[10px] font-black text-[#ff6b35] uppercase tracking-[0.5em] flex items-center justify-center md:justify-start gap-3">
                            <span className="w-2 h-2 bg-[#ff6b35] rounded-full animate-pulse" />
                            Live Match scoring
                        </div>
                        <h2 className="text-4xl md:text-7xl font-black font-raj tracking-tighter text-slate-900 dark:text-white uppercase italic leading-[0.8]">
                            {match.teams?.[0]?.name} <span className="text-slate-300 dark:text-slate-700 mx-4 opacity-50 font-normal not-italic text-2xl md:text-4xl">vs</span> {match.teams?.[1]?.name}
                        </h2>
                    </div>
                    <div className="md:text-right">
                        <div className="text-6xl md:text-8xl font-black font-raj tracking-tighter text-slate-900 dark:text-white leading-[0.8]">
                            {curInn?.runs}/{curInn?.wickets} 
                            <span className="text-2xl font-black text-[#ffb400] ml-6 italic tracking-tight">{curInn?.runRate || '0.00'} <span className="text-[10px] uppercase not-italic text-slate-500 tracking-widest ml-1">CRR</span></span>
                        </div>
                        <div className="text-xl font-black text-slate-400 dark:text-slate-500 mt-6 uppercase tracking-widest italic">{formatOvers(curInn?.balls)} <span className="opacity-30">Overs Completed</span></div>
                    </div>
                </div>

                {/* Tab Content Render */}
                <div className="animate-in fade-in duration-700">
                    {activeTab === 'live' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Striker Card */}
                                    <div className="bg-white dark:bg-[#141b24] p-8 rounded-[2.5rem] border border-slate-200 dark:border-[#ff6b35] shadow-xl">
                                        <div className="text-[10px] uppercase font-black text-[#ff6b35] tracking-[0.3em] mb-6">Striker</div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <div className="text-3xl font-black font-raj text-slate-900 dark:text-white italic uppercase tracking-tighter">{match.playingXI?.flatMap(xi => xi.players).find(p => p._id === strikerId)?.name || 'Unknown'}*</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Currently at Crease</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-5xl font-black font-raj text-slate-900 dark:text-white">{strikerStats?.runs || 0}</div>
                                                <div className="text-sm font-bold text-slate-500">{strikerStats?.balls || 0} balls • {strikerStats?.fours || 0}x4 {strikerStats?.sixes || 0}x6</div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Non-Striker Card */}
                                    <div className="bg-white dark:bg-[#141b24] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 opacity-80">
                                        <div className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em] mb-6">Non-Striker</div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <div className="text-3xl font-black font-raj text-slate-900 dark:text-white italic uppercase tracking-tighter">{match.playingXI?.flatMap(xi => xi.players).find(p => p._id === nonStrikerId)?.name || 'Unknown'}</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">At Other End</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-5xl font-black font-raj text-slate-900 dark:text-white">{nonStrikerStats?.runs || 0}</div>
                                                <div className="text-sm font-bold text-slate-500">{nonStrikerStats?.balls || 0} balls • {nonStrikerStats?.fours || 0}x4 {nonStrikerStats?.sixes || 0}x6</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Bowler Card */}
                                <div className="bg-white dark:bg-[#141b24] p-10 rounded-[3rem] border border-slate-200 dark:border-blue-500/30 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-10 opacity-5 dark:opacity-10 text-blue-500">
                                        <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                                    </div>
                                    <div className="text-[10px] uppercase font-black text-blue-500 tracking-[0.3em] mb-8">Active Bowler</div>
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 bg-blue-500/10 rounded-[2rem] flex items-center justify-center text-3xl text-blue-500">🎾</div>
                                            <div>
                                                <div className="text-4xl font-black font-raj text-slate-900 dark:text-white italic uppercase tracking-tighter">{match.playingXI?.flatMap(xi => xi.players).find(p => p._id === bowlerId)?.name || 'Unknown'}</div>
                                                <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-2 italic">Current Spell: {activeBowlerStats?.overs || 0}.{activeBowlerStats?.balls % 6 || 0} Overs</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-12">
                                            <div className="text-center">
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Wickets</div>
                                                <div className="text-5xl font-black font-raj text-red-500">{activeBowlerStats?.wickets || 0}</div>
                                            </div>
                                            <div className="text-center border-l border-slate-200 dark:border-white/5 pl-12">
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Runs</div>
                                                <div className="text-5xl font-black font-raj text-slate-900 dark:text-white">{activeBowlerStats?.runs || 0}</div>
                                            </div>
                                            <div className="text-center border-l border-slate-200 dark:border-white/5 pl-12">
                                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Econ</div>
                                                <div className="text-5xl font-black font-raj text-blue-500">{activeBowlerStats?.economy || '0.0'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-4 space-y-8">
                                <div className="bg-white dark:bg-[#141b24] p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl">
                                    <h3 className="text-[10px] font-black uppercase text-[#ff6b35] tracking-[0.3em] mb-10">Win Probability</h3>
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden flex">
                                            <div className="h-full bg-[#ff6b35] transition-all duration-1000" style={{ width: '65%' }} />
                                            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: '35%' }} />
                                        </div>
                                    </div>
                                    <div className="flex justify-between font-black font-raj text-xl italic uppercase tracking-tighter">
                                        <span className="text-[#ff6b35]">{match.teams?.[0]?.shortName} 65%</span>
                                        <span className="text-blue-500">{match.teams?.[1]?.shortName} 35%</span>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#141b24] p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl">
                                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-8">Partnership</h3>
                                    <div className="text-center space-y-4">
                                        <div className="text-6xl font-black font-raj text-slate-900 dark:text-white">48<span className="text-xl text-slate-500 ml-2">runs</span></div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Off 32 deliveries</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'scorecard' && (
                        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
                            {/* Batting Scorecard */}
                            <div className="bg-white dark:bg-[#141b24] rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl">
                                <div className="p-8 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/2 flex justify-between items-center">
                                    <h3 className="text-lg font-black font-raj tracking-[0.2em] uppercase italic text-[#ff6b35]">{battingTeamObj?.name} Batting</h3>
                                    <div className="text-2xl font-black font-raj text-slate-900 dark:text-white">{curInn?.runs}/{curInn?.wickets} <span className="text-sm font-bold text-slate-500">({formatOvers(curInn?.balls)} Ov)</span></div>
                                </div>
                                <div className="overflow-x-auto no-scrollbar">
                                    <table className="w-full text-left min-w-[800px]">
                                        <thead>
                                            <tr className="text-[10px] uppercase font-black tracking-widest text-slate-500 bg-slate-50 dark:bg-white/2 pb-4">
                                                <th className="pl-10 py-6 w-1/3">Batter</th>
                                                <th className="px-4 py-6">Dismissal</th>
                                                <th className="px-4 py-6 text-center">R</th>
                                                <th className="px-4 py-6 text-center">B</th>
                                                <th className="px-4 py-6 text-center">4s</th>
                                                <th className="px-4 py-6 text-center">6s</th>
                                                <th className="pr-10 py-6 text-right">SR</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                            {curInn?.batting?.map((b, idx) => {
                                                const pName = match.playingXI?.flatMap(xi => xi.players).find(p => p._id === (b.player?._id || b.player))?.name || "Unknown";
                                                return (
                                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-all">
                                                        <td className="pl-10 py-6">
                                                            <div className="font-black font-raj text-lg tracking-tight uppercase italic text-slate-900 dark:text-white">{pName}</div>
                                                        </td>
                                                        <td className="px-4 py-6 text-xs font-bold text-slate-400 italic uppercase">
                                                            {b.isOut ? (b.wicketType || 'Out') : 'not out'}
                                                        </td>
                                                        <td className="px-4 py-6 text-center font-black font-raj text-xl text-slate-900 dark:text-white">{b.runs}</td>
                                                        <td className="px-4 py-6 text-center text-sm font-bold text-slate-500">{b.balls}</td>
                                                        <td className="px-4 py-6 text-center text-sm font-bold text-slate-500">{b.fours}</td>
                                                        <td className="px-4 py-6 text-center text-sm font-bold text-slate-500">{b.sixes}</td>
                                                        <td className="pr-10 py-6 text-right font-black font-raj text-lg text-[#ffb400]">{b.strikeRate || '0.0'}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Bowling Scorecard */}
                            <div className="bg-white dark:bg-[#141b24] rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl">
                                <div className="p-8 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/2">
                                    <h3 className="text-lg font-black font-raj tracking-[0.2em] uppercase italic text-blue-500">{bowlingTeamObj?.name} Bowling</h3>
                                </div>
                                <div className="overflow-x-auto no-scrollbar">
                                    <table className="w-full text-left min-w-[800px]">
                                        <thead>
                                            <tr className="text-[10px] uppercase font-black tracking-widest text-slate-500 bg-slate-50 dark:bg-white/2 pb-4">
                                                <th className="pl-10 py-6 w-1/3">Bowler</th>
                                                <th className="px-4 py-6 text-center">O</th>
                                                <th className="px-4 py-6 text-center">M</th>
                                                <th className="px-4 py-6 text-center">R</th>
                                                <th className="px-4 py-6 text-center">W</th>
                                                <th className="px-4 py-6 text-center">ECON</th>
                                                <th className="pr-10 py-6 text-right">0s</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                            {curInn?.bowling?.map((bw, idx) => {
                                                const pName = match.playingXI?.flatMap(xi => xi.players).find(p => p._id === (bw.player?._id || bw.player))?.name || "Unknown";
                                                return (
                                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-all">
                                                        <td className="pl-10 py-6">
                                                            <div className="font-black font-raj text-lg tracking-tight uppercase italic text-slate-900 dark:text-white">{pName}</div>
                                                        </td>
                                                        <td className="px-4 py-6 text-center font-black font-raj text-xl text-slate-900 dark:text-white">{bw.overs}.{bw.balls % 6}</td>
                                                        <td className="px-4 py-6 text-center text-sm font-bold text-slate-500">{bw.maidens || 0}</td>
                                                        <td className="px-4 py-6 text-center font-black font-raj text-xl text-slate-900 dark:text-white">{bw.runs}</td>
                                                        <td className="px-4 py-6 text-center font-black font-raj text-2xl text-red-500">{bw.wickets}</td>
                                                        <td className="px-4 py-6 text-center font-black font-raj text-lg text-blue-500">{bw.economy || '0.00'}</td>
                                                        <td className="pr-10 py-6 text-right text-sm font-bold text-slate-500">{bw.dotBalls || 0}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'commentary' && (
                        <div className="max-w-4xl mx-auto space-y-8 pb-20">
                            {curInn?.oversHistory?.slice().reverse().map((over, idx) => (
                                <div key={idx} className="space-y-6">
                                    <div className="flex items-center gap-6 py-4 px-8 bg-slate-100 dark:bg-white/2 rounded-3xl border border-slate-200 dark:border-white/5">
                                        <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">End of Over {over.overNumber + 1}</div>
                                        <div className="h-px flex-1 bg-slate-200 dark:bg-white/5" />
                                        <div className="text-xl font-black font-raj text-[#ff6b35]">{over.runsScored} Runs • {over.wickets} Wkts</div>
                                    </div>
                                    <div className="space-y-4">
                                        {over.balls?.slice().reverse().map((ball, bIdx) => (
                                            <div key={bIdx} className="flex gap-8 items-start group">
                                                <div className="w-16 pt-2">
                                                    <div className="text-[14px] font-black font-raj text-slate-400 tabular-nums tracking-tighter">{over.overNumber}.{over.balls.length - bIdx}</div>
                                                    <div className={`mt-3 w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg ${ball.isWicket ? 'bg-red-500' : ball.runs >= 4 ? 'bg-blue-600' : 'bg-slate-400'}`}>
                                                        {ball.isWicket ? 'W' : ball.runs}
                                                    </div>
                                                </div>
                                                <div className="flex-1 p-6 bg-white dark:bg-[#141b24] rounded-3xl border border-slate-200 dark:border-white/5 hover:border-[#ff6b35]/20 transition-all shadow-md">
                                                    <p className="text-slate-700 dark:text-white font-bold leading-relaxed">
                                                        {ball.commentary || "Good length delivery, pushed toward the field."}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
                            <div className="space-y-8">
                                <div className="bg-white dark:bg-[#141b24] p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl space-y-10">
                                    <h3 className="text-[10px] font-black uppercase text-[#ff6b35] tracking-[0.3em]">Top Run Scorers</h3>
                                    <div className="space-y-6">
                                        {curInn?.batting?.filter(b => b.runs > 0).sort((a,b)=>b.runs-a.runs).slice(0, 3).map((b, idx) => {
                                            const pName = match.playingXI?.flatMap(xi => xi.players).find(p => p._id === (b.player?._id || b.player))?.name || "Unknown";
                                            return (
                                                <div key={idx} className="space-y-2">
                                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                                        <span className="text-slate-700 dark:text-white">{pName}</span>
                                                        <span className="text-[#ffb400]">{b.runs} ({b.balls})</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                        <div style={{ width: `${(b.runs / Math.max(...curInn.batting.map(x=>x.runs), 1)) * 100}%` }} className="h-full bg-gradient-to-r from-[#ff6b35] to-[#ffb400] rounded-full" />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#141b24] p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl">
                                    <h3 className="text-[10px] font-black uppercase text-[#ffb400] tracking-[0.3em] mb-10">Manhattan (Runs Per Over)</h3>
                                    <div className="aspect-[21/9] relative px-4 flex items-end gap-1">
                                        {curInn?.oversHistory?.map((ov, i) => (
                                            <div key={i} className="flex-1 flex flex-col justify-end group relative h-full">
                                                <div style={{ height: `${(ov.runsScored / Math.max(...curInn.oversHistory.map(h => h.runsScored), 10)) * 100}%` }} className="w-full bg-[#ffb400]/40 rounded-t-sm group-hover:bg-[#ffb400] transition-all" />
                                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded transition-all">{ov.runsScored}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-[#141b24] p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl">
                                <h3 className="text-[10px] font-black uppercase text-[#009cff] tracking-[0.3em] mb-10">Worm Graph (Cumulative)</h3>
                                <div className="aspect-[21/9] relative px-4">
                                    <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
                                        {(() => {
                                            const inn1 = match.innings?.[0]?.oversHistory || [];
                                            const inn2 = match.innings?.[1]?.oversHistory || [];
                                            const maxScore = Math.max(match.innings?.[0]?.runs || 10, match.innings?.[1]?.runs || 10, 50);
                                            const maxOvers = match.totalOvers || 20;

                                            const getPoints = (hist) => {
                                                let p = "0,200 ";
                                                let curr = 0;
                                                hist.forEach((ov, i) => {
                                                    curr += ov.runsScored;
                                                    p += `${((i + 1) / maxOvers) * 400},${200 - (curr / maxScore) * 200} `;
                                                });
                                                return p;
                                            };

                                            return (
                                                <>
                                                    <path d={`M ${getPoints(inn1)}`} fill="none" stroke="#ff6b35" strokeWidth="3" className="animate-draw-path" />
                                                    <path d={`M ${getPoints(inn2)}`} fill="none" stroke="#009cff" strokeWidth="3" className="animate-draw-path" />
                                                </>
                                            );
                                        })()}
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'overs' && (
                        <div className="bg-white dark:bg-[#141b24] rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl mb-20">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                                    <tr className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                                        <th className="px-10 py-6">Over</th>
                                        <th className="px-6 py-6 text-center">Score</th>
                                        <th className="px-6 py-6 text-center">Runs</th>
                                        <th className="pr-10 py-6 text-right">Summary</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {curInn?.oversHistory?.slice().reverse().map((over, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/2 transition-all">
                                            <td className="px-10 py-6 text-xl font-black font-raj text-slate-900 dark:text-white">{over.overNumber + 1}</td>
                                            <td className="px-6 py-6 text-center font-black font-raj text-lg opacity-40">...</td>
                                            <td className="px-6 py-6 text-center font-black font-raj text-xl text-[#ff6b35]">{over.runsScored}</td>
                                            <td className="pr-10 py-6 flex justify-end gap-2">
                                                {over.balls?.map((b, bi) => (
                                                    <div key={bi} className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${b.isWicket ? 'bg-red-500 text-white' : b.runs >= 4 ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}`}>
                                                        {b.isWicket ? 'W' : b.runs}
                                                    </div>
                                                ))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'xi' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-20">
                            {match.teams?.map((team, tIdx) => {
                                const players = playingXI(team._id);
                                return (
                                    <div key={team._id} className="space-y-8">
                                        <div className="flex items-center gap-4 border-l-4 border-[#ff6b35] pl-6">
                                            <h3 className="text-3xl font-black font-raj tracking-tighter uppercase italic text-slate-900 dark:text-white">{team.name}</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {players.map((p, pIdx) => (
                                                <div key={p._id} className="bg-white dark:bg-[#141b24] p-5 rounded-3xl border border-slate-200 dark:border-white/5 flex justify-between items-center shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/2 flex items-center justify-center text-[10px] font-black text-slate-500">{pIdx+1}</div>
                                                        <div>
                                                            <div className="text-sm font-black text-slate-900 dark:text-white italic uppercase tracking-tight">{p.name}</div>
                                                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{p.playingRole || 'Player'}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Placeholder content for Photos, Videos, Blogs */}
                    {(activeTab === 'photos' || activeTab === 'videos') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="group relative bg-slate-200 dark:bg-[#141b24] rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden aspect-video shadow-lg">
                                    <div className="absolute inset-0 bg-slate-300 dark:bg-slate-800 animate-pulse" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                                        <div className="text-[10px] font-black uppercase text-[#ff6b35] tracking-widest">Match Gallery</div>
                                        <div className="text-sm font-black text-white uppercase italic">Broadcast Moment {i}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'blogs' && (
                        <div className="max-w-4xl mx-auto space-y-6 pb-20">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white dark:bg-[#141b24] p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl flex gap-10">
                                    <div className="text-3xl font-black font-raj text-slate-200 dark:text-slate-800">#0{i}</div>
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-black font-raj text-slate-900 dark:text-white uppercase italic">Crucial Match Update</h4>
                                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Live match analysis and expert commentary on the current situation...</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {activeTab === 'table' && (
                        <div className="bg-white dark:bg-[#141b24] rounded-[3rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl mb-20">
                             <div className="p-20 text-center space-y-4">
                                <div className="text-4xl">📊</div>
                                <div className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 tracking-[0.4em]">Tournament Standings Updating...</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EnhancedMatchTabs;
