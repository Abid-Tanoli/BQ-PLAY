import { useEffect, useState } from "react";
import PlayerForm from "../components/PlayerForm";
import PlayerList from "../components/PlayerList";
import RankingList from "../components/RankingList";
import { initSocket } from "../store/socket";

export default function ManagePlayers() {
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const socket = initSocket();

    socket.on("players:updated", () => {
      setReload(prev => !prev);
    });

    return () => socket.off("players:updated");
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Manage Players</h2>

      <div className="card p-4">
        <PlayerForm onCreated={() => setReload(prev => !prev)} />
        <PlayerList key={reload} />
      </div>

      <div className="card p-4">
        <h3 className="font-semibold mb-2">Player Rankings</h3>
        <RankingList key={reload} />
      </div>
    </div>
  );
}
