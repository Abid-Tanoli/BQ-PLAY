import React, { useEffect, useRef, useState } from "react";
import { initSocket } from "../../store/socket";

const RUN_BADGE = {
  0: { emoji: "⬛", label: "DOT", color: "bg-slate-600" },
  1: { emoji: "", label: "1", color: "bg-slate-500" },
  2: { emoji: "", label: "2", color: "bg-slate-500" },
  3: { emoji: "", label: "3", color: "bg-slate-500" },
  4: { emoji: "🏏", label: "FOUR!", color: "bg-blue-600" },
  6: { emoji: "💥", label: "SIX!", color: "bg-purple-600" },
  W: { emoji: "❌", label: "OUT!", color: "bg-red-600" },
  F: { emoji: "🧤", label: "FIELDED!", color: "bg-green-600" },
};

function getBadge(commentaryItem) {
  if (commentaryItem.isWicket) return RUN_BADGE.W;
  if (commentaryItem.runs === 6) return RUN_BADGE[6];
  if (commentaryItem.runs === 4) return RUN_BADGE[4];
  if (commentaryItem.runs >= 1) return { emoji: "", label: `${commentaryItem.runs}`, color: "bg-slate-500" };
  return RUN_BADGE[0];
}

export default function CommentaryBox({ matchId, formattedHistory }) {
  const [commentaryFeed, setCommentaryFeed] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (formattedHistory && formattedHistory.length > 0) {
      const mapped = formattedHistory.slice(-50).reverse().map(b => ({
        ...b,
        id: `${b.overNumber}.${b.ballNumber}`,
      }));
      setCommentaryFeed(mapped);
    }
  }, [formattedHistory]);

  useEffect(() => {
    const socket = initSocket();
    if (!socket) return;

    const handleCommentary = (data) => {
      setCommentaryFeed(prev => {
        const exists = prev.find(c => c.id === data.ballId);
        if (exists) return prev;
        return [{
          id: data.ballId,
          overNumber: data.over,
          ballNumber: 0,
          batsmanName: data.batsman,
          bowlerName: data.bowler,
          runs: data.runs,
          isWicket: data.isWicket,
          commentary: data.commentary,
          timestamp: new Date().toISOString(),
        }, ...prev].slice(0, 50);
      });
    };

    socket.on("commentary", handleCommentary);

    return () => {
      socket.off("commentary", handleCommentary);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [commentaryFeed]);

  return (
    <div className="rounded-3xl border border-cric-border bg-black/5 dark:bg-white/5 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">
          🎙️ COMMENTARY
        </h4>
        <span className="text-[9px] font-black text-cric-muted uppercase tracking-widest">
          Last {Math.min(commentaryFeed.length, 5)} balls
        </span>
      </div>

      <div ref={scrollRef} className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
        {commentaryFeed.length === 0 ? (
          <div className="text-center py-8 text-cric-muted text-[10px] font-black uppercase tracking-widest">
            Waiting for first ball...
          </div>
        ) : (
          commentaryFeed.slice(0, 20).map((item, idx) => {
            const badge = getBadge(item);
            return (
              <div key={item.id || idx} className="p-4 rounded-2xl bg-black/10 dark:bg-white/5 border border-cric-border/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black text-cric-text uppercase tracking-tight">
                    {item.bowlerName} to {item.batsmanName}
                  </div>
                  {item.overNumber && (
                    <span className="text-[9px] font-black text-cric-muted">Over {Math.floor(item.overNumber)}.{item.ballNumber || 0}</span>
                  )}
                </div>

                {item.commentary ? (
                  <p className="text-[11px] text-cric-text/80 leading-relaxed">
                    {item.commentary}
                  </p>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${badge.color}`} />
                    <span className="text-[11px] text-cric-muted">
                      {badge.label} {item.runs > 0 && `- ${item.runs} run${item.runs > 1 ? 's' : ''}`}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black text-white ${badge.color}`}>
                    {badge.emoji} {badge.label}
                  </span>
                  {item.fielderName && (
                    <span className="text-[9px] text-cric-muted">
                      🧤 {item.fielderName}{item.fieldedByPosition ? ` at ${item.fieldedByPosition}` : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
