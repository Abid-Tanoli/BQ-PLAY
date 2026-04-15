import React, { useState } from "react";
import CricketFieldMap from "./CricketFieldMap";

export default function EnhancedScoringPanel({ onSubmitBall, currentBatsmen, currentBowler, onWicket, onEndInnings }) {
  const [runs, setRuns] = useState(null);
  const [extra, setExtra] = useState(null);
  const [isWicket, setIsWicket] = useState(false);
  const [dismissalType, setDismissalType] = useState("");
  const [dismissedPlayer, setDismissedPlayer] = useState("");
  const [fieldPosition, setFieldPosition] = useState(null);
  const [commentary, setCommentary] = useState("");

  const handleFieldClick = (position) => {
    setFieldPosition(position);
  };

  const handleSubmit = () => {
    if (runs === null && !extra && !isWicket) {
      alert("Select runs, extra, or wicket");
      return;
    }

    const ballData = {
      runs: runs || 0,
      isWicket,
      extra,
      dismissalType: isWicket ? dismissalType : null,
      dismissedPlayer: isWicket ? dismissedPlayer : null,
      shotPlacement: fieldPosition,
      commentary: commentary || generateAutoCommentary(runs, extra, isWicket, fieldPosition),
    };

    onSubmitBall(ballData);
    resetForm();
  };

  const generateAutoCommentary = (r, ext, wicket, pos) => {
    if (wicket) return `WICKET! ${dismissalType || "Caught"} ${pos?.positionLabel ? `at ${pos.positionLabel}` : ""}`;
    if (ext === "wide") return "Wide ball!";
    if (ext === "noball") return "No ball!";
    if (r === 4) return `FOUR! ${pos?.positionLabel ? `Driven through ${pos.positionLabel}` : "Cracking shot!"}`;
    if (r === 6) return `SIX! ${pos?.positionLabel ? `Over the ${pos.positionLabel} boundary` : "Massive hit!"}`;
    if (r === 0) return "Dot ball, good delivery";
    return `Quick ${r} run${r > 1 ? "s" : ""}${pos?.positionLabel ? ` towards ${pos.positionLabel}` : ""}`;
  };

  const resetForm = () => {
    setRuns(null);
    setExtra(null);
    setIsWicket(false);
    setDismissalType("");
    setDismissedPlayer("");
    setFieldPosition(null);
    setCommentary("");
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-[#031d44] to-slate-800 text-white">
        <h2 className="text-xl font-black uppercase tracking-widest">Scoring Panel</h2>
        <p className="text-xs text-slate-300 mt-1">Select runs & field position</p>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          {/* Current Players */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">On Strike</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-slate-800">
                  {currentBatsmen?.[0]?.name || "Select Batsman"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-bold text-slate-800">
                  {currentBatsmen?.[1]?.name || "Select Batsman"}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-bold text-slate-800">
                  {currentBowler?.name || "Select Bowler"}
                </span>
              </div>
            </div>
          </div>

          {/* Run Buttons */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Runs</h3>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2, 3, 4, 6].map((r) => (
                <button
                  key={r}
                  onClick={() => { setRuns(r); setExtra(null); setIsWicket(false); }}
                  className={`py-3 rounded-xl font-black text-lg transition-all ${
                    runs === r
                      ? "bg-[#031d44] text-white shadow-lg"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {r === 0 ? "DOT" : r}
                </button>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Extras</h3>
            <div className="grid grid-cols-2 gap-2">
              {["wide", "noball", "bye", "legbye"].map((ext) => (
                <button
                  key={ext}
                  onClick={() => { setExtra(ext); setRuns(1); setIsWicket(false); }}
                  className={`py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                    extra === ext
                      ? "bg-orange-500 text-white shadow-lg"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {ext === "noball" ? "No Ball" : ext === "legbye" ? "Leg Bye" : ext}
                </button>
              ))}
            </div>
          </div>

          {/* Wicket */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Wicket</h3>
            <button
              onClick={() => setIsWicket(!isWicket)}
              className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
                isWicket
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
                  : "bg-slate-100 text-slate-700 hover:bg-red-100 hover:text-red-700"
              }`}
            >
              {isWicket ? "WICKET SELECTED" : "Select Wicket"}
            </button>

            {isWicket && (
              <div className="mt-3 space-y-3">
                <select
                  value={dismissalType}
                  onChange={(e) => setDismissalType(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="">Dismissal Type</option>
                  <option value="bowled">Bowled</option>
                  <option value="caught">Caught</option>
                  <option value="lbw">LBW</option>
                  <option value="run_out">Run Out</option>
                  <option value="stumped">Stumped</option>
                  <option value="hit_wicket">Hit Wicket</option>
                </select>
                <select
                  value={dismissedPlayer}
                  onChange={(e) => setDismissedPlayer(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="">Select Dismissed Player</option>
                  {currentBatsmen?.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Commentary */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Commentary</h3>
            <textarea
              value={commentary}
              onChange={(e) => setCommentary(e.target.value)}
              placeholder="Auto-generated or enter manually..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 h-20 resize-none"
            />
          </div>
        </div>

        {/* Right Column - Field Map */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Field Position</h3>
          <CricketFieldMap onFieldClick={handleFieldClick} selectedZone={fieldPosition?.position} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4">
        <button
          onClick={handleSubmit}
          className="flex-1 py-4 bg-[#031d44] hover:bg-slate-800 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg"
        >
          Submit Ball
        </button>
        <button
          onClick={onEndInnings}
          className="px-6 py-4 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg"
        >
          End Innings
        </button>
        <button
          onClick={resetForm}
          className="px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-xs uppercase tracking-widest rounded-xl transition-all"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
