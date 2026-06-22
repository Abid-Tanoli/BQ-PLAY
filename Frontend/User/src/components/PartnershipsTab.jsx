import { useState, useEffect } from "react";
import { api } from "../services/api";
import { number, idOf, sameId, teamName, playerName, getTeamById, formatOvers, ordinal } from "../utils/matchHelpers";

export default function PartnershipsTab({ match, innings, players }) {
  const [partnershipData, setPartnershipData] = useState([]);
  const [loading, setLoading] = useState(true);
  const allInnings = match?.innings || [];

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get(`/matches/${match._id}/partnerships`);
        if (Array.isArray(res.data?.innings)) {
          setPartnershipData(res.data.innings.map((inn) => inn.partnerships || []));
        } else {
          const results = await Promise.all(
            allInnings.map((_, idx) =>
              api.get(`/matches/${match._id}/partnerships/${idx + 1}`).then(r => r.data)
            )
          );
          setPartnershipData(results);
        }
      } catch (err) {
        try {
          const results = await Promise.all(
            allInnings.map((_, idx) =>
              api.get(`/matches/${match._id}/partnerships/${idx + 1}`).then(r => r.data)
            )
          );
          setPartnershipData(results);
        } catch (fallbackErr) {
          console.error("Failed to load partnerships:", fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [match._id]);

  if (loading) return <div className="text-center text-cric-muted py-6 sm:py-8 text-xs sm:text-sm">Loading partnerships...</div>;

  const formatPartnerships = (partnerships, innIdx) => {
    if (!partnerships || partnerships.length === 0) {
      return <p className="text-xs sm:text-sm text-cric-muted py-3 sm:py-4">No partnerships recorded for this innings.</p>;
    }
    const inn = allInnings[innIdx];
    return (
      <div className="space-y-2 sm:space-y-3">
        {partnerships.map((p, i) => {
          const isActive = p.isActive;
          return (
            <div
              key={p._id || i}
              className={`rounded-xl border p-3 sm:p-4 transition-all ${
                isActive
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 shadow-sm'
                  : 'border-cric-border bg-cric-card'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-2">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-cric-muted">
                  {p.wicketNumber || p.wicket}{ordinal(number(p.wicketNumber || p.wicket || i + 1))} Wicket Partnership
                  {(isActive || p.isCurrent) && <span className="ml-1.5 sm:ml-2 text-green-600 dark:text-green-400 text-[8px] sm:text-[9px]">(Current)</span>}
                </span>
                {p.runs > 0 && (
                  <span className="text-[10px] sm:text-xs font-bold text-cric-muted shrink-0">
                    {((p.runs / (inn?.runs || 1)) * 100).toFixed(1)}% of score
                  </span>
                )}
              </div>
              {inn?.runs > 0 && (
                <div className="w-full bg-cric-bg rounded-full h-1.5 mb-2 sm:mb-3">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      p.runs > 50 ? 'bg-emerald-500' : p.runs > 30 ? 'bg-blue-500' : 'bg-cric-muted'
                    }`}
                    style={{ width: `${Math.max(2, (p.runs / inn.runs) * 100)}%` }}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <span className="text-xl sm:text-2xl font-black text-cric-text">{p.runs || 0}</span>
                    <span className="text-[11px] sm:text-sm text-cric-muted">runs</span>
                  </div>
                  <div className="flex gap-2 sm:gap-3 text-[10px] sm:text-xs text-cric-muted mt-0.5 sm:mt-1">
                    <span>{p.balls || 0} balls</span>
                    <span>SR: {p.balls > 0 ? ((p.runs / p.balls) * 100).toFixed(1) : '0.0'}</span>
                  </div>
                </div>
                <div className="text-right text-xs sm:text-sm">
                  <div className="font-medium text-cric-text">{p.batsmen?.[0] || playerName(p.batsman1Id || p.batsman1, players)}</div>
                  <div className="font-medium text-cric-text">{p.batsmen?.[1] || playerName(p.batsman2Id || p.batsman2, players)}</div>
                  {p.fours > 0 || p.sixes > 0 ? (
                    <div className="text-[10px] sm:text-xs text-cric-muted mt-0.5 sm:mt-1">
                      {p.fours > 0 && <span className="text-blue-500">{p.fours} 4s </span>}
                      {p.sixes > 0 && <span className="text-purple-500">{p.sixes} 6s</span>}
                    </div>
                  ) : null}
                </div>
              </div>
              {(p.startOver != null || p.endOver != null) && (
                <div className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] font-bold text-cric-muted flex gap-1.5 sm:gap-2">
                  {p.startOver != null && <span>From Over {p.startOver}</span>}
                  {p.endOver != null && <span>To Over {p.endOver}</span>}
                  {p.startOver != null && p.endOver != null && (
                    <span>({(p.endOver - (p.startOver || 0)).toFixed(1)} ov span)</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {allInnings.map((inn, idx) => (
        <section key={idx}>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <h2 className="text-xs sm:text-sm font-black text-cric-text">
              {teamName(getTeamById(match, inn.team))} Innings
            </h2>
            <span className="text-[10px] sm:text-xs font-bold text-cric-muted">
              {inn.runs || 0}/{inn.wickets || 0} ({formatOvers(inn.balls)} ov)
            </span>
          </div>
          {formatPartnerships(partnershipData[idx], idx)}
        </section>
      ))}
    </div>
  );
}
