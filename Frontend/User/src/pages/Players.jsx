import { useEffect, useState } from "react";
import { api } from "../services/api";
import PlayerCard from "../components/PlayerCard";

const Players = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    API.get("/players").then(res => setPlayers(res.data));
  }, []);

  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      {players.map(p => <PlayerCard key={p._id} player={p} />)}
    </div>
  );
};

export default Players;
