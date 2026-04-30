import React, { useRef, useEffect, useState } from "react";

// Ball notation badge
function BallBadge({ ball, small = false }) {
    const isWicket = ball.isWicket;
    const notation = ball.notation || (ball.isWicket ? "W" : ball.runs === 0 ? "•" : String(ball.runs));
    const isFour = ball.runs === 4 && !ball.isWide && !ball.isNoBall && !ball.isWicket;
    const isSix = ball.runs === 6 && !ball.isWide && !ball.isNoBall && !ball.isWicket;
    const isWide = ball.isWide;
    const isNoBall = ball.isNoBall;

    const base = small ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
    const color = isWicket
        ? "bg-red-600 text-white shadow-red-500/40"
        : isSix ? "bg-purple-600 text-white shadow-purple-500/40"
        : isFour ? "bg-blue-600 text-white shadow-blue-500/40"
        : (isWide || isNoBall) ? "bg-amber-500 text-white shadow-amber-500/40"
        : "bg-white/10 text-slate-300 shadow-white/5";

    return (
        <div className={`${base} ${color} rounded-lg flex items-center justify-center font-black shrink-0 shadow`}>
            {notation}
        </div>
    );
}

// Format over.ball string (e.g. ball 9 → "1.3")
function fmtOver(totalBalls) {
    const over = Math.floor(totalBalls / 6);
    const ball = totalBalls % 6;
    return `${over}.${ball}`;
}

// Header for one ball
function BallHeader({ ball, overNum, ballNum, onEdit }) {
    const notation = ball.notation || (ball.isWicket ? "W" : ball.runs === 0 ? "•" : String(ball.runs));
    const typeLabel = ball.isWicket
        ? ball.wicketType?.toUpperCase() || "WICKET"
        : ball.isWide ? `${ball.runs + 1} WIDE`
        : ball.isNoBall ? `NB+${ball.runs}`
        : ball.isBye ? `${ball.runs} BYE`
        : ball.isLegBye ? `${ball.runs} LEG BYE`
        : ball.runs === 4 ? "FOUR"
        : ball.runs === 6 ? "SIX"
        : ball.runs === 0 ? "DOT"
        : `${ball.runs} RUN${ball.runs !== 1 ? "S" : ""}`;

    return (
        <div className="flex items-center gap-3 group">
            <BallBadge ball={ball} />
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-slate-500 font-black text-[11px] tabular-nums shrink-0">
                        {overNum}.{ballNum}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        ball.isWicket ? "bg-red-500/20 text-red-400" :
                        ball.runs === 6 ? "bg-purple-500/20 text-purple-400" :
                        ball.runs === 4 ? "bg-blue-500/20 text-blue-400" :
                        (ball.isWide || ball.isNoBall) ? "bg-amber-500/20 text-amber-400" :
                        "bg-white/5 text-slate-500"
                    }`}>
                        {typeLabel}
                    </span>
                    <span className="text-white font-bold text-sm truncate">
                        {ball.bowlerName || "Bowler"}{" "}
                        <span className="text-slate-500 font-normal">to</span>{" "}
                        {ball.batsmanName || "Batsman"}
                        {ball.isWicket && (
                            <span className="text-red-400 font-black"> — OUT!</span>
                        )}
                    </span>
                </div>
            </div>
            {onEdit && (
                <button
                    onClick={() => onEdit(ball)}
                    className="opacity-0 group-hover:opacity-100 text-[9px] font-black text-slate-500 hover:text-[#ff6b35] border border-white/5 hover:border-[#ff6b35]/50 px-3 py-1 rounded-full uppercase tracking-widest transition-all shrink-0"
                >
                    Edit
                </button>
            )}
        </div>
    );
}

// Commentary line below header
function CommentaryLine({ text, loading }) {
    if (loading) {
        return (
            <div className="ml-12 flex gap-1 items-center mt-1">
                {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
                <span className="text-slate-600 text-[10px] italic ml-1">AI commentary...</span>
            </div>
        );
    }
    if (!text) return null;
    return (
        <p className="ml-12 text-[11px] text-slate-400 italic leading-relaxed mt-0.5">
            {text}
        </p>
    );
}

// Over block - ESPNcricinfo style
function OverBlock({ over, balls, onEdit, showReadMore, onReadMore, allPlayers }) {
    const overRuns = over.runsScored ?? balls.reduce((s, b) => s + (b.runs || 0) + (b.isWide ? 1 : 0) + (b.isNoBall ? 1 : 0), 0);
    const overWickets = over.wickets ?? balls.filter(b => b.isWicket).length;
    const bowlerName = over.bowlerName || balls[0]?.bowlerName || "Bowler";

    // Sort balls newest first (highest ballNumber first)
    const sortedBalls = [...balls].reverse();

    return (
        <div className="border-l-2 border-white/5 pl-4">
            {/* Over Header Summary */}
            <div className="bg-black/30 rounded-2xl p-4 mb-3 border border-white/5">
                <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                        <span className="text-[#ff6b35] font-black text-base">Over {over.overNumber + 1}</span>
                        <span className="text-slate-400 text-[11px] ml-3">
                            {overRuns} run{overRuns !== 1 ? "s" : ""}
                            {overWickets > 0 && <span className="text-red-400"> | {overWickets} wkt{overWickets !== 1 ? "s" : ""}</span>}
                        </span>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        {bowlerName}
                    </div>
                </div>
                {over.summary && (
                    <p className="text-slate-400 text-[11px] italic mt-2 leading-relaxed border-t border-white/5 pt-2">
                        {over.summary}
                    </p>
                )}
                {/* Mini wagon-wheel for this over */}
                <div className="flex gap-1.5 mt-2 flex-wrap">
                    {[...balls].map((b, i) => (
                        <BallBadge key={i} ball={b} small />
                    ))}
                </div>
            </div>

            {/* Ball-by-ball (newest to oldest) */}
            <div className="space-y-3">
                {sortedBalls.map((ball, idx) => (
                    <div key={idx} className={`p-3 rounded-xl transition-all ${ball.isWicket ? "bg-red-950/20 border border-red-500/10" : "hover:bg-white/2"}`}>
                        <BallHeader
                            ball={ball}
                            overNum={over.overNumber}
                            ballNum={ball.ballNumber}
                            onEdit={onEdit}
                        />
                        <CommentaryLine text={ball.commentary} />
                    </div>
                ))}
            </div>

            {showReadMore && (
                <button
                    onClick={onReadMore}
                    className="mt-3 text-[10px] font-black text-[#ff6b35] uppercase tracking-widest hover:underline"
                >
                    Read full commentary →
                </button>
            )}
        </div>
    );
}

// Edit Ball Modal
function EditBallModal({ ball, overNum, ballNum, onSave, onClose }) {
    const [runs, setRuns] = useState(ball.runs ?? 0);
    const [extra, setExtra] = useState(
        ball.isWide ? "WIDE" : ball.isNoBall ? "NO BALL" : ball.isBye ? "BYE" : ball.isLegBye ? "LEG BYE" : ""
    );
    const [wicket, setWicket] = useState(ball.isWicket ? (ball.wicketType || "caught") : "");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await onSave({
            overNumber: overNum,
            ballNumber: ballNum,
            runs,
            isWide: extra === "WIDE",
            isNoBall: extra === "NO BALL",
            isBye: extra === "BYE",
            isLegBye: extra === "LEG BYE",
            isWicket: !!wicket,
            wicketType: wicket,
        });
        setSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#141b24] rounded-[2.5rem] border border-white/10 p-8 w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black font-raj italic uppercase text-white">
                        Edit Ball {overNum}.{ballNum}
                    </h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-500 transition-all">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Runs */}
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">Runs</label>
                        <div className="grid grid-cols-7 gap-2">
                            {[0, 1, 2, 3, 4, 5, 6].map(r => (
                                <button key={r} onClick={() => setRuns(r)}
                                    className={`h-12 rounded-xl font-black text-lg transition-all ${runs === r ? "bg-[#ff6b35] text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Extras */}
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">Extra</label>
                        <div className="grid grid-cols-4 gap-2">
                            {["", "WIDE", "NO BALL", "BYE", "LEG BYE"].map(e => (
                                <button key={e} onClick={() => setExtra(extra === e ? "" : e)}
                                    className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${extra === e ? "bg-blue-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                                    {e || "None"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Wicket */}
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 block">Wicket</label>
                        <div className="grid grid-cols-3 gap-2">
                            {["", "bowled", "caught", "lbw", "run out", "stumped", "hit wicket"].map(w => (
                                <button key={w} onClick={() => setWicket(wicket === w ? "" : w)}
                                    className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${wicket === w ? "bg-red-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                                    {w || "No Wicket"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-5 rounded-2xl bg-[#ff6b35] text-white font-black font-raj text-xl italic uppercase shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function BallByBallFeed({ history = [], overs = [], onEdit, onSwitchTab, compact = false }) {
    const scrollRef = useRef(null);
    const [editingBall, setEditingBall] = useState(null);

    useEffect(() => {
        if (scrollRef.current && !compact) {
            scrollRef.current.scrollTop = 0;
        }
    }, [history]);

    if (!history || history.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 italic text-sm">
                Waiting for the first ball...
            </div>
        );
    }

    // Group history into overs
    const groupedOvers = {};
    history.forEach(ball => {
        const overNum = ball.overNumber ?? Math.floor((ball.ballNumber - 1) / 6);
        if (!groupedOvers[overNum]) groupedOvers[overNum] = { overNumber: overNum, balls: [] };
        groupedOvers[overNum].balls.push(ball);
    });

    // Match over summaries from overs prop
    overs.forEach(ov => {
        if (groupedOvers[ov.overNumber]) {
            groupedOvers[ov.overNumber].summary = ov.summary;
            groupedOvers[ov.overNumber].runsScored = ov.runsScored;
            groupedOvers[ov.overNumber].wickets = ov.wickets;
            groupedOvers[ov.overNumber].bowlerName = ov.bowlerName;
        }
    });

    // Sort overs newest first
    const sortedOvers = Object.values(groupedOvers).sort((a, b) => b.overNumber - a.overNumber);

    const handleEdit = (ball) => {
        setEditingBall(ball);
    };

    return (
        <div ref={scrollRef} className="space-y-8">
            {sortedOvers.map((over, idx) => (
                <OverBlock
                    key={over.overNumber}
                    over={over}
                    balls={over.balls}
                    onEdit={onEdit ? handleEdit : null}
                    showReadMore={!compact && idx === 2}
                    onReadMore={() => onSwitchTab && onSwitchTab("commentary")}
                />
            ))}

            {editingBall && onEdit && (
                <EditBallModal
                    ball={editingBall}
                    overNum={editingBall.overNumber ?? Math.floor((editingBall.ballNumber - 1) / 6)}
                    ballNum={editingBall.ballNumber}
                    onSave={async (data) => {
                        await onEdit({ ...editingBall, ...data });
                    }}
                    onClose={() => setEditingBall(null)}
                />
            )}
        </div>
    );
}
