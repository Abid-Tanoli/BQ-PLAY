import React, { useEffect, useState } from "react";
import { initSocket, getSocket } from "../store/socket";
import api from "../services/api";

export default function ManageScore() {
  const [matches, setMatches] = useState([]);
  const [matchId, setMatchId] = useState("");
  const [score, setScore] = useState("");

  useEffect(() => {
    api.get("/matches").then((r) => setMatches(r.data)).catch(() => {});
    initSocket();
  }, []);

  const submit = async () => {
    if (!matchId) return;
    socket?.emit("updateScore", { matchId, score });
    setScore("");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Score</h2>

      <div className="card space-y-3">
        <select value={matchId} onChange={(e) => setMatchId(e.target.value)} className="w-full p-2 border rounded">
          <option value="">Select match</option>
          {matches.map((m) => <option key={m._id} value={m._id}>{m.teamA} vs {m.teamB}</option>)}
        </select>

        <input value={score} onChange={(e) => setScore(e.target.value)} placeholder="e.g. 170/4 (45.3)" className="w-full p-2 border rounded"/>

        <button onClick={submit} className="w-full bg-indigo-600 text-white p-2 rounded">Send Update</button>
      </div>
    </div>
  );
}