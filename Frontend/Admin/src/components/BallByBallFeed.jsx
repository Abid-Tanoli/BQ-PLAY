import React, { useRef, useEffect } from "react";

export default function BallByBallFeed({ history }) {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [history]);

    if (!history || history.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-50 dark:border-slate-800 flex flex-col h-[480px] overflow-hidden">
            <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Live Feed
                </h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-100 dark:bg-red-950/30 text-red-600 rounded-full">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase">Live</span>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
            >
                {history.map((ball, idx) => {
                    const isBoundary = ball.runs === 4 || ball.runs === 6;
                    const isWicket = ball.isWicket;
                    
                    const getBallColor = () => {
                        if (isWicket) return "bg-red-500 shadow-red-500/30 text-white";
                        if (ball.runs === 6) return "bg-purple-600 shadow-purple-500/30 text-white font-bold";
                        if (ball.runs === 4) return "bg-green-600 shadow-green-500/30 text-white font-bold";
                        if (ball.isWide || ball.isNoBall) return "bg-orange-500 text-white font-bold";
                        return "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
                    }

                    return (
                        <div
                            key={idx}
                            className={`flex items-start gap-4 p-3 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800 group ${isWicket ? "bg-red-50/30 dark:bg-red-950/10" : ""}`}
                        >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0 shadow-lg group-hover:scale-110 transition-transform ${getBallColor()}`}>
                                {isWicket ? "W" : ball.notation || ball.runs}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tighter flex items-center gap-2">
                                    <span className="text-slate-400 tabular-nums">
                                        {Math.floor((ball.ballNumber - 1) / 6)}.{((ball.ballNumber - 1) % 6) + 1}
                                    </span>
                                    <span className="truncate">{ball.bowlerName} to {ball.batsmanName}</span>
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic mt-0.5 leading-relaxed">
                                    {ball.commentary || "Defensive stroke, no run."}
                                </p>
                            </div>

                            <div className="text-right shrink-0">
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                    isWicket ? "bg-red-100 text-red-700" :
                                    ball.runs === 6 ? "bg-purple-100 text-purple-700" :
                                    ball.runs === 4 ? "bg-green-100 text-green-700" :
                                    "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                }`}>
                                    {isWicket ? ball.wicketType : `${ball.runs} RUN${ball.runs !== 1 ? 'S' : ''}`}
                                </span>
                            </div>
                        </div>
                    );
                }).reverse()}
            </div>
        </div>
    );
}
