import { useEffect, useState } from "react";
import { getPlayerRanking } from "../services/playerApi";

export default function RankingList() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    getPlayerRanking().then(setPlayers);
  }, []);

  return (
    <ol className="list-decimal ml-5 mt-4">
      {players.map(p => (
        <li key={p._id}>
          {p.name} — {p.rankingPoints.toFixed(1)}
        </li>
      ))}
    </ol>
  );
}
