import { useEffect, useState } from "react";
import { socket } from "../services/api";

export default function Scoreboard({ matchId }) {
  const [score, setScore] = useState(null);

  useEffect(() => {
    socket.emit("joinMatch", matchId);
    socket.on("updateScoreboard", (data) => setScore(data));
    return () => socket.off("updateScoreboard");
  }, [matchId]);

  if (!score) return <p className="text-gray-500">Waiting for live score...</p>;

  return (
    <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
      <h2 className="text-xl font-bold mb-2">Live Score</h2>
      <p className="font-semibold">{score.battingTeam}</p>
      <p>{score.runs}/{score.wickets} ({score.overs}.{score.balls})</p>
      <p>Striker: {score.striker}</p>
      <p>Non-Striker: {score.nonStriker}</p>
    </div>
  );
}
