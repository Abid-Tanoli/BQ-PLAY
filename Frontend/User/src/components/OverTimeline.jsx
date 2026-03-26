import React from 'react';

export default function OverTimeline({ innings }) {
  if (!innings || !innings.oversHistory) return null;

  const allOvers = [...innings.oversHistory].reverse();

  const getBallStyle = (ball) => {
    if (ball.isWicket) return "bg-red-500 text-white border-red-600";
    if (ball.runs === 6) return "bg-blue-600 text-white border-blue-700";
    if (ball.runs === 4) return "bg-green-600 text-white border-green-700";
    if (ball.isWide || ball.isNoBall) return "bg-orange-500 text-white border-orange-600 text-[10px]";
    if (ball.runs === 0) return "bg-slate-100 text-slate-400 border-slate-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getBallText = (ball) => {
    if (ball.notation) return ball.notation;
    if (ball.isWicket) return "W";
    if (ball.isWide) return `${1 + ball.runs}w`;
    if (ball.isNoBall) return ball.runs > 0 ? `NB+${ball.runs}` : "NB";
    if (ball.isLegBye) return `${ball.runs}lb`;
    if (ball.isBye) return `${ball.runs}b`;
    return ball.runs === 0 ? "•" : ball.runs;
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-[2rem] border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-2">
        {allOvers.map((over, oIdx) => (
          <div key={oIdx} className="flex items-center gap-3 shrink-0">
             {/* Over Summary Badge */}
             <div className="flex flex-col items-center justify-center h-12 px-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                   {over.overNumber + 1}{["st", "nd", "rd"][(over.overNumber + 1) % 10 - 1] || "th"}
                </span>
                <span className="text-xs font-black text-slate-900 uppercase">
                   {over.runsScored} RUNS
                </span>
             </div>

             {/* Balls */}
             <div className="flex items-center gap-2">
                {over.balls.map((ball, bIdx) => (
                   <div 
                     key={bIdx}
                     className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border shadow-sm transition-transform active:scale-90 ${getBallStyle(ball)}`}
                   >
                      {getBallText(ball)}
                   </div>
                ))}
             </div>

             {/* Divider */}
             {oIdx < allOvers.length - 1 && (
                <div className="h-8 w-px bg-slate-200 mx-2" />
             )}
          </div>
        ))}

        <button className="h-12 px-6 bg-[#031d44] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/20 flex items-center gap-2 group whitespace-nowrap ml-4">
           See all
           <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 5l7 7-7 7M5 12h14"/></svg>
        </button>
      </div>
    </div>
  );
}
