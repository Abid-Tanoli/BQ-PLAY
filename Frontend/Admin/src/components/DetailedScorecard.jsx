import React, { useState } from 'react';

export default function DetailedScorecard({ match }) {
  if (!match || !match.innings || match.innings.length === 0) {
    return <div className="text-center py-8 text-slate-500">No scorecard data</div>;
  }

  return (
    <div className="space-y-8">
      {match.innings.map((innings, idx) => (
        <div key={idx} className="bg-white rounded-lg shadow-md border border-slate-100 overflow-hidden">
          {/* Team Header */}
          <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                  {match.teams?.[idx]?.logo ? (
                    <img src={match.teams[idx].logo} alt={match.teams[idx].name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="font-black text-slate-700 text-lg">{match.teams?.[idx]?.name?.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">{match.teams?.[idx]?.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">Innings {idx + 1}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-[#031d44]">{innings.runs || 0}/{innings.wickets || 0}</div>
                <div className="text-sm text-slate-500 font-medium">({innings.overs || 0}.{innings.balls % 6 || 0} ov)</div>
              </div>
            </div>
          </div>

          {/* Batting Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-3 text-xs font-black uppercase text-slate-600 tracking-wide">Batter</th>
                  <th className="text-center px-4 py-3 text-xs font-black uppercase text-slate-600 tracking-wide">R</th>
                  <th className="text-center px-4 py-3 text-xs font-black uppercase text-slate-600 tracking-wide">B</th>
                  <th className="text-center px-4 py-3 text-xs font-black uppercase text-slate-600 tracking-wide">4s</th>
                  <th className="text-center px-4 py-3 text-xs font-black uppercase text-slate-600 tracking-wide">6s</th>
                  <th className="text-center px-4 py-3 text-xs font-black uppercase text-slate-600 tracking-wide">SR</th>
                  <th className="text-left px-6 py-3 text-xs font-black uppercase text-slate-600 tracking-wide">How Out</th>
                </tr>
              </thead>
              <tbody>
                {innings.batting?.map((b, i) => {
                  const player = b.player || b;
                  const playerName = typeof player === 'object' ? player.name : 'Unknown';
                  return (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3">
                        <div>
                          <p className="font-bold text-slate-800">{playerName}</p>
                          <p className="text-xs text-slate-500">{b.isOut ? '(Out)' : '(Not Out)'}</p>
                        </div>
                      </td>
                      <td className="text-center px-4 py-3">
                        <span className="font-black text-lg text-[#031d44]">{b.runs || 0}</span>
                      </td>
                      <td className="text-center px-4 py-3">
                        <span className="font-bold text-slate-700">{b.balls || 0}</span>
                      </td>
                      <td className="text-center px-4 py-3">
                        <span className="font-medium text-slate-600">{b.fours || 0}</span>
                      </td>
                      <td className="text-center px-4 py-3">
                        <span className="font-medium text-slate-600">{b.sixes || 0}</span>
                      </td>
                      <td className="text-center px-4 py-3">
                        <span className="font-medium text-slate-600">{b.strikeRate || '-'}</span>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-sm text-slate-600">{b.dismissal || '-'}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-300 font-black">
                  <td className="px-6 py-3 text-slate-800">EXTRAS</td>
                  <td className="text-center px-4 py-3 text-[#031d44]">{innings.extras?.total || 0}</td>
                  <td colSpan="5" className="px-6 py-3 text-sm text-slate-600">
                    {innings.extras ? `lb ${innings.extras.legByes || 0}, nb ${innings.extras.noBalls || 0}, w ${innings.extras.wides || 0}, b ${innings.extras.byes || 0}` : '-'}
                  </td>
                </tr>
                <tr className="bg-slate-100 border-t border-slate-300 font-black">
                  <td className="px-6 py-3 text-slate-900">TOTAL</td>
                  <td className="text-center px-4 py-3 text-2xl text-[#031d44]">{innings.runs || 0}/{innings.wickets || 0}</td>
                  <td className="text-center px-4 py-3 text-slate-700">{innings.overs || 0} Ov</td>
                  <td colSpan="4" className="px-6 py-3 text-sm text-slate-700">RR: {innings.runRate || '-'}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Fall of Wickets */}
          {innings.fallOfWickets && innings.fallOfWickets.length > 0 && (
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
              <h4 className="text-sm font-black uppercase text-slate-700 tracking-wide mb-2">Fall of Wickets</h4>
              <div className="flex flex-wrap gap-4">
                {innings.fallOfWickets.map((fow, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="font-bold text-slate-700">{i + 1}-{fow.runs}</span>
                    <span className="text-slate-500">{fow.batsman || 'Unknown'}</span>
                    <span className="text-slate-400 text-sm">({fow.over || '-'}.{fow.ball || '-'} ov)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bowling Table */}
          <div className="overflow-x-auto border-t border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-3 text-xs font-black uppercase text-slate-600 tracking-wide">Bowler</th>
                  <th className="text-center px-4 py-3 text-xs font-black uppercase text-slate-600 tracking-wide">O</th>
                  <th className="text-center px-4 py-3 text-xs font-black uppercase text-slate-600 tracking-wide">M</th>
                  <th className="text-center px-4 py-3 text-xs font-black uppercase text-slate-600 tracking-wide">R</th>
                  <th className="text-center px-4 py-3 text-xs font-black uppercase text-slate-600 tracking-wide">W</th>
                  <th className="text-center px-4 py-3 text-xs font-black uppercase text-slate-600 tracking-wide">Econ</th>
                  <th className="text-center px-4 py-3 text-xs font-black uppercase text-slate-600 tracking-wide hidden md:table-cell">0s</th>
                  <th className="text-center px-4 py-3 text-xs font-black uppercase text-slate-600 tracking-wide hidden md:table-cell">4s</th>
                  <th className="text-center px-4 py-3 text-xs font-black uppercase text-slate-600 tracking-wide hidden md:table-cell">6s</th>
                </tr>
              </thead>
              <tbody>
                {innings.bowling?.map((b, i) => {
                  const player = b.player || b;
                  const playerName = typeof player === 'object' ? player.name : 'Unknown';
                  return (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-bold text-slate-800">{playerName}</td>
                      <td className="text-center px-4 py-3 font-medium text-slate-700">{b.overs || 0}</td>
                      <td className="text-center px-4 py-3 font-medium text-slate-700">{b.maidens || 0}</td>
                      <td className="text-center px-4 py-3 font-medium text-slate-700">{b.runs || 0}</td>
                      <td className="text-center px-4 py-3 font-black text-lg text-[#031d44]">{b.wickets || 0}</td>
                      <td className="text-center px-4 py-3 font-medium text-slate-700">{b.economy || '-'}</td>
                      <td className="text-center px-4 py-3 font-medium text-slate-600 hidden md:table-cell">{b.dots || 0}</td>
                      <td className="text-center px-4 py-3 font-medium text-slate-600 hidden md:table-cell">{b.fours || 0}</td>
                      <td className="text-center px-4 py-3 font-medium text-slate-600 hidden md:table-cell">{b.sixes || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
