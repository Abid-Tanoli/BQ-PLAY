import { useEffect, useRef, useState } from "react";
import { initSocket } from "../services/socket";

const BADGE = {
  6: { emoji: "💥", label: "SIX!", class: "bg-purple-600" },
  4: { emoji: "🏏", label: "FOUR!", class: "bg-blue-600" },
  0: { emoji: "⬛", label: "DOT", class: "bg-slate-600" },
  W: { emoji: "❌", label: "OUT!", class: "bg-red-600" },
  F: { emoji: "🧤", label: "FIELDED!", class: "bg-green-600" },
};

function getBadge(runs, isWicket) {
  if (isWicket) return BADGE.W;
  return BADGE[runs] || { emoji: "", label: `${runs}`, class: "bg-slate-500" };
}

export default function LiveCommentary({ matchId, match }) {
  const [feed, setFeed] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!match || !match.innings) return;
    const allBalls = [];
    match.innings.forEach(innings => {
      (innings.oversHistory || []).forEach(over => {
        (over.balls || []).forEach(ball => {
          allBalls.push({
            id: `${over.overNumber}.${ball.ballNumber || ball.displayBallNumber || 1}`,
            over: `${over.overNumber}.${ball.displayBallNumber || ball.ballNumber || 1}`,
            bowlerName: ball.bowlerName || ball.bowler?.name || "",
            batsmanName: ball.batsmanName || ball.batsmanOnStrike?.name || "",
            runs: ball.runs || 0,
            isWicket: ball.isWicket,
            isWide: ball.isWide,
            isNoBall: ball.isNoBall,
            commentary: ball.vividCommentary || ball.commentary || "",
            fielderName: ball.fielderName || "",
            fieldedByPosition: ball.fieldedByPosition || "",
            timestamp: ball.timestamp || ball.createdAt || new Date().toISOString(),
          });
        });
      });
    });
    allBalls.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setFeed(allBalls);
  }, [match]);

  useEffect(() => {
    const socket = initSocket();
    if (!socket) return;

    const handleCommentary = (data) => {
      setFeed(prev => {
        const exists = prev.some(c => c.id === data.ballId);
        if (exists) return prev;
        return [{
          id: data.ballId,
          over: data.over || "",
          bowlerName: data.bowler || "",
          batsmanName: data.batsman || "",
          runs: data.runs || 0,
          isWicket: data.isWicket,
          isWide: false,
          isNoBall: false,
          commentary: data.commentary || "",
          fielderName: data.fieldedByName || "",
          fieldedByPosition: data.fieldedByPosition || "",
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
  }, [feed.length]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-[#031d44] px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">🎙️</span>
        <div>
          <h3 className="text-white font-black uppercase tracking-wider text-sm">LIVE COMMENTARY</h3>
          <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">
            {feed.length} balls recorded
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {feed.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🎙️</div>
            <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Waiting for first ball...</p>
          </div>
        ) : (
          feed.slice(0, 30).map((item, idx) => {
            const badge = getBadge(item.runs, item.isWicket);
            return (
              <div
                key={item.id || idx}
                className={`p-4 rounded-xl border transition-all ${
                  item.isWicket
                    ? "bg-red-50 border-red-200"
                    : item.runs === 6
                      ? "bg-purple-50 border-purple-200"
                      : item.runs === 4
                        ? "bg-blue-50 border-blue-200"
                        : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                    {item.over}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black text-white ${badge.class}`}>
                    {badge.emoji} {badge.label}
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-800 mb-1">
                  {item.bowlerName} to {item.batsmanName}
                </p>

                {item.commentary ? (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.commentary}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    {item.isWicket ? "WICKET!" : `${item.runs} run${item.runs !== 1 ? "s" : ""}`}
                  </p>
                )}

                {item.fielderName && (
                  <p className="text-xs text-slate-500 mt-1">
                    🧤 {item.fielderName}{item.fieldedByPosition ? ` at ${item.fieldedByPosition}` : ""} gives chase
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
