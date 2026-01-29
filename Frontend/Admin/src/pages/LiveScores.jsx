import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMatches } from "../store/slices/matchesSlice";
import { initSocket } from "../store/socket";
import MatchEditor from "../components/MatchEditor";

export default function LiveScores() {
  const dispatch = useDispatch();
  const { matches, loading } = useSelector((state) => state.matches);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    dispatch(fetchMatches());

    const socket = initSocket();
    socket.on("match:update", () => {
      dispatch(fetchMatches());
    });

    return () => {
      socket.off("match:update");
    };
  }, [dispatch]);

  const liveMatches = matches.filter((m) => m.status === "live");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Live Scores</h2>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {liveMatches.length === 0 && !loading && (
        <div className="card text-center py-12">
          <svg
            className="w-16 h-16 text-slate-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="text-slate-500">No live matches at the moment</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {liveMatches.map((match) => (
          <div key={match._id} className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-slate-800">
                {match.teams?.[0]?.name || "Team A"} vs {match.teams?.[1]?.name || "Team B"}
              </h3>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                LIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">{match.teams?.[0]?.name || "Team A"}</p>
                <p className="text-2xl font-bold text-slate-800">
                  {match.innings?.[0]?.runs || 0}/{match.innings?.[0]?.wickets || 0}
                </p>
                <p className="text-sm text-slate-500">
                  ({match.innings?.[0]?.overs || 0}.{match.innings?.[0]?.balls || 0} overs)
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">{match.teams?.[1]?.name || "Team B"}</p>
                <p className="text-2xl font-bold text-slate-800">
                  {match.innings?.[1]?.runs || 0}/{match.innings?.[1]?.wickets || 0}
                </p>
                <p className="text-sm text-slate-500">
                  ({match.innings?.[1]?.overs || 0}.{match.innings?.[1]?.balls || 0} overs)
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedMatch(match)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Update Score
            </button>
          </div>
        ))}
      </div>

      {selectedMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Update Match Score</h3>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <MatchEditor matchId={selectedMatch._id} onClose={() => setSelectedMatch(null)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}