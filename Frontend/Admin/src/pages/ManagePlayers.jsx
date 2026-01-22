// import PlayerForm from "../components/PlayerForm";
import PlayerList from "../components/PlayerList";
import RankingList from "../components/RankingList";

export default function ManagePlayers() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Manage Players</h2>

      <div className="card p-4">
        {/* <PlayerForm onCreated={() => window.location.reload()} /> */}
        <PlayerList />
      </div>

      <div className="card p-4">
        <h3 className="font-semibold mb-2">Player Rankings</h3>
        <RankingList />
      </div>
    </div>
  );
}
