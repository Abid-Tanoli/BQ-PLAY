import { idOf, playerName, number, sameId, strikeRate, formatBowlerOvers, economyRate } from "../utils/matchHelpers";

export default function CurrentPlayers({ striker, nonStriker, bowler, strikerId, players, innings }) {
  const batterRows = [striker, nonStriker].filter(Boolean);
  const currentBowlerId = idOf(bowler?.player || innings?.currentBowler);
  const previousBowler = [...(innings?.oversHistory || [])]
    .reverse()
    .map((over) => {
      const bowlerId = idOf(over.bowler);
      if (!bowlerId || bowlerId === currentBowlerId) return null;
      return (innings?.bowling || []).find((row) => sameId(row.player, bowlerId)) || { player: over.bowler };
    })
    .find(Boolean);
  const bowlerRows = [bowler, previousBowler].filter(Boolean);

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto match-table-scroll">
        <table className="w-full min-w-[360px] sm:min-w-[520px] text-xs sm:text-sm text-left">
          <thead className="bg-cric-bg text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] text-cric-muted">
            <tr>
              <th className="px-2 sm:px-3 py-1.5 sm:py-2">Batters</th>
              <th className="px-1 sm:px-2 py-1.5 sm:py-2 text-right">R</th>
              <th className="px-1 sm:px-2 py-1.5 sm:py-2 text-right">B</th>
              <th className="px-1 sm:px-2 py-1.5 sm:py-2 text-right">4s</th>
              <th className="px-1 sm:px-2 py-1.5 sm:py-2 text-right">6s</th>
              <th className="px-1 sm:px-2 py-1.5 sm:py-2 text-right">SR</th>
              <th className="hidden sm:table-cell px-2 py-2 text-right">This Bowler</th>
              <th className="hidden sm:table-cell px-2 py-2 text-right">Last 5 ov</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cric-border">
            {batterRows.length ? batterRows.map((row) => {
              const active = sameId(row?.player, strikerId);
              return (
                <tr key={idOf(row?.player)} className={active ? "bg-cric-accent/5" : ""}>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 font-black text-cric-text">
                    {playerName(row?.player, players)}
                    {active && <span className="ml-0.5 text-red-600">*</span>}
                  </td>
                  <td className="px-1 sm:px-2 py-1.5 sm:py-2 text-right font-black tabular-nums">{number(row?.runs)}</td>
                  <td className="px-1 sm:px-2 py-1.5 sm:py-2 text-right tabular-nums">{number(row?.balls)}</td>
                  <td className="px-1 sm:px-2 py-1.5 sm:py-2 text-right tabular-nums">{number(row?.fours)}</td>
                  <td className="px-1 sm:px-2 py-1.5 sm:py-2 text-right tabular-nums">{number(row?.sixes)}</td>
                  <td className="px-1 sm:px-2 py-1.5 sm:py-2 text-right tabular-nums">{strikeRate(row?.runs, row?.balls)}</td>
                  <td className="hidden sm:table-cell px-2 py-2 text-right text-cric-muted">-</td>
                  <td className="hidden sm:table-cell px-2 py-2 text-right text-cric-muted">-</td>
                </tr>
              );
            }) : (
              <tr>
                <td className="px-3 py-3 text-cric-muted text-xs" colSpan={6}>Batters will appear after scoring starts.</td>
              </tr>
            )}
          </tbody>
          <thead className="bg-cric-bg text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] text-cric-muted">
            <tr>
              <th className="px-2 sm:px-3 py-1.5 sm:py-2">Bowlers</th>
              <th className="px-1 sm:px-2 py-1.5 sm:py-2 text-right">O</th>
              <th className="px-1 sm:px-2 py-1.5 sm:py-2 text-right">M</th>
              <th className="px-1 sm:px-2 py-1.5 sm:py-2 text-right">R</th>
              <th className="px-1 sm:px-2 py-1.5 sm:py-2 text-right">W</th>
              <th className="px-1 sm:px-2 py-1.5 sm:py-2 text-right">Econ</th>
              <th className="hidden sm:table-cell px-2 py-2 text-right">0s</th>
              <th className="hidden sm:table-cell px-2 py-2 text-right">Wd/Nb</th>
            </tr>
          </thead>
          <tbody>
            {bowlerRows.length ? (
              bowlerRows.map((row, index) => (
                <tr key={`${idOf(row?.player)}-${index}`}>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 font-black text-cric-text">
                    <span className="mr-1 text-[9px] sm:text-[10px] uppercase tracking-widest text-cric-muted">{index === 0 ? "Now" : "Prev"}</span>
                    {playerName(row?.player, players)}
                  </td>
                  <td className="px-1 sm:px-2 py-1.5 sm:py-2 text-right tabular-nums">{formatBowlerOvers(row)}</td>
                  <td className="px-1 sm:px-2 py-1.5 sm:py-2 text-right tabular-nums">{number(row?.maidens)}</td>
                  <td className="px-1 sm:px-2 py-1.5 sm:py-2 text-right tabular-nums">{number(row?.runs)}</td>
                  <td className="px-1 sm:px-2 py-1.5 sm:py-2 text-right font-black tabular-nums">{number(row?.wickets)}</td>
                  <td className="px-1 sm:px-2 py-1.5 sm:py-2 text-right tabular-nums">{row?.economy || economyRate(row?.runs, row?.balls)}</td>
                  <td className="hidden sm:table-cell px-2 py-2 text-right tabular-nums">{number(row?.dots ?? row?.dotBalls)}</td>
                  <td className="hidden sm:table-cell px-2 py-2 text-right tabular-nums">{number(row?.wides)}/{number(row?.noBalls)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-3 text-cric-muted text-xs" colSpan={6}>Bowler will appear after scoring starts.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
