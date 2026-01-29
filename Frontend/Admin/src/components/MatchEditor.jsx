import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateScore } from "../store/slices/matchesSlice";
import api from "../services/api";
import { getSocket } from "../store/socket";

export default function MatchEditor({ matchId, onClose }) {
  const dispatch = useDispatch();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commentaryText, setCommentaryText] = useState("");

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

    const socket = getSocket();
    if (socket) {
      socket.on("match:update", (data) => {
        if (data.matchId === matchId) {
          fetchMatch();
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("match:update");
      }
    };
  }, [matchId]);

  const sendUpdate = async ({ runs = 0, wickets = 0, balls = 1, extras = 0, commentary = "" }) => {
    if (!match) return;
    setLoading(true);
    try {
      await dispatch(
        updateScore({
          matchId,
          inningsIndex: 0,
          runs,
          wickets,
          balls,
          extras,
          commentaryText: commentary,
        })
      );
      setCommentaryText("");
    } catch (err) {
      console.error(err);
      alert("Error sending update");
    } finally {
      setLoading(false);
    }
  };

  if (!match) {
    return <div className="text-center py-8">Loading match...</div>;
  }

  const innings = match.innings?.[0] || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-lg">
          <strong className="block text-slate-700 mb-2">{match.teams?.[0]?.name || "Team A"}</strong>
          <div className="text-2xl font-bold text-slate-800">
            {innings.runs || 0}/{innings.wickets || 0}
          </div>
          <div className="text-sm text-slate-500">({innings.overs || 0}.{innings.balls || 0} overs)</div>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg">
          <strong className="block text-slate-700 mb-2">{match.teams?.[1]?.name || "Team B"}</strong>
          <div className="text-2xl font-bold text-slate-800">
            {match.innings?.[1]?.runs || 0}/{match.innings?.[1]?.wickets || 0}
          </div>
          <div className="text-sm text-slate-500">
            ({match.innings?.[1]?.overs || 0}.{match.innings?.[1]?.balls || 0} overs)
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Quick Actions</label>
        <div className="grid grid-cols-4 gap-2">
          <button
            className="px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
            onClick={() => sendUpdate({ runs: 0, balls: 1, commentary: "Dot ball" })}
            disabled={loading}
          >
            0
          </button>
          <button
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            onClick={() => sendUpdate({ runs: 1, balls: 1, commentary: "1 run" })}
            disabled={loading}
          >
            1
          </button>
          <button
            className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            onClick={() => sendUpdate({ runs: 4, balls: 1, commentary: "FOUR!" })}
            disabled={loading}
          >
            4
          </button>
          <button
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            onClick={() => sendUpdate({ runs: 6, balls: 1, commentary: "SIX!" })}
            disabled={loading}
          >
            6
          </button>
          <button
            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors col-span-2"
            onClick={() => sendUpdate({ wickets: 1, balls: 1, commentary: "WICKET!" })}
            disabled={loading}
          >
            Wicket
          </button>
          <button
            className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors col-span-2"
            onClick={() => sendUpdate({ extras: 1, balls: 0, commentary: "Extra" })}
            disabled={loading}
          >
            Extra
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Custom Commentary</label>
        <div className="flex gap-2">
          <textarea
            className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={commentaryText}
            onChange={(e) => setCommentaryText(e.target.value)}
            placeholder="Enter live commentary..."
            rows={3}
          />
        </div>
        <button
          className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors"
          onClick={() => sendUpdate({ runs: 0, balls: 1, commentary: commentaryText })}
          disabled={loading || !commentaryText}
        >
          Send Commentary
        </button>
      </div>

      {innings.commentary && innings.commentary.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Recent Commentary</label>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {innings.commentary.slice(-5).reverse().map((c, i) => (
              <div key={i} className="p-2 bg-slate-50 rounded text-sm text-slate-700">
                {c.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {onClose && (
        <button
          onClick={onClose}
          className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg font-medium transition-colors"
        >
          Close
        </button>
      )}
    </div>
  );
}