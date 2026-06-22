import { number } from "../utils/matchHelpers";
import { orderedBallsForDisplay } from "./RecentBallsStrip";
import BallBadge from "./BallBadge";
import CommentaryBall from "./CommentaryBall";

export default function CommentaryPreview({ overs, players, onSwitchTab }) {
  const recentOvers = (overs || []).slice(0, 3);
  const latestBall = recentOvers[0]?.balls?.length ? recentOvers[0].balls[recentOvers[0].balls.length - 1] : null;
  return (
    <div className="bg-cric-card py-2 sm:py-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-black text-cric-text">Match Centre</h3>
        {onSwitchTab && (
          <button
            type="button"
            onClick={() => onSwitchTab("commentary")}
            className="text-[10px] font-black uppercase tracking-widest text-cric-accent hover:underline"
          >
            View All
          </button>
        )}
      </div>
      {latestBall ? (
        <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
          {recentOvers.map((over) => {
            const balls = orderedBallsForDisplay(over.balls || []);
            return (
            <div key={over.overNumber} className="border-t border-cric-border pt-2 sm:pt-3">
              <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-cric-muted">Over {number(over.overNumber) + 1}</span>
                <span className="text-[8px] sm:text-[9px] text-cric-muted font-bold">
                  {number(over.runsScored)} run{number(over.runsScored) !== 1 ? "s" : ""}
                  {number(over.wickets) > 0 && ` | ${over.wickets} wkt`}
                </span>
              </div>
              <div className="mb-1.5 sm:mb-2 flex flex-wrap gap-0.5 sm:gap-1">
                {balls.map((b, i) => <BallBadge key={i} ball={b} small />)}
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                {balls.map((ball, idx) => (
                  <CommentaryBall key={ball._id || idx} over={over} ball={ball} players={players} compact />
                ))}
              </div>
            </div>
          );
          })}
        </div>
      ) : (
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-cric-muted">Commentary will appear here after the first ball.</p>
      )}
    </div>
  );
}
