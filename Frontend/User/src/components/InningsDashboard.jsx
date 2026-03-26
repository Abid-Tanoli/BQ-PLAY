import React from 'react';

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
    return (
      <tr key={p._id || p} className="border-b border-slate-100 last:border-0 group">
        <td className="py-4 pl-4">
          <div className="flex items-center gap-2">
            <span className={`text-[13px] font-black uppercase tracking-tight ${isOnStrike ? 'text-[#031d44]' : 'text-slate-400'}`}>
              {p.name}{isOnStrike ? '*' : ''}
            </span>
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

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden mb-6">
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
            {[currentBowlerStats].filter(Boolean).map(b => (
              <tr key={b.player?._id || b._id || b} className="group">
                <td className="py-4 pl-4">
                  <span className="text-[13px] font-black uppercase text-[#031d44] tracking-tight">
                    {b.player?.name || b.name}
                  </span>
                </td>
                <td className="py-4 text-center font-bold text-[#031d44] text-[13px]">{b.overs || 0}.{b.balls % 6 || 0}</td>
                <td className="py-4 text-center font-bold text-slate-400 text-[13px]">{b.maidens || 0}</td>
                <td className="py-4 text-center font-bold text-slate-400 text-[13px]">{b.runs || 0}</td>
                <td className="py-4 text-center font-black text-red-600 text-[13px]">{b.wickets || 0}</td>
                <td className="py-4 text-center font-bold text-slate-400 text-[11px]">{b.economy || '0.00'}</td>
                <td className="py-4 text-center font-bold text-slate-400 text-[11px] hidden md:table-cell">-</td>
                <td className="py-4 text-center font-bold text-slate-400 text-[11px] hidden md:table-cell">-</td>
                <td className="py-4 text-center font-bold text-slate-400 text-[11px] hidden md:table-cell">-</td>
                <td className="py-4 text-center font-bold text-slate-400 text-[10px] hidden lg:table-cell uppercase tracking-tighter">
                   {b.wickets || 0}-{b.runs || 0}-{Math.floor(b.balls/6 || 0)}.{b.balls % 6 || 0}
                </td>
                <td className="py-4 text-center text-slate-300 text-[11px] hidden xl:table-cell">-</td>
                <td className="py-4 text-center text-slate-300 text-[11px] hidden xl:table-cell">-</td>
                <td className="py-4 text-center text-slate-300 text-[11px] hidden xl:table-cell">-</td>
                <td className="py-4 text-center text-slate-300 text-[11px] hidden xl:table-cell">-</td>
              </tr>
            ))}
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
