import React from 'react';

const number = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const ballRuns = (ball) => number(ball?.runs);

const ballLabel = (ball) => {
    if (ball?.isWicket) return "W";
    if (ball?.isWide) return "Wd";
    if (ball?.isNoBall) return "Nb";
    if (ball?.isLegBye) return "LB";
    if (ball?.isBye) return "B";
    if (ballRuns(ball) === 0) return "\u2022";
    return String(ballRuns(ball));
};

const ballClass = (ball) => {
    if (ball?.isWicket) return "bg-red-600 text-white";
    if (ball?.isWide || ball?.isNoBall || ball?.isLegBye || ball?.isBye) return "bg-orange-100 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:ring-orange-800";
    if (ballRuns(ball) === 4) return "bg-blue-600 text-white";
    if (ballRuns(ball) === 6) return "bg-purple-600 text-white";
    if (ballRuns(ball) === 0) return "bg-cric-border text-cric-text";
    return "bg-cric-text text-cric-card";
};

const overRunsAndWickets = (over) => {
    const balls = over?.balls || [];
    const fallbackRuns = balls.reduce((sum, ball) => sum + ballRuns(ball) + (ball.isWide || ball.isNoBall ? 1 : 0), 0);
    return {
        runs: number(over?.runsScored, fallbackRuns),
        wickets: number(over?.wickets, balls.filter(ball => ball.isWicket).length)
    };
};

const groupHistoryByOver = (history = []) => {
    const overMap = new Map();
    history.forEach(ball => {
        const overNumber = ball.overNumber;
        if (overNumber == null) return;
        if (!overMap.has(overNumber)) {
            overMap.set(overNumber, { overNumber, balls: [] });
        }
        overMap.get(overNumber).balls.push(ball);
    });
    return Array.from(overMap.values());
};

const deliveryOverText = (ball) => {
    if (!ball) return "0.0";
    return `${number(ball.overNumber)}.${ball.displayBallNumber || ball.ballNumber || 1}`;
};

function RecentBallsStrip({ history = [] }) {
    const safeOvers = groupHistoryByOver(history);

    if (safeOvers.length === 0) {
        return <p className="text-xs text-cric-muted">No balls recorded yet.</p>;
    }

    return (
        <div className="space-y-3">
            <div className="flex gap-2 text-[8px] font-black uppercase text-slate-500">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-600" /> Boundary</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-600" /> Wicket</span>
            </div>
            <div className="-mx-2 overflow-x-auto px-2 pb-2 no-scrollbar">
                <div className="flex gap-3 min-w-fit">
                    {safeOvers.slice().reverse().map(over => {
                        const summary = overRunsAndWickets(over);
                        return (
                            <div key={over.overNumber} className="flex items-center gap-3 rounded-xl bg-cric-bg p-3 ring-1 ring-cric-border shrink-0">
                                <div className="shrink-0 text-[10px] font-black uppercase tracking-widest text-cric-muted whitespace-nowrap">
                                    Over {number(over.overNumber) + 1}: {summary.runs} run{summary.runs === 1 ? "" : "s"}{summary.wickets > 0 ? `, ${summary.wickets} wkt` : ""}
                                </div>
                                <div className="flex gap-1.5 flex-nowrap">
                                    {(over.balls || []).map((ball, index) => (
                                        <span key={ball._id || `${over.overNumber}-${index}`} title={`${number(over.overNumber)}.${ball.displayBallNumber || ball.ballNumber}`} className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-black shrink-0 ${ballClass(ball)}`}>
                                            {ballLabel(ball)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

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
    formattedHistory = [],
    formatOvers,
    onRetire,
}) => {
    const isStrikerOut = strikerStats?.isOut || strikerStats?.isRetiredHurt || strikerStats?.isRetired;
    const isNonStrikerOut = nonStrikerStats?.isOut || nonStrikerStats?.isRetiredHurt || nonStrikerStats?.isRetired;
    const lastBall = formattedHistory[formattedHistory.length - 1];

    return (
        <div className="space-y-8 animate-fadeIn">
            {selectedMatch?.result?.resultType === 'super_over' && (
                <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 p-4 rounded-3xl">
                    <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white text-xl">SO</div>
                    <div>
                        <h3 className="text-sm font-black text-amber-600 uppercase tracking-tighter">
                            Super Over {Math.floor((selectedMatch.innings.length - 2) / 2) + 1}
                        </h3>
                        <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest">
                            {selectedMatch.innings.length % 2 === 0 ? '1st Innings' : '2nd Innings'} - Target: {selectedMatch.innings[selectedMatch.currentInnings]?.target || 'N/A'}
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            onClick={() => onRetire?.(strikerId, 'retired_hurt')}
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
                                            onClick={() => onRetire?.(nonStrikerId, 'retired_hurt')}
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

                    <div className="mt-8 pt-8 border-t border-cric-border">
                        <div className="flex justify-between text-[10px] font-black uppercase mb-2 text-cric-text">
                            <span>{selectedMatch?.teams?.[0]?.name || 'Team 1'} {Math.round(winProb.team1)}%</span>
                            <span>{selectedMatch?.teams?.[1]?.name || 'Team 2'} {Math.round(winProb.team2)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/10 dark:bg-white/5 rounded-full overflow-hidden flex">
                            <div className="h-full bg-cric-accent" style={{ width: `${winProb.team1}%` }} />
                            <div className="h-full bg-blue-500" style={{ width: `${winProb.team2}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-black/5 dark:bg-black/20 rounded-[2.5rem] p-8 border border-cric-border overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recent Balls</h3>
                </div>
                <RecentBallsStrip history={formattedHistory} />
            </div>

            <div className="bg-black/5 rounded-[2.5rem] p-8 border border-black/5">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Last Ball Analysis</h3>
                {lastBall ? (
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="text-xl font-black text-cric-accent whitespace-nowrap">{deliveryOverText(lastBall)}</div>
                            <div className="space-y-2">
                                <div className="text-lg font-bold text-slate-900 leading-tight mb-3">
                                    {(() => {
                                        const runs = lastBall.runs || 0;
                                        const getRunLabel = () => {
                                            if (lastBall.isWicket) return "OUT!";
                                            if (lastBall.isWide) return "wide";
                                            if (lastBall.isNoBall) return "no ball";
                                            if (lastBall.isLegBye) return "leg bye";
                                            if (lastBall.isBye) return "bye";
                                            if (runs === 0) return "no run";
                                            if (runs === 1) return "1 run";
                                            if (runs === 2) return "2 runs";
                                            if (runs === 3) return "3 runs";
                                            if (runs === 4) return "FOUR";
                                            if (runs === 6) return "SIX";
                                            return `${runs} runs`;
                                        };
                                        return `${lastBall.bowlerName || 'Bowler'} to ${lastBall.batsmanName || 'Batsman'}, ${getRunLabel()}`;
                                    })()}
                                </div>
                                {(lastBall.vividCommentary || lastBall.commentary) && (
                                    <div className="bg-black/2 p-4 rounded-2xl border border-black/5 space-y-2">
                                        <p className="text-slate-600 text-sm italic font-medium leading-relaxed">
                                            {lastBall.vividCommentary || lastBall.commentary}
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
