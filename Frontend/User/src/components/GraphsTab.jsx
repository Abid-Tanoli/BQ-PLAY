import { useState, useEffect } from "react";
import { api } from "../services/api";
import ManhattanGraph from "./ManhattanGraph";
import WormGraph from "./WormGraph";
import RunRateGraph from "./RunRateGraph";
import WinProbabilityChart from "./WinProbabilityChart";
import WagonZone from "./WagonZone";
import ResponsiveGraphWrap from "./ResponsiveGraphWrap";

export default function GraphsTab({ match, matchId, innings }) {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId && !match?._id) return;
    api.get(`/matches/${matchId || match._id}/graph-data`)
      .then(res => setGraphData(res.data))
      .catch(() => setGraphData(null))
      .finally(() => setLoading(false));
  }, [matchId, match?._id]);

  if (loading) return <div className="text-center text-cric-muted py-6 sm:py-8 text-xs sm:text-sm">Loading graphs...</div>;
  if (!graphData) return <div className="text-center text-cric-muted py-6 sm:py-8 text-xs sm:text-sm">No graph data available</div>;

  const inn1 = match?.innings?.[0];
  const inn2 = match?.innings?.[1];

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="match-card">
        <h3 className="text-xs sm:text-sm font-black text-cric-text mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-500"></span>
          Runs Per Over (Manhattan)
        </h3>
        <ResponsiveGraphWrap><ManhattanGraph match={match} innings={0} /></ResponsiveGraphWrap>
      </section>

      <section className="match-card">
        <h3 className="text-xs sm:text-sm font-black text-cric-text mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500"></span>
          Innings Progression (Worm)
        </h3>
        <ResponsiveGraphWrap><WormGraph match={match} /></ResponsiveGraphWrap>
      </section>

      {inn2 && (
        <section className="match-card">
          <h3 className="text-xs sm:text-sm font-black text-cric-text mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span>
            Run Rate Comparison
          </h3>
          <ResponsiveGraphWrap><RunRateGraph match={match} /></ResponsiveGraphWrap>
        </section>
      )}

      {graphData.winProbability?.length > 0 && (
        <section className="match-card">
          <h3 className="text-xs sm:text-sm font-black text-cric-text mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500"></span>
            Win Probability
          </h3>
          <ResponsiveGraphWrap>
          <WinProbabilityChart
            winProbHistory={graphData.winProbability}
            currentBattingProb={graphData.winProbability[graphData.winProbability.length - 1]?.team1 || 50}
            currentBowlingProb={graphData.winProbability[graphData.winProbability.length - 1]?.team2 || 50}
            battingTeamName={inn2?.team?.name || match?.teams?.[0]?.name || "Team A"}
            bowlingTeamName={inn1?.team?.name || match?.teams?.[1]?.name || "Team B"}
          />
          </ResponsiveGraphWrap>
        </section>
      )}

      <section className="match-card">
        <h3 className="text-xs sm:text-sm font-black text-cric-text mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500"></span>
          Shot Zone Analysis
        </h3>
        <ResponsiveGraphWrap><WagonZone matchId={matchId || match._id} match={match} innings={match.currentInnings || 0} /></ResponsiveGraphWrap>
      </section>
    </div>
  );
}
