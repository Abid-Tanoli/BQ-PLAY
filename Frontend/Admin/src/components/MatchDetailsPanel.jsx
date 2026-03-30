import React from 'react';

export default function MatchDetailsPanel({ match }) {
  if (!match) return null;

  const formatDatetime = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {/* Series & Match Info */}
      <div className="bg-white rounded-lg shadow-md border border-slate-100 p-6">
        <h3 className="text-sm font-black uppercase text-slate-800 tracking-wide mb-4">📅 Match Details</h3>

        <div className="space-y-3">
          {match.tournament && (
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Series</p>
              <p className="font-bold text-slate-800">{match.tournament.name || 'International Match'}</p>
            </div>
          )}

          {match.matchType && (
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Format</p>
              <p className="font-bold text-slate-800">{match.matchType}</p>
            </div>
          )}

          {match.venue && (
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Venue</p>
              <p className="font-bold text-slate-800">{match.venue}</p>
            </div>
          )}

          {match.date && (
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Match Date</p>
              <p className="font-bold text-slate-800">{formatDatetime(match.date)}</p>
            </div>
          )}

          {match.status && (
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Status</p>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest inline-block ${
                  match.status === 'live' ? 'bg-red-100 text-red-700' :
                  match.status === 'completed' ? 'bg-slate-200 text-slate-700' :
                  match.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {match.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toss Information */}
      {match.toss && (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg shadow-md border border-amber-200 p-6">
          <h3 className="text-sm font-black uppercase text-amber-900 tracking-wide mb-4">🪙 Toss</h3>

          <div className="space-y-3">
            {match.toss.winner && (
              <div>
                <p className="text-xs text-amber-700 font-medium uppercase tracking-wider">Won Toss</p>
                <p className="font-black text-lg text-amber-900">{match.toss.winner}</p>
              </div>
            )}

            {match.toss.decision && (
              <div>
                <p className="text-xs text-amber-700 font-medium uppercase tracking-wider">Decision</p>
                <p className="font-black text-lg text-amber-900">{match.toss.decision.toUpperCase()}</p>
              </div>
            )}

            {match.toss.statement && (
              <div>
                <p className="text-sm text-amber-800 italic">{match.toss.statement}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Umpires & Officials */}
      <div className="bg-white rounded-lg shadow-md border border-slate-100 p-6">
        <h3 className="text-sm font-black uppercase text-slate-800 tracking-wide mb-4">👨‍⚖️ Officials</h3>

        <div className="space-y-3">
          {match.umpires && (
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Umpires</p>
              <div className="space-y-1">
                {Array.isArray(match.umpires) ? (
                  match.umpires.map((ump, idx) => (
                    <p key={idx} className="font-medium text-slate-700">
                      {ump.name || ump} <span className="text-slate-500 text-sm">({ump.country || umb.role || 'Umpire'})</span>
                    </p>
                  ))
                ) : (
                  <p className="font-medium text-slate-700">{match.umpires}</p>
                )}
              </div>
            </div>
          )}

          {match.reserves && (
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Reserve Umpire</p>
              <p className="font-medium text-slate-700">{match.reserves}</p>
            </div>
          )}

          {match.referee && (
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Match Referee</p>
              <p className="font-medium text-slate-700">{match.referee}</p>
            </div>
          )}

          {match.tvUmpire && (
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">TV Umpire</p>
              <p className="font-medium text-slate-700">{match.tvUmpire}</p>
            </div>
          )}
        </div>
      </div>

      {/* Ground Conditions */}
      {match.groundConditions && (
        <div className="bg-white rounded-lg shadow-md border border-slate-100 p-6">
          <h3 className="text-sm font-black uppercase text-slate-800 tracking-wide mb-4">⛅ Conditions</h3>

          <div className="grid grid-cols-2 gap-3">
            {match.groundConditions.weather && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 font-medium uppercase">Weather</p>
                <p className="font-bold text-slate-800">{match.groundConditions.weather}</p>
              </div>
            )}
            {match.groundConditions.pitch && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 font-medium uppercase">Pitch</p>
                <p className="font-bold text-slate-800">{match.groundConditions.pitch}</p>
              </div>
            )}
            {match.groundConditions.temperature && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 font-medium uppercase">Temperature</p>
                <p className="font-bold text-slate-800">{match.groundConditions.temperature}°C</p>
              </div>
            )}
            {match.groundConditions.humidity && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 font-medium uppercase">Humidity</p>
                <p className="font-bold text-slate-800">{match.groundConditions.humidity}%</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Match Result/Target */}
      {match.result && (
        <div className={`rounded-lg shadow-md border p-6 ${
          match.result.winner
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
            : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
        }`}>
          <h3 className={`text-sm font-black uppercase tracking-wide mb-4 ${
            match.result.winner ? 'text-green-900' : 'text-amber-900'
          }`}>
            {match.result.winner ? '🏆 Result' : '⏳ Target'}
          </h3>

          <div className={`text-lg font-black ${match.result.winner ? 'text-green-900' : 'text-amber-900'}`}>
            {match.result.description || match.result.winner}
          </div>

          {match.result.margin && (
            <p className={`text-sm font-medium mt-2 ${match.result.winner ? 'text-green-800' : 'text-amber-800'}`}>
              {match.result.margin}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
