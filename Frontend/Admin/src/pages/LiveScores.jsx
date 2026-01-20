import React, { useEffect, useState } from "react";
import { initSocket, getSocket } from "../store/socket";
import api from "../services/api";

export default function LiveScores() {
  const [live, setLive] = useState([]);

  useEffect(() => {
    initSocket();
    const socket = getSocket();

    socket.on("scoreUpdate", (payload) => {
      setLive((s) => {
        const idx = s.findIndex((m) => m._id === payload._id);
        if (idx === -1) return [payload, ...s];
        const clone = [...s];
        clone[idx] = payload;
        return clone;
      });
    });

    // initial load from API
    api.get("/matches/live").then((res) => setLive(res.data)).catch(() => {});

    return () => {
      socket.off("scoreUpdate");
    };
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Live Scores</h2>

      <div className="space-y-3">
        {live.length === 0 && <div className="card">No live matches</div>}
        {live.map((m) => (
          <div key={m._id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{m.teamA} vs {m.teamB}</div>
              <div className="text-sm text-slate-500">{m.status || "Ongoing"}</div>
            </div>
            <div className="text-lg font-semibold">{m.score || "-"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}