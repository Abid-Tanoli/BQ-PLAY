import React from "react";

// ─── Dismissal text formatter ──────────────────────────────────────────────────
function formatDismissal(b, allPlayers) {
    if (b.isRetiredHurt) return "retired hurt";
    if (b.isRetired) return "retired";
    if (!b.isOut) return "not out";

    const bowlerName = findPlayerName(b.dismissedBy, allPlayers) || "Unknown";
    const fielderName = findPlayerName(b.fielder, allPlayers) || "";
    const type = (b.dismissalType || "").toLowerCase();

    switch (type) {
        case "bowled":
            return `b ${bowlerName}`;
        case "caught":
            return fielderName
                ? `c ${fielderName} b ${bowlerName}`
                : `c & b ${bowlerName}`;
        case "lbw":
            return `lbw b ${bowlerName}`;
        case "run out":
            return fielderName
                ? `run out (${fielderName})`
                : "run out";
        case "stumped":
            return fielderName
                ? `st †${fielderName} b ${bowlerName}`
                : `st b ${bowlerName}`;
        case "hit wicket":
            return `hit wicket b ${bowlerName}`;
        default:
            return b.dismissalType || "dismissed";
    }
}

function findPlayerName(playerId, allPlayers) {
    if (!playerId) return "";
    const id = playerId?._id || playerId;
    if (typeof playerId === "object" && playerId?.name) return playerId.name;
    const found = allPlayers.find(p => String(p._id) === String(id));
    return found?.name || "";
}

// ─── SCORECARD COMPONENT ───────────────────────────────────────────────────────
export default function Scorecard({
    curInn,
    battingTeamName,
    bowlingTeamName,
    battingXI,
    bowlingXI,
    allPlayers,
    formatOvers,
    selectedMatch,
    tossInfo,
}) {
    if (!curInn) {
        return (
            <div className="text-center py-12 text-slate-500 italic text-sm">
                No innings data available.
            </div>
        );
    }

    const batting = curInn.batting || [];
    const bowling = curInn.bowling || [];
    const extras = curInn.extras || {};
    const fow = curInn.fallOfWickets || [];

    // Calculate total extras
    const totalExtras = (extras.wides || 0) + (extras.noBalls || 0) +
        (extras.byes || 0) + (extras.legByes || 0) + (extras.penalties || 0);

    // Total overs as string
    const totalOversStr = formatOvers ? formatOvers(curInn.balls) : `${curInn.overs || 0}.${(curInn.balls || 0) % 6}`;
    const maxOvers = selectedMatch?.totalOvers || 20;

    // Run rate
    const oversDecimal = curInn.overs + ((curInn.balls % 6) / 6);
    const runRate = oversDecimal > 0 ? (curInn.runs / oversDecimal).toFixed(2) : "0.00";

    // Players who haven't batted yet
    const battedPlayerIds = batting.map(b => String(b.player?._id || b.player));
    const yetToBat = battingXI.filter(p => !battedPlayerIds.includes(String(p._id)));

    return (
        <div className="space-y-0 animate-fadeIn">
            {/* ── Section A: Innings Header ─────────────────────────────────── */}
            <div className="bg-gradient-to-r from-cric-accent/10 to-transparent rounded-2xl p-5 mb-4 border-l-4 border-cric-accent">
                <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                        <h3 className="text-xl font-black font-raj italic uppercase text-cric-text tracking-tight flex items-center gap-2">
                            <span className="text-lg">🏏</span> {battingTeamName}
                        </h3>
                        {tossInfo && (
                            <div className="text-[11px] text-slate-500 mt-1 italic">{tossInfo}</div>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black font-raj italic text-cric-text">
                            {curInn.runs}/{curInn.wickets}
                        </div>
                        <div className="text-[11px] font-bold text-slate-500">
                            ({totalOversStr}/{maxOvers} ov)
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Section B: Batting Table ──────────────────────────────────── */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-cric-border">
                            <th className="py-3 pl-4 text-[10px] font-black text-slate-500 uppercase tracking-widest w-[40%]">Batting</th>
                            <th className="py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">R</th>
                            <th className="py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">B</th>
                            <th className="py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">4s</th>
                            <th className="py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">6s</th>
                            <th className="py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pr-4">SR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {batting.map((b, idx) => {
                            const isNotOut = !b.isOut && !b.isRetiredHurt && !b.isRetired;
                            const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(2) : "0.00";
                            const dismissalText = formatDismissal(b, allPlayers);

                            return (
                                <tr key={idx}
                                    className={`border-b border-cric-border/50 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]
                                        ${b.isRetiredHurt ? 'bg-amber-500/5' : ''}
                                        ${isNotOut ? 'border-l-2 border-l-green-500' : 'border-l-2 border-l-transparent'}`}
                                >
                                    <td className="py-3 pl-4">
                                        <div className={`font-bold text-sm ${isNotOut ? 'text-cric-text' : 'text-cric-text/80'}`}>
                                            {b.player?.name || "Player"}
                                            {b.isRetiredHurt && (
                                                <span className="ml-2 text-[9px] bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded-full uppercase tracking-tighter font-black">
                                                    RH
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-slate-400 italic mt-0.5">
                                            {dismissalText}
                                        </div>
                                    </td>
                                    <td className={`py-3 text-right font-black text-sm ${isNotOut ? 'text-cric-text' : 'text-cric-text/80'}`}>
                                        {b.runs}
                                    </td>
                                    <td className="py-3 text-right text-sm text-slate-500">{b.balls}</td>
                                    <td className="py-3 text-right text-sm text-slate-500">{b.fours || 0}</td>
                                    <td className="py-3 text-right text-sm text-slate-500">{b.sixes || 0}</td>
                                    <td className="py-3 text-right text-sm font-bold text-cric-accent pr-4">{sr}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ── Section C: Extras Row ─────────────────────────────────────── */}
            <div className="flex justify-between items-center py-3 px-4 bg-black/[0.03] dark:bg-white/[0.03] border-y border-cric-border/50">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Extras</span>
                    <span className="text-[11px] text-slate-400">
                        (w {extras.wides || 0}, nb {extras.noBalls || 0}, b {extras.byes || 0}, lb {extras.legByes || 0})
                    </span>
                </div>
                <span className="font-black text-sm text-cric-text pr-4">{totalExtras}</span>
            </div>

            {/* ── Section D: Total Row ──────────────────────────────────────── */}
            <div className="flex justify-between items-center py-3 px-4 bg-cric-accent/5 border-b-2 border-cric-accent/30">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-cric-text uppercase tracking-wide">Total</span>
                    <span className="text-[11px] text-slate-500 font-bold">
                        {totalOversStr} Ov (RR: {runRate})
                    </span>
                </div>
                <span className="text-lg font-black font-raj italic text-cric-text pr-4">
                    {curInn.runs}/{curInn.wickets}
                </span>
            </div>

            {/* ── Section E: Yet to Bat ────────────────────────────────────── */}
            {yetToBat.length > 0 && (
                <div className="px-4 py-4">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                        Yet to Bat
                    </div>
                    <div className="text-sm text-cric-text font-medium leading-relaxed">
                        {yetToBat.map(p => p.name).join(", ")}
                    </div>
                </div>
            )}

            {/* ── Section F: Fall of Wickets ───────────────────────────────── */}
            {fow.length > 0 && (
                <div className="px-4 py-4 border-t border-cric-border/50">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                        Fall of Wickets
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-500">
                        {fow.map((w, i) => {
                            const pName = findPlayerName(w.player, allPlayers);
                            const overStr = w.overs != null ? w.overs : "?";
                            return (
                                <span key={i}>
                                    <span className="font-black text-cric-text">{w.wickets}-{w.runs}</span>
                                    {pName && <span className="italic"> ({pName}, {overStr} ov)</span>}
                                    {i < fow.length - 1 && <span className="text-slate-400">,</span>}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Section G: Bowling Table ─────────────────────────────────── */}
            <div className="mt-6">
                <div className="flex items-center gap-3 px-4 mb-2">
                    <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
                    <h4 className="text-base font-black font-raj italic uppercase text-blue-500 tracking-tight">
                        {bowlingTeamName} Bowling
                    </h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-cric-border">
                                <th className="py-3 pl-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Bowling</th>
                                <th className="py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">O</th>
                                <th className="py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">M</th>
                                <th className="py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">R</th>
                                <th className="py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">W</th>
                                <th className="py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Econ</th>
                                <th className="py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">0s</th>
                                <th className="py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">WD</th>
                                <th className="py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pr-4">NB</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bowling.map((b, idx) => {
                                const oversNum = b.balls ? Math.floor(b.balls / 6) + (b.balls % 6) / 10 : 0;
                                const oversDisplay = formatOvers ? formatOvers(b.balls) : `${Math.floor((b.balls || 0) / 6)}.${(b.balls || 0) % 6}`;
                                const econ = b.balls > 0 ? (b.runs / (b.balls / 6)).toFixed(2) : "0.00";

                                return (
                                    <tr key={idx}
                                        className="border-b border-cric-border/50 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                                    >
                                        <td className="py-3 pl-4 font-bold text-sm text-cric-text">
                                            {b.player?.name || "Player"}
                                        </td>
                                        <td className="py-3 text-right font-black text-sm text-cric-text">
                                            {oversDisplay}
                                        </td>
                                        <td className="py-3 text-right text-sm text-slate-500">
                                            {b.maidens || 0}
                                        </td>
                                        <td className="py-3 text-right text-sm text-slate-500">
                                            {b.runs}
                                        </td>
                                        <td className="py-3 text-right text-sm font-black">
                                            {b.wickets > 0 ? (
                                                <span className="text-blue-500 flex items-center justify-end gap-0.5">
                                                    {b.wickets}
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="opacity-60">
                                                        <path d="M7 10l5 5 5-5H7z" />
                                                    </svg>
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">0</span>
                                            )}
                                        </td>
                                        <td className="py-3 text-right text-sm text-slate-500">{econ}</td>
                                        <td className="py-3 text-right text-sm text-slate-500">{b.dotBalls || 0}</td>
                                        <td className="py-3 text-right text-sm text-slate-500">{b.wides || 0}</td>
                                        <td className="py-3 text-right text-sm text-slate-500 pr-4">{b.noBalls || 0}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Section H: Opposition Playing XI ─────────────────────────── */}
            <div className="mt-6 px-4 py-4 border-t border-cric-border/50">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                    {bowlingTeamName} Playing XI
                </div>
                <div className="text-sm text-cric-text font-medium leading-relaxed">
                    {bowlingXI.map(p => p.name).join(", ") || "Not available"}
                </div>
            </div>
        </div>
    );
}
