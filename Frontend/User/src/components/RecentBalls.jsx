import RecentBallsStrip from "./RecentBallsStrip";

export default function RecentBalls({ overs }) {
  return (
    <div className="border-b border-cric-border bg-cric-card py-2 sm:py-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] text-cric-muted">Recent Balls</h3>
      </div>
      <div className="mt-3 sm:mt-4">
        <RecentBallsStrip overs={overs || []} showLegend={false} overClassName="rounded-lg p-2 sm:p-2.5" />
      </div>
    </div>
  );
}
