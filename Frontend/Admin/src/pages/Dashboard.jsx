import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMatches } from "../store/slices/matchesSlice";
import { fetchPlayers } from "../store/slices/playersSlice";
import { fetchTeams } from "../store/slices/teamSlice";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { matches } = useSelector((state) => state.matches);
  const { players } = useSelector((state) => state.players);
  const { teams } = useSelector((state) => state.teams);
  const { user } = useSelector((state) => state.auth);

  const [stats, setStats] = useState({
    totalMatches: 0,
    liveMatches: 0,
    upcomingMatches: 0,
    completedMatches: 0,
  });

  useEffect(() => {
    dispatch(fetchMatches());
    dispatch(fetchPlayers());
    dispatch(fetchTeams());
  }, [dispatch]);

  useEffect(() => {
    if (matches.length > 0) {
      const live = matches.filter((m) => m.status === "live").length;
      const upcoming = matches.filter((m) => m.status === "upcoming").length;
      const completed = matches.filter((m) => m.status === "completed").length;

      setStats({
        totalMatches: matches.length,
        liveMatches: live,
        upcomingMatches: upcoming,
        completedMatches: completed,
      });
    }
  }, [matches]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome back, {user?.name || "Admin"}!
          </h1>
          <p className="text-slate-600 mt-1">
            Here's what's happening with your cricket management system today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Matches</p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalMatches}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Live Matches</p>
              <h3 className="text-3xl font-bold mt-2">{stats.liveMatches}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg
                className="w-8 h-8"
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
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Teams</p>
              <h3 className="text-3xl font-bold mt-2">{teams.length}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total Players</p>
              <h3 className="text-3xl font-bold mt-2">{players.length}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/matches" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Create Match</h3>
              <p className="text-sm text-slate-500">Schedule a new match</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/live" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
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
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Live Scores</h3>
              <p className="text-sm text-slate-500">View ongoing matches</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/players" className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Manage Players</h3>
              <p className="text-sm text-slate-500">Add or edit players</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Matches */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Recent Matches</h2>
          <Link
            to="/admin/matches"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="space-y-3">
         {matches.slice(0, 5).map((match) => (
  <Link
    key={match._id}
    to={`/admin/live/${match._id}`}
    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
  >
    <div>
      <p className="font-medium text-slate-800">
        {match.teams?.[0]?.name || "Team A"} vs{" "}
        {match.teams?.[1]?.name || "Team B"}
      </p>
      <p className="text-sm text-slate-500">
        {new Date(match.startAt).toLocaleDateString()}
      </p>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right text-sm">
        <div className="font-semibold">
          {match.innings?.[0]?.runs || 0}/{match.innings?.[0]?.wickets || 0}
        </div>
        <div className="text-xs text-slate-500">
          {match.innings?.[1]?.runs || 0}/{match.innings?.[1]?.wickets || 0}
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        match.status === "live"
          ? "bg-green-100 text-green-700"
          : match.status === "upcoming"
          ? "bg-blue-100 text-blue-700"
          : "bg-slate-200 text-slate-700"
      }`}>
        {match.status}
      </span>
    </div>
  </Link>
))}
          {matches.length === 0 && (
            <p className="text-center text-slate-500 py-8">No matches found</p>
          )}
        </div>
      </div>
    </div>
  );
}