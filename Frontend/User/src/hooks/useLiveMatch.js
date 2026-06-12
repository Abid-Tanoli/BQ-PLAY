import { useEffect, useState } from "react";
import { initSocket } from "../services/socket.js";

export default function useLiveMatch(matchId) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!matchId) return;

    const socket = initSocket();
    const handleBallRecorded = (payload = {}) => {
      const payloadMatchId = payload.matchId || payload.ball?.matchId;
      if (payloadMatchId && payloadMatchId !== matchId) return;
      setData(payload);
    };

    const handleLegacy = (payload = {}) => {
      const payloadMatchId = payload.matchId || payload.match?._id;
      if (payloadMatchId && payloadMatchId !== matchId) return;
      setData(payload);
    };

    socket.emit("join-match", matchId);
    socket.on("ball:recorded", handleBallRecorded);
    socket.on("ball-update", handleLegacy);
    socket.on("match:ballUpdate", handleLegacy);
    socket.on("BALL_UPDATE", handleLegacy);

    return () => {
      socket.off("ball:recorded", handleBallRecorded);
      socket.off("ball-update", handleLegacy);
      socket.off("match:ballUpdate", handleLegacy);
      socket.off("BALL_UPDATE", handleLegacy);
      socket.emit("leave-match", matchId);
    };
  }, [matchId]);

  return data;
}
