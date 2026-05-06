import React from 'react';

const LiveScoringPanel = ({
    battingXI,
    bowlingXI,
    strikerId,
    nonStrikerId,
    bowlerId,
    strikerStats,
    nonStrikerStats,
    activeBowlerStats,
    winProb,
    selectedMatch,
    formattedHistory,
    formatOvers,
    onRetire
}) => {
    const isStrikerOut = strikerStats?.isOut || strikerStats?.isRetiredHurt || strikerStats?.isRetired;
    const isNonStrikerOut = nonStrikerStats?.isOut || nonStrikerStats?.isRetiredHurt || nonStrikerStats?.isRetired;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Score Overlays, Batsmen, Bowlers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Batsmen Card */}
                <div className="bg-black/5 dark:bg-black/20 rounded-[2.5rem] p-8 border border-cric-border">
                    <h3 className="text-[10px] font-black text-cric-muted uppercase tracking-widest mb-6">Current Batters</h3>
                    <div className="space-y-6">
                        <div className={`flex justify-between items-center transition-opacity duration-500 ${isStrikerOut ? 'opacity-30 grayscale' : ''}`}>
                            <div className="flex-1">
                                <div className={`text-xl font-black text-cric-text flex items-center gap-2 ${isStrikerOut ? 'line-through' : ''}`}>
                                    {battingXI.find(p => String(p._id) === String(strikerId))?.name || 'Waiting...'}
                                    {!isStrikerOut && <span className="text-cric-accent">*</span>}
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Striker</div>
                                    {!isStrikerOut && strikerId && (
                                        <button 
                                            onClick={() => onRetire(strikerId, 'retired_hurt')}
                                            className="text-[9px] font-black text-amber-500 hover:text-amber-600 transition-colors uppercase tracking-widest border border-amber-500/20 px-2 py-0.5 rounded-full"
                                        >
                                            Retired Hurt
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-cric-text">{Math.max(0, strikerStats?.runs || 0)} ({Math.max(0, strikerStats?.balls || 0)})</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">4s: {strikerStats?.fours || 0} | 6s: {strikerStats?.sixes || 0}</div>
                            </div>
                        </div>
                        <div className="h-px bg-cric-border" />
                        <div className={`flex justify-between items-center transition-opacity duration-500 ${isNonStrikerOut ? 'opacity-30 grayscale' : 'opacity-60'}`}>
                            <div className="flex-1">
                                <div className={`text-xl font-black text-cric-text ${isNonStrikerOut ? 'line-through' : ''}`}>
                                    {battingXI.find(p => String(p._id) === String(nonStrikerId))?.name || 'Waiting...'}
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Non-Striker</div>
                                    {!isNonStrikerOut && nonStrikerId && (
                                        <button 
                                            onClick={() => onRetire(nonStrikerId, 'retired_hurt')}
                                            className="text-[9px] font-black text-amber-500 hover:text-amber-600 transition-colors uppercase tracking-widest border border-amber-500/20 px-2 py-0.5 rounded-full"
                                        >
                                            Retired Hurt
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-cric-text">{Math.max(0, nonStrikerStats?.runs || 0)} ({Math.max(0, nonStrikerStats?.balls || 0)})</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bowler Card */}
                <div className="bg-black/5 dark:bg-black/20 rounded-[2.5rem] p-8 border border-cric-border">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Active Bowler</h3>
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="text-xl font-black text-blue-500 dark:text-blue-400">
                                {bowlingXI.find(p => String(p._id) === String(bowlerId))?.name || 'Waiting...'}
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Currently Bowling</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-cric-text">
                                {activeBowlerStats?.wickets || 0}/{activeBowlerStats?.runs || 0}
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                                OVERS: {formatOvers(activeBowlerStats?.balls || 0)}
                            </div>
                        </div>
                    </div>

                    {/* Win Probability Heuristic Visual */}
                    <div className="mt-8 pt-8 border-t border-cric-border">
                        <div className="flex justify-between text-[10px] font-black uppercase mb-2 text-cric-text">
                            <span>{selectedMatch.teams[0].name} {Math.round(winProb.team1)}%</span>
                            <span>{selectedMatch.teams[1].name} {Math.round(winProb.team2)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/10 dark:bg-white/5 rounded-full overflow-hidden flex">
                            <div className="h-full bg-cric-accent" style={{ width: `${winProb.team1}%` }} />
                            <div className="h-full bg-blue-500" style={{ width: `${winProb.team2}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Balls */}
            <div className="bg-black/5 dark:bg-black/20 rounded-[2.5rem] p-8 border border-cric-border overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recent Balls</h3>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                            <span className="text-[8px] font-black text-slate-500 uppercase">Boundary</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            <span className="text-[8px] font-black text-slate-500 uppercase">Wicket</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                    {(() => {
                        const getOrdinal = (n) => {
                            const s = ["th", "st", "nd", "rd"];
                            const v = n % 100;
                            return (s[(v - 20) % 10] || s[v] || s[0]);
                        };

                        const history = [...formattedHistory].slice(-24);
                        const elements = [];
                        let currentOver = -1;

                        history.forEach((ball, i) => {
                            if (ball.overNumber !== currentOver) {
                                if (currentOver !== -1) {
                                    elements.push({ type: 'over', label: `${currentOver + 1}${getOrdinal(currentOver + 1)}` });
                                }
                                currentOver = ball.overNumber;
                            }
                            elements.push({ type: 'ball', ...ball });
                        });
                        
                        if (currentOver !== -1) {
                            elements.push({ type: 'over', label: `${currentOver + 1}${getOrdinal(currentOver + 1)}` });
                        }

                        return elements.reverse().map((el, idx) => (
                            el.type === 'over' ? (
                                <div key={`ov-${idx}`} className="flex flex-col items-center justify-center min-w-[60px] h-12 bg-black/20 rounded-2xl border border-white/5 shrink-0 mx-2">
                                    <span className="text-[10px] font-black text-cric-accent uppercase tracking-tighter">{el.label}</span>
                                    <span className="text-[7px] font-bold text-slate-500 uppercase">Over</span>
                                </div>
                            ) : (
                                <div key={`ball-${idx}`} className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-sm border-2 shrink-0 transition-all hover:scale-110 cursor-default ${el.isWicket ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/20 animate-pulse' : el.runs === 4 ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20' : el.runs === 6 ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/20' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                                    {el.isWicket ? 'W' : (el.runs === 0 && !el.isWide && !el.isNoBall) ? '•' : el.notation || el.runs}
                                </div>
                            )
                        ));
                    })()}
                </div>
            </div>

            {/* Last Ball Analysis */}
            <div className="bg-black/5 rounded-[2.5rem] p-8 border border-black/5">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Last Ball Analysis</h3>
                {formattedHistory.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="text-xl font-black text-cric-accent whitespace-nowrap">{formatOvers(formattedHistory[formattedHistory.length - 1].ballNumber)}</div>
                            <div className="space-y-2">
                                <div className="text-lg font-bold text-slate-900 leading-tight mb-3">
                                    {formattedHistory[formattedHistory.length - 1].commentary || `${formattedHistory[formattedHistory.length - 1].bowlerName} to ${formattedHistory[formattedHistory.length - 1].batsmanName}, ${formattedHistory[formattedHistory.length - 1].notation || 'no run'}`}
                                </div>
                                {formattedHistory[formattedHistory.length - 1].vividCommentary && formattedHistory[formattedHistory.length - 1].vividCommentary !== formattedHistory[formattedHistory.length - 1].commentary && (
                                    <div className="bg-black/2 p-4 rounded-2xl border border-black/5 space-y-2">
                                        <div className="text-cric-accent text-[9px] font-black uppercase tracking-widest opacity-80">AI Detailed Analysis</div>
                                        <p className="text-slate-600 text-sm italic font-medium leading-relaxed">
                                            {formattedHistory[formattedHistory.length - 1].vividCommentary}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-slate-500 italic text-sm">Waiting for the first ball to be bowled...</div>
                )}
            </div>
        </div>
    );
};

export default LiveScoringPanel;
