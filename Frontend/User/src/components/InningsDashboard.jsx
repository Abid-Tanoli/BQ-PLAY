import React from 'react';
import { Link } from 'react-router-dom';

export default function InningsDashboard({ innings, match }) {
  if (!innings) return null;

  const currentBatsmen = [
    innings.batting?.find(b => (b.player?._id || b.player) === (innings.currentBatsman1?._id || innings.currentBatsman1)) || innings.currentBatsman1,
    innings.batting?.find(b => (b.player?._id || b.player) === (innings.currentBatsman2?._id || innings.currentBatsman2)) || innings.currentBatsman2
  ].filter(Boolean);

  const currentBowlerStats = innings.bowling?.find(b => (b.player?._id || b.player) === (innings.currentBowler?._id || innings.currentBowler)) || innings.currentBowler;

  const getRecentBalls = () => {
    if (!innings.oversHistory?.length) return [];
    const lastOver = innings.oversHistory[innings.oversHistory.length - 1];
    return lastOver.balls?.slice(-5) || [];
  };

  const renderBatterRow = (b, isOnStrike) => {
    const p = b.player || b;
    const playerId = p._id || p;
    return (
      <tr key={playerId} className="border-b border-slate-100 last:border-0 group">
        <td className="py-4 pl-4">
          <div className="flex items-center gap-2">
            <Link
              to={`/players/${playerId}`}
              className={`text-[13px] font-black uppercase tracking-tight hover:text-blue-600 hover:underline transition-colors ${isOnStrike ? 'text-[#031d44]' : 'text-slate-400'}`}
            >
              {p.name}{isOnStrike ? '*' : ''}
            </Link>
          </div>
        </td>
        <td className="py-4 text-center font-black text-[#031d44] text-[13px]">{b.runs || 0}</td>
        <td className="py-4 text-center font-bold text-slate-400 text-[13px]">{b.balls || 0}</td>
        <td className="py-4 text-center font-bold text-slate-400 text-[11px]">{b.fours || 0}</td>
        <td className="py-4 text-center font-bold text-slate-400 text-[11px]">{b.sixes || 0}</td>
        <td className="py-4 text-center font-bold text-slate-400 text-[11px]">{b.strikeRate || '0.00'}</td>
        <td className="py-4 text-center font-bold text-slate-400 text-[10px] hidden md:table-cell uppercase tracking-tighter">
          {b.runs || 0} ({b.balls || 0}b)
        </td>
        <td className="py-4 text-center font-bold text-slate-400 text-[11px] hidden lg:table-cell">
          <div className="flex gap-0.5 justify-center">
            {getRecentBalls().map((ball, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            ))}
          </div>
        </td>
        <td className="py-4 text-center text-slate-300 text-[11px] hidden xl:table-cell">-</td>
        <td className="py-4 text-center text-slate-300 text-[11px] hidden xl:table-cell">-</td>
        <td className="py-4 text-center text-slate-300 text-[11px] hidden xl:table-cell">-</td>
        <td className="py-4 text-center text-slate-300 text-[11px] hidden xl:table-cell">-</td>
      </tr>
    );
  };

  const renderBowlerRow = (b) => {
    const p = b.player || b;
    const playerId = p._id || p;
    const totalOvers = Math.floor((b.balls || 0) / 6);
    const remainingBalls = (b.balls || 0) % 6;
    const oversStr = `${totalOvers}.${remainingBalls}`;
    const economy = (totalOvers + remainingBalls / 6) > 0
      ? (b.runs / (totalOvers + remainingBalls / 6)).toFixed(2)
      : '0.00';

    return (
      <tr key={playerId} className="group">
        <td className="py-4 pl-4">
          <Link
            to={`/players/${playerId}`}
            className="text-[13px] font-black uppercase text-[#031d44] tracking-tight hover:text-blue-600 hover:underline transition-colors"
          >
            {p.name}
          </Link>
        </td>
        <td className="py-4 text-center font-bold text-[#031d44] text-[13px]">{oversStr}</td>
        <td className="py-4 text-center font-bold text-slate-400 text-[13px]">{b.maidens || 0}</td>
        <td className="py-4 text-center font-bold text-slate-400 text-[13px]">{b.runs || 0}</td>
        <td className="py-4 text-center font-black text-red-600 text-[13px]">{b.wickets || 0}</td>
        <td className="py-4 text-center font-bold text-slate-400 text-[11px]">{economy}</td>
        <td className="py-4 text-center font-bold text-slate-400 text-[11px] hidden md:table-cell">{b.dotBalls || 0}</td>
        <td className="py-4 text-center font-bold text-slate-400 text-[11px] hidden md:table-cell">-</td>
        <td className="py-4 text-center font-bold text-slate-400 text-[11px] hidden md:table-cell">-</td>
        <td className="py-4 text-center font-bold text-slate-400 text-[10px] hidden lg:table-cell uppercase tracking-tighter">
          {b.wickets || 0}-{b.runs || 0}-{totalOvers}.{remainingBalls}
        </td>
        <td className="py-4 text-center text-slate-300 text-[11px] hidden xl:table-cell">-</td>
        <td className="py-4 text-center text-slate-300 text-[11px] hidden xl:table-cell">-</td>
        <td className="py-4 text-center text-slate-300 text-[11px] hidden xl:table-cell">-</td>
        <td className="py-4 text-center text-slate-300 text-[11px] hidden xl:table-cell">-</td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden mb-6">
      {/* Powerplay Status Indicator */}
      {match?.powerplayConfig?.enabled && innings?.powerplayStatus && (
        <div className={`px-6 py-3 border-b ${innings.powerplayStatus.isActive
            ? "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200"
            : "bg-slate-50 border-slate-100"
          }`}>
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${innings.powerplayStatus.isActive
                ? "bg-purple-500 animate-pulse"
                : "bg-slate-400"
              }`}></div>
            <span className={`text-xs font-black uppercase tracking-wider ${innings.powerplayStatus.isActive
                ? "text-purple-700"
                : "text-slate-500"
              }`}>
              {innings.powerplayStatus.isActive ? "⚡ Powerplay Active" : "Powerplay Completed"}
            </span>
            {innings.powerplayStatus.isActive && (
              <span className="text-xs font-bold text-purple-600 ml-2">
                {innings.powerplayStatus.currentOver + 1}/{match.powerplayConfig.overs}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Batters Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="text-[10px] font-black uppercase text-slate-400 text-left py-4 pl-4 tracking-widest">Batters</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-12">R</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-12">B</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-10">4s</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-10">6s</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-16">SR</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-24 hidden md:table-cell">This Bowler</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-24 hidden lg:table-cell">Last 5 Balls</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-12 hidden xl:table-cell">Mat</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-16 hidden xl:table-cell">Runs</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-12 hidden xl:table-cell">HS</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-16 hidden xl:table-cell">Ave</th>
            </tr>
          </thead>
          <tbody>
            {(currentBatsmen.length > 0 ? currentBatsmen : [innings.currentBatsman1, innings.currentBatsman2]).filter(Boolean).map(b =>
              renderBatterRow(b, (b.player?._id || b._id || b) === (innings.onStrikeBatsman?._id || innings.onStrikeBatsman))
            )}
          </tbody>
        </table>
      </div>

      {/* Bowlers Table */}
      <div className="overflow-x-auto border-t border-slate-100">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="text-[10px] font-black uppercase text-slate-400 text-left py-4 pl-4 tracking-widest">Bowlers</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-12">O</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-12">M</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-12">R</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-12">W</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-16">Econ</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-10 hidden md:table-cell">0s</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-10 hidden md:table-cell">4s</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-10 hidden md:table-cell">6s</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-24 hidden lg:table-cell">This Spell</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-12 hidden xl:table-cell">Mat</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-12 hidden xl:table-cell">Wkts</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-16 hidden xl:table-cell">BBI</th>
              <th className="text-[10px] font-black uppercase text-slate-400 py-4 tracking-widest w-16 hidden xl:table-cell">Ave</th>
            </tr>
          </thead>
          <tbody>
            {[currentBowlerStats].filter(Boolean).map(b => renderBowlerRow(b))}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="bg-slate-50/50 px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Run Rate:</span>
          <span className="text-[11px] font-black text-[#031d44] uppercase">{innings.runRate || '0.00'}</span>
        </div>
        {innings.target > 0 && (
          <>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Required:</span>
              <span className="text-[11px] font-black text-red-600 uppercase">{innings.requiredRunRate || '0.00'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
