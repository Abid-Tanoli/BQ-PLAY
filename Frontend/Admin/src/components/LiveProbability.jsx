import React, { useMemo } from 'react';

export default function LiveProbability({ match, currentInnings }) {
  if (!match || !currentInnings) return null;

  // Calculate win probability
  const innings1 = match.innings?.[0];
  const innings2 = match.innings?.[1];

  const team1 = match.teams?.[0];
  const team2 = match.teams?.[1];

  const calculateProbability = () => {
    if (!innings1 || !innings2) return { team1: 50, team2: 50 };

    // If first innings is complete but second isn't
    if (innings1.status === 'completed' && innings2.status !== 'completed') {
      const target = innings1.runs + 1;
      const needRuns = target - innings2.runs;
      const ballsLeft = (match.totalOvers * 6) - innings2.balls;
      const runsNeeded = Math.max(0, needRuns);

      if (ballsLeft <= 0) {
        return { team1: 0, team2: 100 };
      }

      const requiredRunRate = (runsNeeded / ballsLeft) * 6;
      const currentRunRate = (innings2.runs / Math.max(1, innings2.overs || 1));

      // Probability based on run rate comparison
      let team2Prob = 50;
      if (requiredRunRate > 20) team2Prob = 20;
      else if (requiredRunRate > 12) team2Prob = 35;
      else if (requiredRunRate > 8) team2Prob = 50;
      else if (requiredRunRate > 6) team2Prob = 65;
      else team2Prob = 80;

      return { team1: 100 - team2Prob, team2: team2Prob };
    }

    return { team1: 50, team2: 50 };
  };

  const { team1: team1Prob, team2: team2Prob } = useMemo(calculateProbability, [match, innings1, innings2]);

  // Determine chase dynamics
  const chaseInfo = useMemo(() => {
    if (!innings1 || !innings2 || innings1.status !== 'completed') {
      return null;
    }

    const target = innings1.runs;
    const currentRuns = innings2.runs;
    const currentWickets = innings2.wickets;
    const ballsLeft = (match.totalOvers * 6) - innings2.balls;
    const oversLeft = Math.floor(ballsLeft / 6);
    const ballsInOversLeft = ballsLeft % 6;
    const runsNeeded = Math.max(0, target - currentRuns);
    const wicketsLeft = 10 - currentWickets;

    return {
      target,
      currentRuns,
      runsNeeded,
      ballsLeft,
      oversLeft,
      ballsInOversLeft,
      currentWickets,
      wicketsLeft,
      runRate: currentRuns > 0 ? (currentRuns / Math.max(1, innings2.overs || 1)).toFixed(2) : '0.00',
      requiredRunRate: ballsLeft > 0 ? ((runsNeeded / ballsLeft) * 6).toFixed(2) : '0.00'
    };
  }, [innings1, innings2, match]);

  return (
    <div className="space-y-4">
      {/* Win Probability */}
      <div className="bg-white rounded-lg shadow-md border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-black uppercase text-slate-800 tracking-wide">📊 Win Probability</h3>
        </div>

        <div className="p-6 space-y-4">
          {/* Team 1 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold">
                  {team1?.name?.charAt(0)}
                </div>
                <span className="font-bold text-slate-800">{team1?.shortName || team1?.name}</span>
              </div>
              <span className="font-black text-2xl text-[#031d44]">{team1Prob}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${team1Prob}%` }}
              />
            </div>
          </div>

          {/* Team 2 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold">
                  {team2?.name?.charAt(0)}
                </div>
                <span className="font-bold text-slate-800">{team2?.shortName || team2?.name}</span>
              </div>
              <span className="font-black text-2xl text-[#031d44]">{team2Prob}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${team2Prob}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chase Dynamics */}
      {chaseInfo && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md border border-blue-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-100 to-blue-100 border-b border-indigo-200 px-6 py-4">
            <h3 className="text-sm font-black uppercase text-indigo-900 tracking-wide">🎯 Chase Dynamics</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Target */}
              <div className="bg-white rounded-lg p-4 border border-indigo-100">
                <p className="text-xs text-indigo-600 font-black uppercase tracking-wider">Target</p>
                <p className="text-3xl font-black text-indigo-900 mt-1">{chaseInfo.target}</p>
              </div>

              {/* Runs Needed */}
              <div className="bg-white rounded-lg p-4 border border-indigo-100">
                <p className="text-xs text-indigo-600 font-black uppercase tracking-wider">Need</p>
                <p className="text-3xl font-black text-red-600 mt-1">{chaseInfo.runsNeeded}</p>
              </div>

              {/* Balls Left */}
              <div className="bg-white rounded-lg p-4 border border-indigo-100">
                <p className="text-xs text-indigo-600 font-black uppercase tracking-wider">Balls</p>
                <p className="text-3xl font-black text-indigo-900 mt-1">{chaseInfo.ballsLeft}</p>
              </div>

              {/* Wickets Left */}
              <div className="bg-white rounded-lg p-4 border border-indigo-100">
                <p className="text-xs text-indigo-600 font-black uppercase tracking-wider">Wickets</p>
                <p className="text-3xl font-black text-orange-600 mt-1">{chaseInfo.wicketsLeft}</p>
              </div>
            </div>

            {/* Run Rate Comparison */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-xs text-green-600 font-black uppercase tracking-wider">Current RR</p>
                <p className="text-2xl font-black text-green-700 mt-1">{chaseInfo.runRate}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <p className="text-xs text-red-600 font-black uppercase tracking-wider">Required RR</p>
                <p className="text-2xl font-black text-red-700 mt-1">{chaseInfo.requiredRunRate}</p>
              </div>
            </div>

            {/* Analysis */}
            <div className="mt-4 p-3 bg-white rounded-lg border-l-4 border-indigo-500">
              {Number(chaseInfo.requiredRunRate) > Number(chaseInfo.runRate) * 1.2 ? (
                <p className="text-sm text-red-700 font-medium">
                  📉 Chasing team needs to accelerate. Required run rate is significantly higher than current.
                </p>
              ) : Number(chaseInfo.requiredRunRate) > Number(chaseInfo.runRate) ? (
                <p className="text-sm text-yellow-700 font-medium">
                  ⚠️ Chasing team needs to pick up the pace slightly.
                </p>
              ) : (
                <p className="text-sm text-green-700 font-medium">
                  ✅ Chasing team is ahead of the required run rate!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
