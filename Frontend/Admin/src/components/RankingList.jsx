import { useEffect, useState } from "react";
import { getPlayerRanking } from "../services/playerApi";

export default function RankingList() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    getPlayerRanking().then(setPlayers);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Player Rankings</h2>
      <ol className="list-decimal ml-5">
        {players.map(p => (
          <li key={p._id}>
            {p.name} - Points: {p.rankingPoints.toFixed(2)}
          </li>
        ))}
      </ol>
    </div>
  );
}
