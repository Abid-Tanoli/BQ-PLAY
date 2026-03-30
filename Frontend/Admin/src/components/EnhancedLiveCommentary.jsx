import React, { useState } from 'react';

export default function EnhancedLiveCommentary({ match, currentInnings }) {
  const [expandedBall, setExpandedBall] = useState(null);

  if (!match || !currentInnings) {
    return <div className="text-center py-8 text-slate-500">No commentary data</div>;
  }

  const oversHistory = currentInnings.oversHistory || [];
  const displayOvers = oversHistory.slice(-3); // Show last 3 overs

  const getBallColor = (ball) => {
    if (ball.isWicket) return 'bg-red-100 border-red-300';
    if (ball.runs >= 4) return 'bg-green-100 border-green-300';
    if (ball.runs > 0) return 'bg-blue-100 border-blue-300';
    return 'bg-slate-100 border-slate-300';
  };

  const getBallText = (ball) => {
    if (ball.isWicket) return 'W';
    if (ball.isWide) return `${ball.runs}w`;
    if (ball.isNoBall) return `${ball.runs}nb`;
    if (ball.isBye) return `${ball.runs}b`;
    if (ball.isLegBye) return `${ball.runs}lb`;
    return ball.runs === 0 ? '•' : ball.runs.toString();
  };

  return (
    <div className="space-y-6">
      {/* Recent Balls */}
      <div className="bg-white rounded-lg shadow-md border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-black uppercase text-slate-800 tracking-wide">📊 Recent Balls</h3>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {displayOvers.length > 0 ? (
              displayOvers.map((over, overIdx) => (
                <div key={overIdx} className="flex gap-1">
                  {over.balls?.map((ball, ballIdx) => (
                    <button
                      key={ballIdx}
                      onClick={() => setExpandedBall(expandedBall === `${overIdx}-${ballIdx}` ? null : `${overIdx}-${ballIdx}`)}
                      className={`w-10 h-10 rounded-lg font-black text-sm font-bold border-2 transition-all ${getBallColor(ball)} hover:shadow-md cursor-pointer`}
                      title={ball.commentary || 'No commentary'}
                    >
                      {getBallText(ball)}
                    </button>
                  ))}
                </div>
              ))
            ) : (
              <p className="text-slate-500">No ball data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Ball-by-Ball Commentary */}
      <div className="bg-white rounded-lg shadow-md border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-black uppercase text-slate-800 tracking-wide">🎙️ Ball-by-Ball Commentary</h3>
        </div>

        <div className="divide-y divide-slate-200">
          {displayOvers.length > 0 ? (
            displayOvers.map((over, overIdx) => (
              <div key={overIdx} className="border-t-2 border-slate-300 first:border-t-0">
                {/* Over Header */}
                <div className="bg-slate-50 px-6 py-3 font-black text-slate-800 uppercase tracking-wide text-sm">
                  Over {over.overNumber}
                  {over.bowler && (
                    <span className="text-slate-600 font-bold ml-3">
                      {typeof over.bowler === 'object' ? over.bowler.name : over.bowler}
                    </span>
                  )}
                  {over.runs && (
                    <span className="text-slate-600 font-bold ml-3">
                      {over.runs} {over.runs === 1 ? 'run' : 'runs'}
                    </span>
                  )}
                </div>

                {/* Balls in Over */}
                <div className="divide-y divide-slate-100">
                  {over.balls?.map((ball, ballIdx) => (
                    <div key={ballIdx} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        {/* Ball Number & Result */}
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg font-black text-sm font-bold flex items-center justify-center border-2 ${getBallColor(ball)}`}>
                            {getBallText(ball)}
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-slate-800 uppercase tracking-tight text-sm">
                              {ball.ballNumber || ballIdx + 1}.
                              {ball.isWide && ' WIDE'}
                              {ball.isNoBall && ' NO BALL'}
                              {ball.isBye && ' BYE'}
                              {ball.isLegBye && ' LEG BYE'}
                              {ball.isWicket && ' WICKET'}
                              {!ball.isWide && !ball.isNoBall && !ball.isBye && !ball.isLegBye && !ball.isWicket && ball.runs > 0 && ` RUNS`}
                            </p>
                          </div>
                        </div>

                        {/* Runs */}
                        {!ball.isWicket && (
                          <div className="text-right">
                            <p className="text-2xl font-black text-[#031d44]">{ball.runs}</p>
                          </div>
                        )}
                      </div>

                      {/* Commentary */}
                      {ball.commentary && (
                        <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                          {ball.commentary}
                        </p>
                      )}

                      {/* Dismissal Info */}
                      {ball.isWicket && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                          <p className="font-bold text-red-800 text-sm">
                            {ball.dismissal || 'Wicket'}
                          </p>
                          {ball.batsman && (
                            <p className="text-sm text-red-700 mt-1">
                              <span className="font-bold">{ball.batsman}</span> out
                            </p>
                          )}
                          {ball.bowler && (
                            <p className="text-sm text-red-700">
                              b <span className="font-bold">{typeof ball.bowler === 'object' ? ball.bowler.name : ball.bowler}</span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Fielding Info */}
                      {ball.fieldingPosition && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm font-medium text-blue-800">
                            Fielding: <span className="font-bold">{ball.fieldingPosition}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Over Summary */}
                {over.runs !== undefined && (
                  <div className="bg-slate-100 px-6 py-3 font-bold text-slate-800 text-sm">
                    Over Result: {over.runs} {over.runs === 1 ? 'run' : 'runs'}
                    {over.wickets && over.wickets > 0 && `, ${over.wickets} ${over.wickets === 1 ? 'wicket' : 'wickets'}`}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500">
              No commentary data yet
            </div>
          )}
        </div>
      </div>

      {/* Commentary Summary */}
      <div className="bg-blue-50 rounded-lg shadow-md border border-blue-200 p-6">
        <h3 className="text-sm font-black uppercase text-blue-900 tracking-wide mb-3">📈 Match Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded p-3 border border-blue-100">
            <p className="text-xs text-blue-600 font-black uppercase">Total Runs</p>
            <p className="text-2xl font-black text-blue-900">{currentInnings.runs || 0}</p>
          </div>
          <div className="bg-white rounded p-3 border border-blue-100">
            <p className="text-xs text-blue-600 font-black uppercase">Wickets</p>
            <p className="text-2xl font-black text-red-600">{currentInnings.wickets || 0}</p>
          </div>
          <div className="bg-white rounded p-3 border border-blue-100">
            <p className="text-xs text-blue-600 font-black uppercase">Overs</p>
            <p className="text-2xl font-black text-blue-900">{currentInnings.overs || 0}.{currentInnings.balls % 6 || 0}</p>
          </div>
          <div className="bg-white rounded p-3 border border-blue-100">
            <p className="text-xs text-blue-600 font-black uppercase">Run Rate</p>
            <p className="text-2xl font-black text-blue-900">{currentInnings.runRate || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
