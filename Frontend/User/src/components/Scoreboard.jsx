import { useEffect, useState } from "react";
import { socket } from "../services/api";

const Scoreboard = ({ matchId }) => {
  const [score, setScore] = useState(null);

  useEffect(() => {
    socket.emit("joinMatch", matchId);

    socket.on("updateScoreboard", (data) => {
      setScore(data);
    });

    return () => socket.off("updateScoreboard");
  }, [matchId]);

  if (!score) return <p>Waiting for live score...</p>;

  return (
    <div className="border p-4 rounded">
      <h2 className="text-xl font-bold">Live Score</h2>
      <p>{score.battingTeam}</p>
      <p>
        {score.runs}/{score.wickets} ({score.overs}.{score.balls})
      </p>
      <p>Striker: {score.striker}</p>
      <p>Non-Striker: {score.nonStriker}</p>
    </div>
  );
};

export default Scoreboard;
