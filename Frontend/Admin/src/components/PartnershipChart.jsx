import React from 'react';

/**
 * Partnership Visualization Component
 * Shows partnership runs, balls, and run rate between two batsmen
 */
export default function PartnershipChart({ partnerships = [], currentPartnership = null }) {
  // Calculate max partnership for scaling
  const maxRuns = Math.max(...partnerships.map(p => p.runs || 0), currentPartnership?.runs || 0, 1);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="font-bold text-slate-800 mb-4">Partnership Analysis</h3>

      {/* Current Partnership Card */}
      {currentPartnership && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-blue-800">Current Partnership</h4>
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-bold">
              LIVE
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-blue-600 uppercase font-bold">Runs</p>
              <p className="text-2xl font-black text-blue-900">{currentPartnership.runs}</p>
            </div>
            <div>
              <p className="text-xs text-blue-600 uppercase font-bold">Balls</p>
              <p className="text-2xl font-black text-blue-900">{currentPartnership.balls}</p>
            </div>
            <div>
              <p className="text-xs text-blue-600 uppercase font-bold">Run Rate</p>
              <p className="text-2xl font-black text-blue-900">
                {currentPartnership.balls > 0 
                  ? ((currentPartnership.runs / currentPartnership.balls) * 100).toFixed(2) 
                  : '0.00'}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-blue-700">
            <span className="font-semibold">{currentPartnership.batsman1?.name}</span>
            <span className="text-blue-400">&</span>
            <span className="font-semibold">{currentPartnership.batsman2?.name}</span>
          </div>
        </div>
      )}

      {/* Partnership History Bar Chart */}
      {partnerships.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-700 mb-3 text-sm">Partnership History</h4>
          <div className="space-y-2">
            {partnerships.map((partnership, index) => {
              const width = ((partnership.runs || 0) / maxRuns) * 100;
              const runRate = partnership.balls > 0 
                ? ((partnership.runs / partnership.balls) * 100).toFixed(2) 
                : '0.00';
              
              return (
                <div key={index} className="relative">
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className="text-slate-500 font-medium w-6">Wkt {index + 1}</span>
                    <span className="text-slate-700 font-semibold flex-1 truncate">
                      {partnership.batsman1?.name?.split(' ')[0]} & {partnership.batsman2?.name?.split(' ')[0]}
                    </span>
                    <span className="text-slate-800 font-bold">{partnership.runs} ({partnership.balls})</span>
                  </div>
                  <div className="h-6 bg-slate-100 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        partnership.runs >= 50 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                          : partnership.runs >= 25
                            ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
                            : 'bg-gradient-to-r from-slate-400 to-slate-500'
                      }`}
                      style={{ width: `${width}%` }}
                    />
                    {/* Run rate indicator */}
                    <div className="absolute inset-0 flex items-center justify-end pr-2">
                      <span className="text-xs font-bold text-white drop-shadow">
                        RR: {runRate}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Partnership Stats Summary */}
      {partnerships.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 rounded-lg p-2">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-lg font-bold text-slate-800">
                {partnerships.reduce((sum, p) => sum + (p.runs || 0), 0)}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-2">
              <p className="text-xs text-green-600">Best</p>
              <p className="text-lg font-bold text-green-700">
                {Math.max(...partnerships.map(p => p.runs || 0))}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-2">
              <p className="text-xs text-blue-600">Avg</p>
              <p className="text-lg font-bold text-blue-700">
                {(partnerships.reduce((sum, p) => sum + (p.runs || 0), 0) / partnerships.length).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No partnerships message */}
      {partnerships.length === 0 && !currentPartnership && (
        <div className="text-center py-8 text-slate-400">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm font-medium">No partnership data yet</p>
        </div>
      )}
    </div>
  );
}
