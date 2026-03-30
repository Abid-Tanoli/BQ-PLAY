import React from 'react';

export default function MatchFlow({ match, innings }) {
  if (!match || !innings) return null;

  const events = [];

  // Powerplay event
  if (innings.balls >= 36) {
    events.push({
      type: 'powerplay',
      label: 'Powerplay',
      overs: '1-6',
      runs: innings.powPlayRuns || 0,
      wickets: innings.powerPlayWickets || 0,
      time: '6 overs'
    });
  }

  // 50-run milestone
  if (innings.runs >= 50) {
    const ballsFor50 = Math.ceil((innings.balls / innings.runs) * 50);
    events.push({
      type: 'milestone',
      label: '50 RUNS',
      runs: 50,
      balls: ballsFor50,
      time: `${Math.floor(ballsFor50 / 6)}.${ballsFor50 % 6} overs`
    });
  }

  // 100-run milestone
  if (innings.runs >= 100) {
    const ballsFor100 = Math.ceil((innings.balls / innings.runs) * 100);
    events.push({
      type: 'milestone',
      label: '100 RUNS',
      runs: 100,
      balls: ballsFor100,
      time: `${Math.floor(ballsFor100 / 6)}.${ballsFor100 % 6} overs`
    });
  }

  // 150-run milestone
  if (innings.runs >= 150) {
    const ballsFor150 = Math.ceil((innings.balls / innings.runs) * 150);
    events.push({
      type: 'milestone',
      label: '150 RUNS',
      runs: 150,
      balls: ballsFor150,
      time: `${Math.floor(ballsFor150 / 6)}.${ballsFor150 % 6} overs`
    });
  }

  // Strategic timeouts
  if (match.strategicTimeouts) {
    match.strategicTimeouts.forEach((timeout, idx) => {
      events.push({
        type: 'timeout',
        label: 'Strategic Timeout',
        team: timeout.team,
        runRate: timeout.runRate,
        time: timeout.overs || `${idx + 1}`
      });
    });
  }

  // Wickets
  if (innings.fallOfWickets) {
    innings.fallOfWickets.forEach((wicket, idx) => {
      events.push({
        type: 'wicket',
        label: `${idx + 1}st Wicket`,
        batsman: wicket.batsman,
        runs: wicket.runs,
        overs: wicket.over,
        dismissal: wicket.dismissal || 'Out'
      });
    });
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-6 py-4">
        <h3 className="text-sm font-black uppercase text-slate-800 tracking-wide">Match Flow</h3>
      </div>

      <div className="p-6">
        {events.length === 0 ? (
          <p className="text-center text-slate-500">No match events yet</p>
        ) : (
          <div className="space-y-4 relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-slate-200" />

            {events.map((event, idx) => (
              <div key={idx} className="flex gap-6 relative pl-8">
                {/* Timeline dot */}
                <div className="absolute left-1 top-2 w-3 h-3 rounded-full bg-white border-2 border-blue-600" />

                {/* Event card */}
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {event.type === 'powerplay' && (
                    <div>
                      <p className="font-black text-slate-800 uppercase tracking-wide text-sm">{event.label}</p>
                      <p className="text-xs text-slate-500 mt-1">{event.overs}</p>
                      <div className="flex gap-6 mt-3">
                        <div>
                          <p className="text-xs text-slate-500 font-medium">RUNS</p>
                          <p className="text-2xl font-black text-[#031d44]">{event.runs}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">WICKETS</p>
                          <p className="text-2xl font-black text-red-600">{event.wickets}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {event.type === 'milestone' && (
                    <div>
                      <p className="font-black text-slate-800 uppercase tracking-wide text-sm">📊 {event.label}</p>
                      <p className="text-xs text-slate-500 mt-1">{event.time}</p>
                      <div className="flex gap-6 mt-3">
                        <div>
                          <p className="text-xs text-slate-500 font-medium">BALLS</p>
                          <p className="text-xl font-black text-[#031d44]">{event.balls}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {event.type === 'timeout' && (
                    <div>
                      <p className="font-black text-slate-800 uppercase tracking-wide text-sm">⏱️ {event.label}</p>
                      <p className="text-xs text-slate-500 mt-1">{event.team}</p>
                      <p className="text-sm font-medium text-slate-700 mt-2">RR: {event.runRate}</p>
                    </div>
                  )}

                  {event.type === 'wicket' && (
                    <div>
                      <p className="font-black text-red-600 uppercase tracking-wide text-sm">⚠️ {event.label}</p>
                      <p className="font-bold text-slate-800 mt-1">{event.batsman}</p>
                      <div className="flex gap-6 mt-3">
                        <div>
                          <p className="text-xs text-slate-500 font-medium">RUNS</p>
                          <p className="text-lg font-black text-[#031d44]">{event.runs}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">OVERS</p>
                          <p className="text-lg font-medium text-slate-700">{event.overs}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{event.dismissal}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
