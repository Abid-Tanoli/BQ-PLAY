import { useEffect, useState } from "react";
import { initSocket } from "../services/socket.js";

export default function useLiveMatch(matchId) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const socket = initSocket();
    socket.emit("join-match", matchId);
    socket.on("ball-update", setData);

    return () => {
      socket.off("ball-update");
      socket.emit("leave-match", matchId);
    };
  }, [matchId]);

  return data;
}
