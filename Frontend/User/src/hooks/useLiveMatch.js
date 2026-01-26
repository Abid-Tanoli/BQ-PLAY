import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io("http://localhost:5000");

export default function useLiveMatch(matchId) {
  const [data, setData] = useState(null);

  useEffect(() => {
    socket.emit("join-match", matchId);
    socket.on("ball-update", setData);

    return () => socket.off("ball-update");
  }, [matchId]);

  return data;
}
