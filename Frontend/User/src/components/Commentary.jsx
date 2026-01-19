import { useEffect, useState } from "react";
import { socket } from "../services/api";

export default function Commentary({ matchId }) {
  const [commentary, setCommentary] = useState([]);

  useEffect(() => {
    socket.emit("joinMatch", matchId);
    socket.on("updateCommentary", (data) => {
      setCommentary((prev) => [data, ...prev]);
    });
    return () => socket.off("updateCommentary");
  }, [matchId]);

  const safeCommentary = Array.isArray(commentary) ? commentary : [];

  return (
    <div className="bg-white p-4 rounded-xl shadow border border-gray-200 mt-4">
      <h2 className="text-xl font-bold mb-2">Live Commentary</h2>
      {safeCommentary.length === 0 ? (
        <p className="text-gray-500">No commentary yet...</p>
      ) : (
        <ul className="space-y-1">
          {safeCommentary.map((c, i) => (
            <li key={i} className="border-b last:border-b-0 pb-1">
              • {c.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
