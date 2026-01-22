import { useEffect, useState } from "react";
import { getPlayers, updatePlayer, deletePlayer } from "../services/playerApi";

export default function PlayerList() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");

  const load = async () => setPlayers(await getPlayers());

  useEffect(() => { load(); }, []);

  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <input
        className="border p-2 mb-3 w-full"
        placeholder="Search player..."
        onChange={e => setSearch(e.target.value)}
      />

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th>Name</th>
            <th>Team</th>
            <th>Runs</th>
            <th>Wickets</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map(p => (
            <tr key={p._id} className="border-t">
              <td>{p.name}</td>
              <td>{p.team?.name || "-"}</td>

              <td>
                <input
                  type="number"
                  defaultValue={p.stats?.runs}
                  className="border w-20"
                  onBlur={e =>
                    updatePlayer(p._id, {
                      stats: { ...p.stats, runs: +e.target.value }
                    })
                  }
                />
              </td>

              <td>
                <input
                  type="number"
                  defaultValue={p.stats?.wickets}
                  className="border w-20"
                  onBlur={e =>
                    updatePlayer(p._id, {
                      stats: { ...p.stats, wickets: +e.target.value }
                    })
                  }
                />
              </td>

              <td>
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
    </>
  );
}
