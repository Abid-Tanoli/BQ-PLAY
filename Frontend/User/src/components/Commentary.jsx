import { useEffect, useState } from "react";
import { socket } from "../services/api";

const Commentary = ({ matchId }) => {
  const [commentary, setCommentary] = useState([]);

  useEffect(() => {
    socket.emit("joinMatch", matchId);

    socket.on("updateCommentary", (data) => {
      setCommentary((prev) => [data, ...prev]);
    });

    return () => socket.off("updateCommentary");
  }, [matchId]);

  return (
    <div className="border p-4 rounded mt-4">
      <h2 className="font-bold">Live Commentary</h2>
      <ul className="space-y-1 mt-2">
        {commentary.map((c, i) => (
          <li key={i}>• {c.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default Commentary;
