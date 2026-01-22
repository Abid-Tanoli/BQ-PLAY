import { useEffect, useState } from "react";
import { getPlayers, deletePlayer } from "../services/playerApi";

export default function PlayerList() {
  const [players, setPlayers] = useState([]);

  const load = async () => setPlayers(await getPlayers());

  useEffect(() => { load(); }, []);

  return (
    <table className="w-full border">
      <thead className="bg-gray-200">
        <tr>
          <th className="p-2">Name</th>
          <th className="p-2">Role</th>
          <th className="p-2">Action</th>
        </tr>
      </thead>
      <tbody>
        {players.map(p => (
          <tr key={p._id} className="border-t">
            <td className="p-2">{p.name}</td>
            <td className="p-2">{p.role || "-"}</td>
            <td className="p-2">
              <button
                className="text-red-600"
                onClick={() => deletePlayer(p._id).then(load)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
