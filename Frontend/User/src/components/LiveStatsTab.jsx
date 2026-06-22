import LiveStats from "./LiveStats";

export default function LiveStatsTab({ matchId }) {
  return (
    <section>
      <LiveStats matchId={matchId} />
    </section>
  );
}
