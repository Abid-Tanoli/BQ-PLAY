import { useEffect, useState } from "react";
import { API } from "../services/api";

export default function Rankings() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    API.get("/players/ranking").then(res => setPlayers(res.data));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Player Rankings</h1>

      {players.map((p, i) => (
        <div key={p._id} className="border p-3 mb-2 rounded">
          #{i+1} {p.name} — ⭐ {p.rankingPoints.toFixed(1)}
        </div>
      ))}
    </div>
  );
}
