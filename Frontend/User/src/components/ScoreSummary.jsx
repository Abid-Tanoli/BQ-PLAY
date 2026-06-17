import { longTeamName, formatOvers, number } from "../utils/matchHelpers";

export default function ScoreSummary({ innings, battingTeam, bowlingTeam, crr, rrr, target, totalOvers, partnership }) {
  const required = target ? Math.max(target - number(innings?.runs), 0) : 0;
  const remainingBalls = target ? Math.max(number(totalOvers) * 6 - number(innings?.balls), 0) : 0;

  return (
    <div className="pb-1 sm:pb-2">
      <div className="flex flex-wrap items-end justify-between gap-2 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-red-600">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Live
          </div>
          <h2 className="mt-2 text-lg sm:text-2xl font-black break-words">{longTeamName(battingTeam)}</h2>
          <p className="text-xs sm:text-sm text-cric-muted">Batting against {longTeamName(bowlingTeam)}</p>
          {target > 0 && (
            <p className="mt-2 text-xs sm:text-base font-semibold text-cric-text">
              Need {required} runs from {remainingBalls} balls.
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl sm:text-4xl font-black tabular-nums text-cric-text">{number(innings?.runs)}/{number(innings?.wickets)}</div>
          <div className="text-xs sm:text-sm font-bold text-cric-muted">
            ({formatOvers(innings?.balls)}/{totalOvers || 0} ov{target > 0 ? `, T:${target}` : ""})
          </div>
        </div>
      </div>
      <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-cric-muted">
        <span>CRR: <strong className="text-cric-text">{crr}</strong></span>
        {rrr && <span>RRR: <strong className="text-cric-text">{rrr}</strong></span>}
        <span>Part: <strong className="text-cric-text">{number(partnership?.runs)} ({number(partnership?.balls)}b)</strong></span>
      </div>
    </div>
  );
}
