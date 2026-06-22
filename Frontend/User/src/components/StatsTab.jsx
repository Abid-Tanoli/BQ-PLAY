import { useState, useEffect } from "react";
import { api } from "../services/api";
import WinProbabilityChart from "./WinProbabilityChart";
import ProjectedScoreWidget from "./ProjectedScoreWidget";
import BoundariesTracker from "./BoundariesTracker";
import SpikeGraph from "./SpikeGraph";
import PartnershipWheel from "./PartnershipWheel";

export default function StatsTab({ match, players }) {
  const [analytics, setAnalytics] = useState(null);
  const [partnerships, setPartnerships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, partnershipsRes] = await Promise.all([
          api.get(`/matches/${match._id}/analytics`),
          api.get(`/matches/${match._id}/partnerships/${match.currentInnings + 1}`)
        ]);
        setAnalytics(analyticsRes.data);
        setPartnerships(partnershipsRes.data || []);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [match._id, match.currentInnings]);

  const inning1 = match.innings?.[0];
  const inning2 = match.innings?.[1];
  const isSecondInnings = match.currentInnings === 1;

  if (loading) {
    return <div className="p-6 sm:p-8 text-center text-cric-muted text-xs sm:text-sm">Loading stats...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {isSecondInnings && analytics?.inning2WinProbBattingTeam ? (
          <WinProbabilityChart
            winProbHistory={analytics?.winProbHistory || []}
            currentBattingProb={analytics.inning2WinProbBattingTeam}
            currentBowlingProb={analytics.inning2WinProbBowlingTeam}
            battingTeamName={inning2?.team?.name || "Batting"}
            bowlingTeamName={inning1?.team?.name || "Bowling"}
          />
        ) : (
          analytics && (
            <ProjectedScoreWidget
              currentScore={inning1?.runs || 0}
              currentWickets={inning1?.wickets || 0}
              currentOvers={(inning1?.overs || 0) + (inning1?.balls || 0) / 6}
              projectedScore={analytics?.inning1ProjectedScore || 0}
              rangeLow={analytics?.inning1ProjectedRangeLow || 0}
              rangeHigh={analytics?.inning1ProjectedRangeHigh || 0}
              projectionHistory={analytics?.inning1ProjectionHistory || []}
            />
          )
        )}
        <BoundariesTracker
          inning1={{
            fours: analytics?.totalFoursInning1 || 0,
            sixes: analytics?.totalSixesInning1 || 0,
            boundaryRuns: analytics?.boundaryRunsInning1 || 0,
            totalRuns: inning1?.runs || 0
          }}
          inning2={{
            fours: analytics?.totalFoursInning2 || 0,
            sixes: analytics?.totalSixesInning2 || 0,
            boundaryRuns: analytics?.boundaryRunsInning2 || 0,
            totalRuns: inning2?.runs || 0
          }}
          total={{
            fours: (analytics?.totalFoursInning1 || 0) + (analytics?.totalFoursInning2 || 0),
            sixes: (analytics?.totalSixesInning1 || 0) + (analytics?.totalSixesInning2 || 0),
            boundaryRuns: (analytics?.boundaryRunsInning1 || 0) + (analytics?.boundaryRunsInning2 || 0)
          }}
        />
      </div>

      {inning1 && (
        <div className="pt-2">
          <SpikeGraph
            shots={(inning1?.oversHistory || []).flatMap(o => (o.balls || []).map(b => ({
              angle: b.angle,
              runs: b.runs,
              batsman: b.batsmanOnStrike,
            }))).filter(s => s.angle !== undefined)}
            playerName={inning1?.team?.shortName || inning1?.team?.name || "Innings 1"}
          />
        </div>
      )}

      <PartnershipWheel
        partnerships={partnerships}
        totalScore={inning1?.runs || 0}
      />
    </div>
  );
}
