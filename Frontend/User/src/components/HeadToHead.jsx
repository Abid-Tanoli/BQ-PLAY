import { useEffect, useState } from "react";
import { api } from "../services/api";

const HeadToHead = ({ batsmanId, bowlerId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!batsmanId || !bowlerId) {
      setLoading(false);
      return;
    }
    let mounted = true;
    const fetchData = async () => {
      try {
        const res = await api.get(`/players/head-to-head/${batsmanId}/${bowlerId}`);
        if (mounted) setData(res.data);
      } catch {
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [batsmanId, bowlerId]);

  if (loading) {
    return (
      <div className="bg-cric-card rounded-xl border border-cric-border p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-cric-bg rounded w-1/3" />
          <div className="h-8 bg-cric-bg rounded w-2/3" />
          <div className="h-4 bg-cric-bg rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !data || !data.ballsFaced) {
    return (
      <div className="bg-cric-card rounded-xl border border-cric-border p-6 text-center">
        <p className="text-cric-muted text-xs font-bold uppercase tracking-widest">
          No head-to-head data available
        </p>
      </div>
    );
  }

  const { batsman, bowler, ballsFaced, runsScored, fours, sixes, dismissals, strikeRate, average, dismissalTypes } = data;
  const boundaryPercent = ballsFaced > 0 ? (((fours + sixes) / ballsFaced) * 100).toFixed(1) : "0.0";
  const dotPercent = ballsFaced > 0 ? (((ballsFaced - runsScored - fours * 3 - sixes * 5) / ballsFaced) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-cric-card rounded-xl border border-cric-border overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 px-6 py-4">
        <h3 className="text-lg font-black text-white uppercase tracking-tight">
          Head-to-Head
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Players */}
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <p className="text-sm font-black text-cric-text uppercase truncate">{batsman.name}</p>
            <p className="text-[10px] font-bold text-cric-muted uppercase tracking-widest">Batter</p>
          </div>
          <div className="px-4">
            <span className="text-xs font-black text-purple-500 uppercase tracking-widest">VS</span>
          </div>
          <div className="text-center flex-1">
            <p className="text-sm font-black text-cric-text uppercase truncate">{bowler.name}</p>
            <p className="text-[10px] font-bold text-cric-muted uppercase tracking-widest">Bowler</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-cric-bg rounded-lg p-3 text-center">
            <p className="text-xl font-black text-cric-text">{ballsFaced}</p>
            <p className="text-[9px] font-bold text-cric-muted uppercase tracking-widest mt-1">Balls</p>
          </div>
          <div className="bg-cric-bg rounded-lg p-3 text-center">
            <p className="text-xl font-black text-cric-text">{runsScored}</p>
            <p className="text-[9px] font-bold text-cric-muted uppercase tracking-widest mt-1">Runs</p>
          </div>
          <div className="bg-cric-bg rounded-lg p-3 text-center">
            <p className="text-xl font-black text-red-500">{dismissals}</p>
            <p className="text-[9px] font-bold text-cric-muted uppercase tracking-widest mt-1">Dismissals</p>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-cric-border pb-1">
              <span className="text-[10px] font-bold text-cric-muted uppercase">Strike Rate</span>
              <span className="text-sm font-black text-cric-text">{strikeRate}</span>
            </div>
            <div className="flex justify-between items-center border-b border-cric-border pb-1">
              <span className="text-[10px] font-bold text-cric-muted uppercase">Average</span>
              <span className="text-sm font-black text-cric-text">{average}</span>
            </div>
            <div className="flex justify-between items-center border-b border-cric-border pb-1">
              <span className="text-[10px] font-bold text-cric-muted uppercase">Boundary %</span>
              <span className="text-sm font-black text-cric-text">{boundaryPercent}%</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-cric-border pb-1">
              <span className="text-[10px] font-bold text-cric-muted uppercase">4s</span>
              <span className="text-sm font-black text-blue-600">{fours}</span>
            </div>
            <div className="flex justify-between items-center border-b border-cric-border pb-1">
              <span className="text-[10px] font-bold text-cric-muted uppercase">6s</span>
              <span className="text-sm font-black text-purple-600">{sixes}</span>
            </div>
            <div className="flex justify-between items-center border-b border-cric-border pb-1">
              <span className="text-[10px] font-bold text-cric-muted uppercase">Dot Ball %</span>
              <span className="text-sm font-black text-cric-text">{dotPercent}%</span>
            </div>
          </div>
        </div>

        {/* Dismissal Types */}
        {dismissalTypes.length > 0 && (
          <div className="bg-cric-bg rounded-lg p-3">
            <p className="text-[9px] font-bold text-cric-muted uppercase tracking-widest mb-2">Dismissal Types</p>
            <div className="flex flex-wrap gap-1.5">
              {dismissalTypes.map((type, idx) => (
                <span key={idx} className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeadToHead;
