import { number, playerName, ballRuns, ballClass, ballLabel, ballResultText, ballDataPoints, TAG_COLORS } from "../utils/matchHelpers";
import BallBadge from "./BallBadge";

export default function CommentaryBall({ over, ball, players, compact = false }) {
  const ballNum = ball.displayBall || ball.ballNumber || 1;
  const overText = `${number(over.overNumber)}.${ballNum}`;
  const bowler = ball.bowlerName || playerName(ball.bowler || over.bowler, players);
  const batsman = ball.batsmanName || playerName(ball.batsmanOnStrike, players);
  const text = ball.vividCommentary || ball.commentary || "";
  const runs = ballRuns(ball);
  const isBoundary = runs === 4;
  const isSix = runs === 6;
  const isWicket = ball?.isWicket;
  const dataPoints = ballDataPoints(ball);

  if (compact) {
    return (
      <div className="grid grid-cols-[1.5rem_1rem_minmax(0,1fr)] sm:grid-cols-[2rem_1.25rem_minmax(0,1fr)] gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-1.5 hover:bg-cric-accent/5 text-[11px] sm:text-xs">
        <span className="text-[9px] sm:text-[10px] font-bold text-cric-muted shrink-0 pt-0.5">{overText}</span>
        <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[7px] sm:text-[8px] font-black shrink-0 ${ballClass(ball)}`}>
          {ballLabel(ball)}
        </span>
        <div className="min-w-0">
          <p className="truncate">
            <span className="font-semibold text-cric-text">{batsman}</span>
            <span className="text-cric-muted mx-0.5 sm:mx-1">-</span>
            <span className="font-bold text-cric-muted">{ballResultText(ball)}</span>
          </p>
          {text && <p className="mt-0.5 truncate text-cric-muted/70">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-2 sm:p-3 rounded-xl transition-all ${isWicket ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" : "hover:bg-cric-accent/5"}`}>
      <div className="flex items-center gap-2 sm:gap-3">
        <BallBadge ball={ball} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
            <span className="text-cric-text font-bold text-xs sm:text-sm leading-tight">
              {overText} {bowler} to {batsman}, {isWicket ? "OUT!" : ballResultText(ball)}
            </span>
          </div>
        </div>
      </div>
      {text && (
        <p className="ml-8 sm:ml-12 mt-1 sm:mt-1.5 text-[11px] sm:text-xs text-cric-muted italic leading-relaxed">{text}</p>
      )}
      {dataPoints.length > 0 && (
        <div className="ml-8 sm:ml-12 mt-1 sm:mt-2 flex flex-wrap gap-1 sm:gap-1.5">
          {dataPoints.map((dp) => (
            <span key={dp.label} className={`px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-bold border ${TAG_COLORS[dp.type] || "bg-cric-bg text-cric-muted"} uppercase tracking-wide`}>
              {dp.label}
            </span>
          ))}
        </div>
      )}
      {ball.angle !== undefined && (
        <div className="ml-8 sm:ml-12 mt-1 sm:mt-1.5 flex items-center gap-1 sm:gap-1.5">
          <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-cric-border flex items-center justify-center">
            <div
              className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full"
              style={{
                backgroundColor: isSix ? '#a855f7' : isBoundary ? '#3b82f6' : '#94a3b8',
                transform: `rotate(${ball.angle || 0}deg)`,
              }}
            />
          </div>
          <span className="text-[8px] sm:text-[9px] font-bold text-cric-muted uppercase">
            {ball.regionName || ball.zone || ''}
          </span>
          {ball.distance && (
            <span className="text-[8px] sm:text-[9px] text-cric-muted">{Math.round(ball.distance)}m</span>
          )}
        </div>
      )}
    </div>
  );
}
