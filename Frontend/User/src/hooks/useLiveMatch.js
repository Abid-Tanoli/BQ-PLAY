import { useEffect, useState } from "react";
import { initSocket } from "../services/socket.js";

export default function useLiveMatch(matchId) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!matchId) return;

    const socket = initSocket();
    const handleBallUpdate = (payload = {}) => {
      const payloadMatchId = payload.matchId || payload.match?._id;
      if (payloadMatchId && payloadMatchId !== matchId) return;
      setData(payload);
    };

    socket.emit("join-match", matchId);
    socket.on("ball-update", handleBallUpdate);
    socket.on("match:ballUpdate", handleBallUpdate);
    socket.on("BALL_UPDATE", handleBallUpdate);

    return () => {
      socket.off("ball-update", handleBallUpdate);
      socket.off("match:ballUpdate", handleBallUpdate);
      socket.off("BALL_UPDATE", handleBallUpdate);
      socket.emit("leave-match", matchId);
    };
  }, [matchId]);

  return data;
}
