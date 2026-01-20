import React from "react";

export default function TournamentTable() {
  // Placeholder: implement standings fetch/edit using API
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Tournament Table</h2>

      <div className="card">
        <div className="text-sm text-slate-500 mb-3">Standings grid (implement via API)</div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-sm text-slate-600">
              <th>Pos</th><th>Team</th><th>Played</th><th>W</th><th>L</th><th>PTS</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1</td><td>Team A</td><td>5</td><td>4</td><td>1</td><td>8</td></tr>
            <tr><td>2</td><td>Team B</td><td>5</td><td>3</td><td>2</td><td>6</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}