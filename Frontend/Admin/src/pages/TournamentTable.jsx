import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeams } from "../store/slices/teamSlice";
import { fetchMatches } from "../store/slices/matchesSlice";

export default function TournamentTable() {
  const dispatch = useDispatch();
  const { teams } = useSelector((state) => state.teams);
  const { matches } = useSelector((state) => state.matches);
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    dispatch(fetchTeams());
    dispatch(fetchMatches());
  }, [dispatch]);

  useEffect(() => {
    if (teams.length > 0 && matches.length > 0) {
      const teamStats = teams.map((team) => {
        const teamMatches = matches.filter(
          (m) =>
            (m.teams?.[0]?._id === team._id || m.teams?.[1]?._id === team._id) &&
            m.status === "completed"
        );

        let wins = 0;
        let losses = 0;
        let points = 0;

        teamMatches.forEach((match) => {
          const team1Score = match.innings?.[0]?.runs || 0;
          const team2Score = match.innings?.[1]?.runs || 0;
          const isTeam1 = match.teams?.[0]?._id === team._id;

          if ((isTeam1 && team1Score > team2Score) || (!isTeam1 && team2Score > team1Score)) {
            wins++;
            points += 2;
          } else {
            losses++;
          }
        });

        return {
          team: team.name,
          played: teamMatches.length,
          won: wins,
          lost: losses,
          points,
        };
      });

      teamStats.sort((a, b) => b.points - a.points || b.won - a.won);
      setStandings(teamStats);
    }
  }, [teams, matches]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Tournament Table</h2>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Points Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Pos</th>
                <th className="p-3 text-left">Team</th>
                <th className="p-3 text-center">Played</th>
                <th className="p-3 text-center">Won</th>
                <th className="p-3 text-center">Lost</th>
                <th className="p-3 text-center">Points</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, idx) => (
                <tr key={s.team} className={`border-t ${idx < 4 ? "bg-green-50" : ""}`}>
                  <td className="p-3 font-semibold text-center">{idx + 1}</td>
                  <td className="p-3 font-medium">{s.team}</td>
                  <td className="p-3 text-center">{s.played}</td>
                  <td className="p-3 text-center text-green-600 font-medium">{s.won}</td>
                  <td className="p-3 text-center text-red-600 font-medium">{s.lost}</td>
                  <td className="p-3 text-center font-bold">{s.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {standings.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No data available. Complete some matches to see standings.
            </div>
          )}
        </div>

        {standings.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Green highlighted teams qualify for playoffs. Points: Win = 2, Loss = 0
            </p>
          </div>
        )}
      </div>
    </div>
  );
}