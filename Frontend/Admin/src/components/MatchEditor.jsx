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
  const [currentInnings, setCurrentInnings] = useState(0);

  useEffect(() => {
    fetchMatch();

    const socket = getSocket();
    if (socket) {
      socket.emit("join-match", matchId);

      socket.on("match:update", (data) => {
        if (data.matchId === matchId) {
          fetchMatch();
        }
      });

      socket.on("match:scoreUpdate", (data) => {
        if (data.matchId === matchId) {
          fetchMatch();
        }
      });

      socket.on("match:commentary", (data) => {
        if (data.matchId === matchId) {
          fetchMatch();
        }
      });
    }

    return () => {
      if (socket) {
        socket.emit("leave-match", matchId);
        socket.off("match:update");
        socket.off("match:scoreUpdate");
        socket.off("match:commentary");
      }
    };
  }, [matchId]);

  const fetchMatch = async () => {
    try {
      const res = await api.get(`/matches/${matchId}`);
      setMatch(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load match");
    }
  };

  const sendUpdate = async ({ runs = 0, wickets = 0, balls = 1, extras = 0, commentary = "" }) => {
    if (!match) return;
    setLoading(true);
    
    try {
      await dispatch(
        updateScore({
          matchId,
          inningsIndex: currentInnings,
          runs,
          wickets,
          balls,
          extras,
          commentaryText: commentary,
        })
      ).unwrap();
      
      setCommentaryText("");
    } catch (err) {
      console.error(err);
      alert(err || "Error sending update");
    } finally {
      setLoading(false);
    }
  };

  if (!match) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-slate-600">Loading match...</p>
      </div>
    );
  }

  const innings = match.innings?.[currentInnings] || {};
  const otherInnings = currentInnings === 0 ? match.innings?.[1] : match.innings?.[0];

  const getTeamName = (team) => {
    if (!team) return "Team";
    return typeof team === 'object' ? team.name : "Team";
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg">
        <h3 className="text-lg font-semibold">{match.title}</h3>
        <div className="flex items-center gap-4 mt-2 text-sm">
          {match.venue && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {match.venue}
            </span>
          )}
          <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
            {match.matchType || "T20"}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            match.status === "live" 
              ? "bg-green-500 animate-pulse" 
              : "bg-white/20"
          }`}>
            {match.status?.toUpperCase()}
          </span>
        </div>
      </div>

      {match.innings && match.innings.length > 1 && (
        <div className="flex gap-2">
          {match.innings.map((inn, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentInnings(idx)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                currentInnings === idx
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {getTeamName(inn.team)} Innings
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg border-2 ${
          currentInnings === 0 ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50"
        }`}>
          <p className="text-sm text-slate-600 mb-1">{getTeamName(match.innings?.[0]?.team)}</p>
          <div className="text-3xl font-bold text-slate-800">
            {match.innings?.[0]?.runs || 0}/{match.innings?.[0]?.wickets || 0}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            ({match.innings?.[0]?.overs || 0}.{match.innings?.[0]?.balls || 0} overs)
          </p>
        </div>
        
        <div className={`p-4 rounded-lg border-2 ${
          currentInnings === 1 ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50"
        }`}>
          <p className="text-sm text-slate-600 mb-1">{getTeamName(match.innings?.[1]?.team)}</p>
          <div className="text-3xl font-bold text-slate-800">
            {match.innings?.[1]?.runs || 0}/{match.innings?.[1]?.wickets || 0}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            ({match.innings?.[1]?.overs || 0}.{match.innings?.[1]?.balls || 0} overs)
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Quick Actions</label>
        <div className="grid grid-cols-4 gap-2">
          <button
            className="px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            onClick={() => sendUpdate({ runs: 0, balls: 1, commentary: "Dot ball" })}
            disabled={loading}
          >
            0
          </button>
          <button
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            onClick={() => sendUpdate({ runs: 1, balls: 1, commentary: "1 run" })}
            disabled={loading}
          >
            1
          </button>
          <button
            className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            onClick={() => sendUpdate({ runs: 4, balls: 1, commentary: "FOUR!" })}
            disabled={loading}
          >
            4
          </button>
          <button
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            onClick={() => sendUpdate({ runs: 6, balls: 1, commentary: "SIX!" })}
            disabled={loading}
          >
            6
          </button>
          <button
            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors col-span-2 disabled:opacity-50"
            onClick={() => sendUpdate({ wickets: 1, balls: 1, commentary: "WICKET!" })}
            disabled={loading}
          >
            Wicket
          </button>
          <button
            className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors col-span-2 disabled:opacity-50"
            onClick={() => sendUpdate({ extras: 1, balls: 0, commentary: "Extra (Wide/No Ball)" })}
            disabled={loading}
          >
            Extra
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Custom Commentary</label>
        <div className="space-y-2">
          <textarea
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={commentaryText}
            onChange={(e) => setCommentaryText(e.target.value)}
            placeholder="Enter live commentary..."
            rows={3}
          />
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
            onClick={() => sendUpdate({ runs: 0, balls: 1, commentary: commentaryText })}
            disabled={loading || !commentaryText}
          >
            {loading ? "Sending..." : "Send Commentary"}
          </button>
        </div>
      </div>

      {innings.commentary && innings.commentary.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Recent Commentary ({innings.commentary.length} updates)
          </label>
          <div className="max-h-40 overflow-y-auto space-y-2 bg-slate-50 p-3 rounded-lg">
            {innings.commentary.slice(-10).reverse().map((c, i) => (
              <div key={i} className="p-2 bg-white rounded text-sm text-slate-700 border border-slate-200">
                <span className="font-medium text-blue-600">{c.over}.{c.ball} </span>
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