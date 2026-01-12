import { useEffect, useState } from "react";
import { getPlayers, deletePlayer } from "../services/playerApi";

export default function PlayerList() {
  const [players, setPlayers] = useState([]);

  const loadPlayers = async () => setPlayers(await getPlayers());

  useEffect(() => { loadPlayers(); }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Players</h2>
      <table className="table-auto w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-2 py-1">Name</th>
            <th className="px-2 py-1">Team</th>
            <th className="px-2 py-1">Role</th>
            <th className="px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map(p => (
            <tr key={p._id} className="border-t">
              <td className="px-2 py-1">{p.name}</td>
              <td className="px-2 py-1">{p.team}</td>
              <td className="px-2 py-1">{p.role}</td>
              <td className="px-2 py-1">
                <button onClick={() => deletePlayer(p._id).then(loadPlayers)} className="text-red-500">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
