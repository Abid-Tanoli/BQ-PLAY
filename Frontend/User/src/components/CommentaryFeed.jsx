import React, { useEffect, useRef } from 'react';

// Ball-by-Ball Commentary Feed - BQ-PLAY style
// Professional commentary display with live updates

const CommentaryFeed = ({ match, live = true }) => {
  const scrollRef = useRef(null);
  const prevCommentaryRef = useRef([]);

  // Auto-scroll to top (latest commentary) on new ball
  useEffect(() => {
    if (live && scrollRef.current && match?.innings?.length) {
      const allBalls = [];
      const currentInnings = match.innings[match.currentInnings] || match.innings[0];
      currentInnings.oversHistory?.forEach(over => {
        over.balls?.forEach((ball) => {
          allBalls.push(ball);
        });
      });
      const hasNewBalls = allBalls.length > prevCommentaryRef.current.length;
      if (hasNewBalls) {
        scrollRef.current.scrollTop = 0;
      }
      prevCommentaryRef.current = allBalls;
    }
  }, [live, match?.innings]);

  if (!match || !match.innings || match.innings.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No commentary available</p>
      </div>
    );
  }

  const currentInnings = match.innings[match.currentInnings] || match.innings[0];
  const isIllegalDelivery = (ball) => !!(ball?.isWide || ball?.isNoBall);

  // Flatten all balls from all overs
  const allBalls = [];
  currentInnings.oversHistory?.forEach(over => {
    let legalBalls = 0;
    over.balls?.forEach((ball, ballIdx) => {
      const displayBall = ball.displayBallNumber || ball.legalBallNumber || legalBalls + 1;
      allBalls.push({
        ...ball,
        overNumber: over.overNumber,
        ballIndex: ballIdx,
        displayBall,
        overSummary: over.summary
      });
      if (!isIllegalDelivery(ball)) {
        legalBalls += 1;
      }
    });
  });

  // Reverse to show latest first
  const reversedBalls = [...allBalls].reverse();

  // Get ball color based on event
  const getBallIndicatorColor = (ball) => {
    if (ball.wicketCancelled) return 'bg-orange-600 text-white ring-2 ring-red-500';
    if (ball.isWicket) return 'bg-red-500 text-white';
    if (ball.runs === 6) return 'bg-purple-600 text-white';
    if (ball.runs === 4) return 'bg-green-500 text-white';
    if (ball.isWide || ball.isNoBall) return 'bg-orange-400 text-white';
    if (ball.runs === 0) return 'bg-slate-300 text-slate-700';
    return 'bg-blue-100 text-blue-700';
  };

  // Format ball notation
  const getBallNotation = (ball) => {
    if (ball.wicketCancelled) return 'Nb';
    if (ball.isWicket) return 'W';
    if (ball.isWide) return 'Wd';
    if (ball.isNoBall) return 'Nb';
    if (ball.runs === 0 && !ball.isWide && !ball.isNoBall) return '•';
    return String(ball.runs || 0);
  };

  const getRunText = (ball) => {
    if (ball.runText) return ball.runText;
    const runs = ball.runs || 0;
    if (ball.wicketCancelled) return 'no ball, wicket cancelled';
    if (ball.isWicket) return 'OUT!';
    if (ball.isWide) return 'wide';
    if (ball.isNoBall) return 'no ball';
    if (runs === 0) return 'no run';
    if (runs === 1) return '1 run';
    if (runs === 2) return '2 runs';
    if (runs === 3) return '3 runs';
    if (runs === 4) return 'FOUR';
    if (runs === 6) return 'SIX';
    return `${runs} runs`;
  };

  const labelize = (value) =>
    String(value || "")
      .replace(/_/g, "-")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const getBallDataPoints = (ball) => {
    const points = [];
    const lineLen = (ball.pitchLength || ball.pitchZone) || ball.pitchLine
      ? `${ball.pitchLength || ball.pitchZone || ""}${(ball.pitchLength || ball.pitchZone) && ball.pitchLine ? " • " : ""}${ball.pitchLine || ""}`
      : "";
    if (lineLen) points.push({ label: labelize(lineLen), type: "line-length" });
    if (ball.ballMovement && ball.ballMovement !== "none")
      points.push({ label: labelize(ball.ballMovement), type: "movement" });
    const shot = ball.shotTypeName || ball.shotType || ball.pitchShotType || "";
    if (shot) points.push({ label: labelize(shot), type: "shot" });
    const dir = ball.shotDirection || ball.fieldingZone || ball.nearestPosition || ball.regionName || ball.zone || "";
    if (dir) points.push({ label: labelize(dir), type: "direction" });
    return points;
  };

  // Group balls by over for over summaries
  const groupedByOver = [];
  let currentOver = null;

  allBalls.forEach(ball => {
    if (!currentOver || currentOver.overNumber !== ball.overNumber) {
      if (currentOver) {
        groupedByOver.push(currentOver);
      }
      currentOver = {
        overNumber: ball.overNumber,
        balls: [ball],
        summary: ball.overSummary
      };
    } else {
      currentOver.balls.push(ball);
    }
  });

  if (currentOver) {
    groupedByOver.push(currentOver);
  }

  // Reverse overs for display (latest first)
  const reversedOvers = [...groupedByOver].reverse();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black px-6 py-4">
        <h3 className="font-bold text-white text-lg">📻 Ball-by-Ball Commentary</h3>
        {live && (
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-slate-300">Live Updates</span>
          </div>
        )}
      </div>

      {/* Commentary List */}
      <div ref={scrollRef} className="max-h-[600px] overflow-y-auto">
        {reversedOvers.map((over, overIdx) => (
          <div key={over.overNumber} className="border-b dark:border-slate-700 last:border-b-0">
            {/* Over Header */}
            <div className="bg-slate-50 dark:bg-slate-700 px-4 py-3 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-slate-800 dark:text-white">
                    Over {over.overNumber + 1}
                  </span>
                  {over.balls[0]?.bowler && (
                    <span className="text-xs font-bold bg-blue-600 text-white px-2 py-1 rounded">
                      {over.balls[0].bowler.name || 'Bowler'}
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {over.summary || `${over.balls.reduce((sum, ball) => sum + (ball.runs || 0) + (ball.isWide || ball.isNoBall ? 1 : 0), 0)} runs, ${over.balls.filter(ball => ball.isWicket).length} wickets`}
                </div>
              </div>
            </div>

            {/* Balls in Over */}
            <div className="divide-y dark:divide-slate-700">
              {[...over.balls].reverse().map((ball, ballIdx) => {
                const bowlerName = ball.bowlerName || ball.bowler?.name || over.balls[0]?.bowler?.name || 'Bowler';
                const batsmanName = ball.batsmanName || ball.batsmanOnStrike?.name || 'Batsman';
                const summaryLine = `${over.overNumber}.${ball.displayBall || ball.ballNumber || ball.ballIndex + 1} ${bowlerName} to ${batsmanName}, ${getRunText(ball)}`;
                const dataPoints = getBallDataPoints(ball);
                const tagColors = {
                  "line-length": "bg-blue-900/40 text-blue-300 border-blue-500/30",
                  movement: "bg-emerald-900/40 text-emerald-300 border-emerald-500/30",
                  shot: "bg-amber-900/40 text-amber-300 border-amber-500/30",
                  direction: "bg-violet-900/40 text-violet-300 border-violet-500/30",
                };
                return (
                  <div
                    key={ballIdx}
                    className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Ball Indicator */}
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getBallIndicatorColor(ball)}`}
                        >
                          {getBallNotation(ball)}
                        </div>
                      </div>

                      {/* Commentary Text */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                          {summaryLine}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {ball.wicketCancelled && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-red-500/20 text-red-600 dark:text-red-400 uppercase tracking-wider">Wicket cancelled</span>
                          )}
                          {ball.freeHitNext && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-purple-500/20 text-purple-600 dark:text-purple-400 uppercase tracking-wider">Free Hit next</span>
                          )}
                        </div>
                        {(ball.vividCommentary || ball.commentary) && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            {ball.vividCommentary || ball.commentary}
                          </p>
                        )}
                        {dataPoints.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {dataPoints.map(dp => (
                              <span key={dp.label} className={`px-2 py-0.5 rounded text-[9px] font-bold border ${tagColors[dp.type] || "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300"} uppercase tracking-wide`}>
                                {dp.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {reversedBalls.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>Commentary will appear here once the match starts</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentaryFeed;
