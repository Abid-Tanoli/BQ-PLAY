import { number, idOf, playerName, sameId, teamName, getTeamById, overRunsAndWickets, formatBowlerOvers, economyRate, currentInningsOf } from "../utils/matchHelpers";
import MetricSmall from "./MetricSmall";
import MiniWagonWheel from "./MiniWagonWheel";

export default function ScoreBreakdown({ match }) {
  const innings = match?.innings || [];
  const current = currentInningsOf(match);
  const currentPartnership = (current?.partnerships || [])[(current?.partnerships || []).length - 1];
  const currentBatters = [current?.currentBatsman1, current?.currentBatsman2]
    .map((player) => (current?.batting || []).find((row) => sameId(row.player, player)))
    .filter(Boolean);
  const currentBowler = (current?.bowling || []).find((row) => sameId(row.player, current?.currentBowler));
  const phases = [
    { label: "Power Play", start: 0, end: 6 },
    { label: "Middle Overs", start: 6, end: Math.max(number(match?.totalOvers) - 5, 6) },
    { label: "Final Overs", start: Math.max(number(match?.totalOvers) - 5, 0), end: number(match?.totalOvers) || 20 },
  ];

  const phaseScore = (inn, phase) => {
    const overs = inn?.oversHistory || [];
    const selected = overs.filter((over) => number(over.overNumber) >= phase.start && number(over.overNumber) < phase.end);
    if (!selected.length) return "-";
    const runs = selected.reduce((sum, over) => sum + overRunsAndWickets(over).runs, 0);
    const wickets = selected.reduce((sum, over) => sum + overRunsAndWickets(over).wickets, 0);
    return `${runs}/${wickets}`;
  };

  return (
    <div className="bg-cric-card pt-3 sm:pt-4">
      <h3 className="text-base sm:text-lg font-black text-cric-text">Scoring Breakdown</h3>
      <div className="mt-3 sm:mt-4 overflow-hidden rounded-lg border border-cric-border">
        <div className="grid grid-cols-[1fr_repeat(2,minmax(70px,1fr))] bg-cric-bg px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black text-cric-text">
          <span>Phase</span>
          {innings.slice(0, 2).map((inn, index) => (
            <span key={inn?._id || index} className="text-right">{teamName(getTeamById(match, inn?.team))}</span>
          ))}
        </div>
        <div className="divide-y divide-cric-border">
          {phases.map((phase) => (
            <div key={phase.label} className="grid grid-cols-[1fr_repeat(2,minmax(60px,1fr))] px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm">
              <span className="font-semibold text-cric-text">{phase.label}</span>
              {innings.slice(0, 2).map((inn, index) => (
                <span key={`${phase.label}-${inn?._id || index}`} className="text-right font-black tabular-nums text-cric-text">
                  {phaseScore(inn, phase)}
                </span>
              ))}
              {innings.length < 2 && <span className="text-right font-black text-cric-muted">-</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 sm:mt-4 grid gap-2 sm:gap-3">
        <div className="rounded-lg border border-cric-border bg-cric-bg p-2 sm:p-3">
          <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-cric-muted">Current Partnership</div>
          <div className="mt-0.5 sm:mt-1 text-lg sm:text-xl font-black text-cric-text">
            {number(currentPartnership?.runs)} <span className="text-xs font-bold text-cric-muted">runs</span>
          </div>
          <p className="text-[11px] sm:text-xs font-semibold text-cric-muted">
            {number(currentPartnership?.balls)} balls · RR {currentPartnership?.balls ? ((number(currentPartnership.runs) / number(currentPartnership.balls)) * 6).toFixed(2) : "0.00"}
          </p>
        </div>
        {currentBatters.length > 0 && (
          <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
            {currentBatters.map((row) => (
              <div key={idOf(row.player)} className="rounded-lg border border-cric-border bg-cric-card p-2 sm:p-3">
                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-cric-muted">{playerName(row.player)}</div>
                <MiniWagonWheel shots={row.shots || []} />
              </div>
            ))}
          </div>
        )}
        <div className="rounded-lg border border-cric-border bg-cric-card p-2 sm:p-3">
          <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-cric-muted">Current Bowler Stats</div>
          {currentBowler ? (
            <div className="mt-1.5 sm:mt-2 grid grid-cols-5 gap-1 sm:gap-2 text-center text-[11px] sm:text-xs">
              <MetricSmall label="O" value={formatBowlerOvers(currentBowler)} />
              <MetricSmall label="M" value={number(currentBowler.maidens)} />
              <MetricSmall label="R" value={number(currentBowler.runs)} />
              <MetricSmall label="W" value={number(currentBowler.wickets)} />
              <MetricSmall label="Econ" value={currentBowler.economy || economyRate(currentBowler.runs, currentBowler.balls)} />
            </div>
          ) : (
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-cric-muted">Bowler will appear after scoring starts.</p>
          )}
        </div>
      </div>
    </div>
  );
}
