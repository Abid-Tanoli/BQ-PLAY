import { useEffect, useState } from "react";
import { api } from "../services/api";
import { initSocket } from "../services/socket";

const BADGE = {
  6: { emoji: "💥", label: "SIX!", class: "bg-purple-600" },
  4: { emoji: "🏏", label: "FOUR!", class: "bg-blue-600" },
  0: { emoji: "⬛", label: "DOT", class: "bg-slate-600" },
  W: { emoji: "❌", label: "OUT!", class: "bg-red-600" },
};

function getBadge(runs, isWicket) {
  if (isWicket) return BADGE.W;
  return BADGE[runs] || { emoji: "", label: `${runs}`, class: "bg-slate-500" };
}

export default function SeriesLiveCommentary({ seriesId }) {
  const [feed, setFeed] = useState([]);
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!seriesId) return;

    api.get(`/matches?seriesId=${seriesId}&status=live&limit=1`)
      .then(async res => {
        const matches = res.data?.matches || res.data || [];
        const liveMatch = Array.isArray(matches) ? matches.find(m => m.status === "live") : null;
        if (liveMatch) {
          setActiveMatchId(liveMatch._id);
          setIsLive(true);
          const matchRes = await api.get(`/matches/${liveMatch._id}`);
          const match = matchRes.data;
          const allBalls = [];
          (match.innings || []).forEach(innings => {
            (innings.oversHistory || []).forEach(over => {
              (over.balls || []).forEach(ball => {
                allBalls.push({
                  id: `${over.overNumber}.${ball.ballNumber || 1}`,
                  over: `${over.overNumber}.${ball.displayBallNumber || ball.ballNumber || 1}`,
                  bowlerName: ball.bowlerName || ball.bowler?.name || "",
                  batsmanName: ball.batsmanName || ball.batsmanOnStrike?.name || "",
                  runs: ball.runs || 0,
                  isWicket: ball.isWicket,
                  commentary: ball.vividCommentary || ball.commentary || "",
                  timestamp: ball.timestamp || ball.createdAt || new Date().toISOString(),
                  matchName: match.name || match.title || `Match ${match._id}`,
                });
              });
            });
          });
          allBalls.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setFeed(allBalls.slice(0, 10));
        } else {
          setIsLive(false);
        }
      })
      .catch(() => setIsLive(false));
  }, [seriesId]);

  useEffect(() => {
    if (!activeMatchId) return;
    const socket = initSocket();
    if (!socket) return;

    socket.emit("join-match", activeMatchId);

    const handleCommentary = (data) => {
      if (data.matchId !== activeMatchId) return;
      setFeed(prev => [{
        id: data.ballId,
        over: data.over || "",
        bowlerName: data.bowler || "",
        batsmanName: data.batsman || "",
        runs: data.runs || 0,
        isWicket: data.isWicket,
        commentary: data.commentary || "",
        timestamp: new Date().toISOString(),
      }, ...prev].slice(0, 10));
    };

    socket.on("commentary", handleCommentary);

    return () => {
      socket.off("commentary", handleCommentary);
    };
  }, [activeMatchId]);

  if (!isLive) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
        <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Match not live</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-[#031d44] px-6 py-4 flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
        </span>
        <h3 className="text-white font-black uppercase tracking-wider text-sm">LIVE COMMENTARY</h3>
      </div>

      <div className="p-4 space-y-3">
        {feed.length === 0 ? (
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider text-center py-4">
            Waiting for first ball...
          </p>
        ) : (
          feed.map((item, idx) => {
            const badge = getBadge(item.runs, item.isWicket);
            return (
              <div
                key={item.id || idx}
                className={`p-3 rounded-lg border text-sm ${
                  item.isWicket ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {item.over}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black text-white ${badge.class}`}>
                    {badge.emoji} {badge.label}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-700">
                  {item.bowlerName} to {item.batsmanName}
                </p>
                {item.commentary && (
                  <p className="text-xs text-slate-500 mt-0.5">{item.commentary}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
