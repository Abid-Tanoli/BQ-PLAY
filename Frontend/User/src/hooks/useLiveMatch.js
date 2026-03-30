import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function useLiveMatch(matchId) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.emit("join-match", matchId);
    socket.on("ball-update", setData);

    return () => {
      socket.off("ball-update");
      socket.disconnect();
    };
  }, [matchId]);

  return data;
}
