import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { io } from "socket.io-client";

export default function MatchEditor({ matchId }) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commentaryText, setCommentaryText] = useState("");

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(import.meta.env.VITE_API_URL || "http://localhost:5000");
    setSocket(s);

    s.emit("joinRoom", matchId);

    s.on("match:update", data => {
      if (data.matchId === matchId) {
        setMatch(prev => {
          if (!prev) return prev;
          const updated = { ...prev };
          updated.innings[data.inningsIndex] = data.innings;
          updated.status = data.status;
          return updated;
        });
      }
    });

    s.on("match:commentary", data => {
      if (data.matchId === matchId) {
        setMatch(prev => {
          if (!prev) return prev;
          const updated = { ...prev };
          updated.innings[0].commentary = updated.innings[0].commentary || [];
          updated.innings[0].commentary.push(data.commentary);
          return updated;
        });
      }
    });

    return () => {
      s.emit("leaveRoom", matchId);
      s.disconnect();
    };
  }, [matchId]);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await api.get(`/matches/${matchId}`);
        setMatch(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load match");
      }
    };
    fetchMatch();
  }, [matchId]);

  const sendUpdate = async ({ runs = 0, wickets = 0, balls = 1, extras = 0, commentary = "" }) => {
    if (!match) return;
    setLoading(true);
    try {
      await api.post(`/matches/${matchId}/score`, {
        inningsIndex: 0,
        runs,
        wickets,
        balls,
        extras,
        commentaryText: commentary
      });
      setCommentaryText("");
    } catch (err) {
      console.error(err);
      alert("Error sending update");
    } finally {
      setLoading(false);
    }
  };

  if (!match) return <div>Loading match...</div>;

  const innings = match.innings[0];

  return (
    <div className="match-editor p-4 border rounded space-y-4">
      <h4 className="text-lg font-semibold">{match.title}</h4>

      <div className="score grid grid-cols-2 gap-4">
        <div>
          <strong>{match.teams[0]?.name}</strong>
          <div>{innings.runs}/{innings.wickets} ({innings.overs}.{innings.balls})</div>
        </div>
        <div>
          <strong>{match.teams[1]?.name}</strong>
          <div>{match.innings[1]?.runs || 0}/{match.innings[1]?.wickets || 0} ({match.innings[1]?.overs || 0}.{match.innings[1]?.balls || 0})</div>
        </div>
      </div>

      <div className="controls flex gap-2">
        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => sendUpdate({ runs: 1, balls: 1, commentary: "1 run." })} disabled={loading}>+1</button>
        <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => sendUpdate({ runs: 4, balls: 1, commentary: "Boundary! 4 runs." })} disabled={loading}>+4</button>
        <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => sendUpdate({ runs: 6, balls: 1, commentary: "SIX!" })} disabled={loading}>+6</button>
        <button className="px-3 py-1 bg-gray-800 text-white rounded" onClick={() => sendUpdate({ wickets: 1, balls: 1, commentary: "WICKET!" })} disabled={loading}>W</button>
      </div>

      <div className="manual flex gap-2 mt-2">
        <textarea
          className="flex-1 p-2 border rounded"
          value={commentaryText}
          onChange={e => setCommentaryText(e.target.value)}
          placeholder="Enter live commentary"
        />
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded"
          onClick={() => sendUpdate({ runs: 0, balls: 1, commentary: commentaryText })}
          disabled={loading || !commentaryText}
        >
          Send
        </button>
      </div>

      <div className="commentary mt-4">
        <h5 className="font-medium mb-2">Live Commentary:</h5>
        <ul className="list-disc list-inside max-h-40 overflow-y-auto border p-2 rounded">
          {(innings.commentary || []).map((c, i) => <li key={i}>{c.text}</li>)}
        </ul>
      </div>
    </div>
  );
}
